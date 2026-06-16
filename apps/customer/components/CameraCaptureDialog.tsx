"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Aperture, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { toast } from "sonner";

const FACING = { user: "user", environment: "environment" } as const;
type FacingMode = (typeof FACING)[keyof typeof FACING];

export interface CapturedImage {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (image: CapturedImage) => void;
}

/**
 * Camera capture dialog.
 * Uses navigator.mediaDevices.getUserMedia.
 * Calls onCapture(image) where image = { name, type, size, url } (data URL).
 */
export const CameraCaptureDialog = ({
  open,
  onOpenChange,
  onCapture,
}: CameraCaptureDialogProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facing, setFacing] = useState<FacingMode>(FACING.environment);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [shutter, setShutter] = useState(false);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const start = async (mode: FacingMode) => {
    setError("");
    setStarting(true);
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: { facingMode: { ideal: mode } },
    };
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Your browser doesn't support camera capture. Try Chrome or Safari on a recent device."
        );
        setStarting(false);
        return;
      }
      stop();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      const e = err as DOMException;
      if (e?.name === "NotAllowedError" || e?.name === "PermissionDeniedError") {
        setError(
          "Camera permission was blocked. Enable it in your browser settings and try again."
        );
      } else if (e?.name === "NotFoundError" || e?.name === "DevicesNotFoundError") {
        setError("No camera was found on this device.");
      } else if (e?.name === "NotReadableError") {
        setError("Camera is in use by another app. Close it and retry.");
      } else {
        setError(
          "Couldn't access your camera. Make sure the page is on HTTPS and try again."
        );
      }
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (open) {
      start(facing);
    } else {
      stop();
      setError("");
    }
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const flip = async () => {
    const next =
      facing === FACING.environment ? FACING.user : FACING.environment;
    setFacing(next);
    await start(next);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast.error("Camera isn't ready yet. Hold on a sec.");
      return;
    }
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", 0.85);
    const size = Math.round(
      (url.length - "data:image/jpeg;base64,".length) * 0.75
    );
    const name = `camera-${Date.now()}.jpg`;
    setShutter(true);
    setTimeout(() => setShutter(false), 160);
    onCapture({ name, type: "image/jpeg", size, url });
    toast.success("Photo captured.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="camera-dialog"
        className="rounded-sm border-[#171A15] bg-[#171A15] text-[#F7F5F0] max-w-2xl p-0 overflow-hidden"
      >
        <DialogHeader className="p-5 pb-3 border-b border-[#F7F5F0]/10">
          <p className="font-mono-label text-xs text-[#F7F5F0]/60">
            [ camera ]
          </p>
          <DialogTitle className="font-display text-xl font-black tracking-tight">
            Capture a photo
          </DialogTitle>
          <DialogDescription className="text-[#F7F5F0]/70">
            Hold steady and tap the shutter when you&apos;re ready.
          </DialogDescription>
        </DialogHeader>

        <div className="relative bg-[#0B0D09] aspect-[4/3] sm:aspect-video">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <Camera size={32} className="text-[#C45B38] mb-3" />
              <p className="font-display text-base font-bold tracking-tight">
                Can&apos;t open the camera
              </p>
              <p
                data-testid="camera-error"
                className="mt-1.5 text-sm text-[#F7F5F0]/70 max-w-sm"
              >
                {error}
              </p>
              <button
                type="button"
                onClick={() => start(facing)}
                data-testid="camera-retry"
                className="mt-5 inline-flex items-center gap-2 rounded-sm bg-[#C45B38] px-4 py-2 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B]"
              >
                <RefreshCw size={13} /> Try again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                data-testid="camera-video"
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 h-full w-full object-cover ${
                  facing === FACING.user ? "[transform:scaleX(-1)]" : ""
                }`}
              />
              {starting && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B0D09]/70">
                  <Loader2 size={28} className="text-[#F7F5F0] animate-spin" />
                </div>
              )}
              {shutter && (
                <div className="absolute inset-0 bg-white/80 animate-pulse" />
              )}
              <span className="absolute top-3 left-3 font-mono-label text-[10px] text-[#F7F5F0]/80 bg-[#171A15]/60 px-2 py-0.5 rounded-sm">
                {facing === FACING.user ? "FRONT CAM" : "REAR CAM"}
              </span>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex items-center justify-between gap-2 p-4 bg-[#171A15]">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            data-testid="camera-close"
            className="inline-flex items-center gap-1.5 rounded-sm border border-[#F7F5F0]/20 px-3 py-2 text-xs text-[#F7F5F0]/80 hover:bg-[#F7F5F0]/10"
          >
            <X size={12} /> Close
          </button>
          <button
            type="button"
            onClick={capture}
            disabled={!!error || starting}
            data-testid="camera-shutter"
            aria-label="Capture photo"
            className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#F7F5F0] text-[#171A15] ring-4 ring-[#F7F5F0]/20 hover:bg-[#C45B38] hover:text-[#F7F5F0] disabled:opacity-50 transition-colors"
          >
            <Aperture size={22} />
          </button>
          <button
            type="button"
            onClick={flip}
            disabled={!!error || starting}
            data-testid="camera-flip"
            className="inline-flex items-center gap-1.5 rounded-sm border border-[#F7F5F0]/20 px-3 py-2 text-xs text-[#F7F5F0]/80 hover:bg-[#F7F5F0]/10 disabled:opacity-50"
          >
            <RefreshCw size={12} /> Flip
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCaptureDialog;
