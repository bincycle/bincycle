"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Pencil, X } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { toast } from "sonner";
import { getProfile, saveProfile } from "@workspace/data/accountStorage";
import { fileToDataUrl } from "@workspace/data/bookingPersistence";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+0-9\-\s]{7,18}$/;

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = ReturnType<typeof getProfile>;

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

export const ProfileTab = () => {
  const [initial, setInitial] = useState<Profile>(getProfile);
  const [form, setForm] = useState<Profile>(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const avatarInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormErrors])
      setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar must be under 2 MB.");
      return;
    }
    try {
      const url = await fileToDataUrl(file);
      setForm((f) => ({ ...f, avatar: url }));
    } catch {
      toast.error("Couldn't read that image.");
    }
  };

  const onSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      saveProfile(form);
      setInitial(form);
      setEditing(false);
      setSaving(false);
      toast.success("Profile saved.");
    }, 500);
  };

  const onCancel = () => {
    setForm(initial);
    setErrors({});
    setEditing(false);
  };

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
