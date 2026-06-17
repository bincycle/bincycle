// app/api/upload-image/route.ts
//
// Handles image uploads to AWS S3. Runs server-side only, so AWS credentials
// never touch the browser bundle.
//
// Required env vars (add to .env.local):
//   AWS_REGION=ap-south-1
//   AWS_ACCESS_KEY_ID=...
//   AWS_SECRET_ACCESS_KEY=...
//   AWS_S3_BUCKET=your-bucket-name
//
// The bucket should have:
//   - A CORS policy allowing PUT from your domain
//   - Public read (or use presigned URLs if you want private images)
//
// Install: npm i @aws-sdk/client-s3

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@workspace/supabase/server";
import { cookies } from 'next/headers'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  // 1. Authenticate — only signed-in users may upload
  // const supabase = createClient();
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const pickupId = formData.get("pickupId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // 3. Validate
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 413 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 415 });
  }
  if (typeof pickupId !== "string" || !pickupId) {
    return NextResponse.json({ error: "pickupId is required" }, { status: 400 });
  }

  // 4. Ownership check — confirm the pickup belongs to this user
  //    This prevents one user from uploading images to another user's pickup.
  const { data: pickup, error: pickupError } = await supabase
    .from("pickups")
    .select("id")
    .eq("id", pickupId)
    .eq("customer_id", user.id)
    .single();

  if (pickupError || !pickup) {
    return NextResponse.json({ error: "Pickup not found" }, { status: 404 });
  }

  // 5. Build a scoped S3 key: pickups/{userId}/{pickupId}/{timestamp}-{filename}
  const ext = file.name.split(".").pop() ?? "jpg";
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, "_").slice(0, 64);
  const key = `pickups/${user.id}/${pickupId}/${Date.now()}-${safeName}`;

  // 6. Upload
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ContentLength: buffer.byteLength,
        // Tag with metadata for lifecycle policies / audit
        Tagging: `userId=${user.id}&pickupId=${pickupId}`,
      })
    );
  } catch (err) {
    console.error("S3 upload error:", err);
    return NextResponse.json({ error: "Upload to S3 failed" }, { status: 502 });
  }

  // 7. Return the public URL
  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return NextResponse.json({ url, key });
}
