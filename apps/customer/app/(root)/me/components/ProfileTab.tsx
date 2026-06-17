"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, Check, Loader2, Pencil, X } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { toast } from "sonner";
import { createClient } from "@workspace/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+0-9\-\s]{7,18}$/;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileRow {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  avatar: string; // local preview url or remote url
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

// ─── Shared tab header ────────────────────────────────────────────────────────

interface TabHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

const TabHeader = ({ title, description, action }: TabHeaderProps) => (
  <header className="flex items-start justify-between gap-4 pb-6 mb-6 border-b border-[#D1CDBC]">
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#121710]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#596155]">{description}</p>
    </div>
    {action}
  </header>
);

// ─── ProfileTab ───────────────────────────────────────────────────────────────

interface ProfileTabProps {
  user: SupabaseUser;
}

export const ProfileTab = ({ user }: ProfileTabProps) => {
  const supabase = createClient();

  const emptyForm: FormState = {
    name: "",
    email: user.email ?? "",
    phone: "",
    avatar: "",
  };

  const [initial, setInitial] = useState<FormState>(emptyForm);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);

  // ── Fetch profile from Supabase on mount ──────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url")
      .eq("id", user.id)
      .single<ProfileRow>();

    if (error) {
      toast.error("Couldn't load your profile.");
      setLoadingProfile(false);
      return;
    }

    const loaded: FormState = {
      name: data.full_name ?? "",
      email: user.email ?? "",
      phone: data.phone ?? "",
      avatar: data.avatar_url ?? "",
    };
    setInitial(loaded);
    setForm(loaded);
    setLoadingProfile(false);
  }, [user.id, user.email]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: FormErrors = {};
    if (!form.name?.trim()) e.name = "Please add your name.";
    if (!form.email) e.email = "Email is required.";
    else if (!emailRe.test(form.email)) e.email = "Please enter a valid email.";
    if (form.phone && !phoneRe.test(form.phone))
      e.phone = "That doesn't look like a valid phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Field change ──────────────────────────────────────────────────────────
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormErrors])
      setErrors((er) => ({ ...er, [name]: undefined }));
  };

  // ── Avatar selection (local preview only, upload happens on save) ─────────
  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar must be under 2 MB.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setForm((f) => ({ ...f, avatar: previewUrl }));
    setPendingAvatarFile(file);
  };

  // ── Upload avatar to Supabase Storage ─────────────────────────────────────
  const uploadAvatar = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      toast.error("Avatar upload failed.");
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Bust the CDN cache by appending a timestamp
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      let avatarUrl = initial.avatar;

      // 1. Upload avatar if a new file was picked
      if (pendingAvatarFile) {
        const uploaded = await uploadAvatar(pendingAvatarFile);
        if (!uploaded) {
          setSaving(false);
          return;
        }
        avatarUrl = uploaded;
        setPendingAvatarFile(null);
      }

      // 2. Update the profiles row
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: form.name.trim(),
          phone: form.phone.trim() || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 3. If email changed, update auth email (triggers confirmation email)
      if (form.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: form.email,
        });
        if (emailError) throw emailError;
        toast.info("Check your inbox to confirm your new email address.");
      }

      const saved: FormState = { ...form, avatar: avatarUrl };
      setInitial(saved);
      setForm(saved);
      setEditing(false);
      toast.success("Profile saved.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const onCancel = () => {
    setForm(initial);
    setErrors({});
    setPendingAvatarFile(null);
    setEditing(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loadingProfile) {
    return (
      <div data-testid="account-tab-profile" className="space-y-6">
        <div className="pb-6 mb-6 border-b border-[#D1CDBC]">
          <div className="h-7 w-32 rounded-sm bg-[#EDE9DC] animate-pulse mb-2" />
          <div className="h-4 w-72 rounded-sm bg-[#EDE9DC] animate-pulse" />
        </div>
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-[#EDE9DC] animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded-sm bg-[#EDE9DC] animate-pulse" />
            <div className="h-4 w-56 rounded-sm bg-[#EDE9DC] animate-pulse" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={i === 2 ? "sm:col-span-2" : ""}>
              <div className="h-3 w-20 rounded-sm bg-[#EDE9DC] animate-pulse mb-2" />
              <div className="h-12 rounded-sm bg-[#EDE9DC] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="account-tab-profile">
      <TabHeader
        title="Profile"
        description="The details we use to find your door and ping you about pickups."
        action={
          !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              data-testid="profile-edit-btn"
              className="inline-flex items-center gap-2 rounded-sm border border-[#121710] px-3 py-2 text-xs font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors"
            >
              <Pencil size={12} /> Edit
            </button>
          ) : null
        }
      />

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={form.avatar} alt={form.name} />
            <AvatarFallback>
              {form.name
                ?.split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {editing && (
            <>
              <button
                type="button"
                onClick={() => avatarInput.current?.click()}
                data-testid="profile-avatar-upload-btn"
                aria-label="Change avatar"
                className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[#284226] text-[#F7F5F0] hover:bg-[#1C2E1A] transition-colors"
              >
                <Camera size={14} />
              </button>
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                onChange={onAvatar}
                data-testid="profile-avatar-input"
                className="sr-only"
              />
            </>
          )}
        </div>
        <div className="min-w-0">
          <p
            className="font-display text-xl font-bold tracking-tight text-[#121710] truncate"
            data-testid="profile-display-name"
          >
            {initial.name}
          </p>
          <p className="text-sm text-[#596155] truncate">{initial.email}</p>
        </div>
      </div>

      {/* Form fields */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" className="font-mono-label text-xs text-[#596155]">
            Full name
          </Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={onChange}
            readOnly={!editing}
            data-testid="profile-input-name"
            className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
              errors.name ? "border-[#C45B38]" : "border-[#D1CDBC]"
            } ${!editing ? "bg-[#F7F5F0]" : ""}`}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-[#C45B38]">{errors.name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email" className="font-mono-label text-xs text-[#596155]">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            readOnly={!editing}
            data-testid="profile-input-email"
            className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
              errors.email ? "border-[#C45B38]" : "border-[#D1CDBC]"
            } ${!editing ? "bg-[#F7F5F0]" : ""}`}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-[#C45B38]">{errors.email}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="phone" className="font-mono-label text-xs text-[#596155]">
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            readOnly={!editing}
            data-testid="profile-input-phone"
            className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
              errors.phone ? "border-[#C45B38]" : "border-[#D1CDBC]"
            } ${!editing ? "bg-[#F7F5F0]" : ""}`}
          />
          {errors.phone && (
            <p className="mt-1.5 text-xs text-[#C45B38]">{errors.phone}</p>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-7 flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
            data-testid="profile-save-btn"
            className="inline-flex items-center gap-2 rounded-sm bg-[#284226] px-5 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={14} /> Save changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            data-testid="profile-cancel-btn"
            className="inline-flex items-center gap-2 rounded-sm border border-[#D1CDBC] px-5 py-3 text-sm font-medium text-[#596155] hover:border-[#121710] hover:text-[#121710] transition-colors disabled:opacity-60"
          >
            <X size={14} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
