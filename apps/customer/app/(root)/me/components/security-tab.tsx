"use client";

import { useMemo, useState, ChangeEvent } from "react";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import {
    Eye,
    EyeOff,
    Loader2,
    Check,
    AlertTriangle,
    Shield,
    ShieldCheck,
    Monitor,
    Smartphone,
    Laptop,
    LogOut,
    Trash2,
    KeyRound,
    LucideIcon,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    getSessions,
    saveSessions,
    mockLoginHistory,
    clearAllUserData,
} from "@workspace/data/accountStorage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Session {
    id: string;
    device: string;
    browser: string;
    platform: string;
    location: string;
    lastActiveAt: string;
    current: boolean;
}

interface LoginHistoryEntry {
    id: string;
    at: string;
    device: string;
    browser: string;
    location: string;
    status: "success" | "failed";
}

interface PasswordForm {
    current: string;
    next: string;
    confirm: string;
}

type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

interface Requirement {
    test: (p: string) => boolean;
    label: string;
}

interface SectionCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    testId?: string;
    tone?: "danger" | "default";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const scorePassword = (p: string): number => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
};

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"] as const;
const STRENGTH_COLOR = [
    "bg-[#D1CDBC]",
    "bg-[#C45B38]",
    "bg-[#C45B38]",
    "bg-[#284226]",
    "bg-[#284226]",
] as const;

const REQUIREMENTS: Requirement[] = [
    { test: (p) => p.length >= 8, label: "At least 8 characters" },
    { test: (p) => /[A-Z]/.test(p), label: "One uppercase letter" },
    { test: (p) => /[0-9]/.test(p), label: "One number" },
    { test: (p) => /[^A-Za-z0-9]/.test(p), label: "One symbol (optional)" },
];

const deviceIcon = (platform = ""): LucideIcon => {
    const p = platform.toLowerCase();
    if (p.includes("ios") || p.includes("android")) return Smartphone;
    if (p.includes("macos") || p.includes("windows")) return Laptop;
    return Monitor;
};

// ─── SectionCard ──────────────────────────────────────────────────────────────

const SectionCard = ({ title, description, children, testId, tone }: SectionCardProps) => (
    <section
        data-testid={testId}
        className={`rounded-sm border p-4 sm:p-6 lg:p-8 ${
            tone === "danger"
                ? "border-[#C45B38] bg-[#C45B38]/5"
                : "border-[#D1CDBC] bg-white"
        }`}
    >
        <div className="mb-4 sm:mb-5">
            <h3
                className={`font-display text-base sm:text-lg font-bold tracking-tight ${
                    tone === "danger" ? "text-[#C45B38]" : "text-[#121710]"
                }`}
            >
                {title}
            </h3>
            {description && (
                <p className="mt-1 text-xs sm:text-sm text-[#596155]">{description}</p>
            )}
        </div>
        {children}
    </section>
);

// ─── PasswordSection ──────────────────────────────────────────────────────────

const PasswordSection = () => {
    const [form, setForm] = useState<PasswordForm>({ current: "", next: "", confirm: "" });
    const [errors, setErrors] = useState<PasswordErrors>({});
    const [show, setShow] = useState(false);
    const [saving, setSaving] = useState(false);
    const strength = useMemo(() => scorePassword(form.next), [form.next]);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name as keyof PasswordForm]) {
            setErrors((er) => ({ ...er, [name]: undefined }));
        }
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const er: PasswordErrors = {};
        if (!form.current) er.current = "Enter your current password.";
        if (!form.next) er.next = "Choose a new password.";
        else if (form.next.length < 8) er.next = "Use at least 8 characters.";
        else if (strength < 2) er.next = "Add a number or capital for strength.";
        if (form.confirm !== form.next) er.confirm = "Passwords do not match.";
        setErrors(er);
        if (Object.keys(er).length) return;
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setForm({ current: "", next: "", confirm: "" });
            toast.success("Password updated.");
        }, 700);
    };

    return (
        <SectionCard
            testId="security-section-password"
            title="Password"
            description="Use a strong, unique password. We never see the unhashed value."
        >
            <form onSubmit={submit} data-testid="security-password-form" className="space-y-4">
                <div>
                    <Label className="font-mono-label text-xs text-[#596155]">
                        Current password
                    </Label>
                    <div className="relative mt-2">
                        <Input
                            name="current"
                            type={show ? "text" : "password"}
                            value={form.current}
                            onChange={onChange}
                            data-testid="security-password-current"
                            aria-invalid={!!errors.current}
                            className={`h-11 rounded-sm bg-white pr-12 ${
                                errors.current ? "border-[#C45B38]" : "border-[#D1CDBC]"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            aria-label="Toggle visibility"
                            data-testid="security-password-toggle"
                            className="absolute inset-y-0 right-0 grid place-items-center w-12 text-[#596155]"
                        >
                            {show ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                    {errors.current && (
                        <p className="mt-1 text-xs text-[#C45B38]">{errors.current}</p>
                    )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label className="font-mono-label text-xs text-[#596155]">
                            New password
                        </Label>
                        <Input
                            name="next"
                            type={show ? "text" : "password"}
                            value={form.next}
                            onChange={onChange}
                            data-testid="security-password-new"
                            aria-invalid={!!errors.next}
                            className={`mt-2 h-11 rounded-sm bg-white ${
                                errors.next ? "border-[#C45B38]" : "border-[#D1CDBC]"
                            }`}
                        />
                        {errors.next && (
                            <p className="mt-1 text-xs text-[#C45B38]">{errors.next}</p>
                        )}
                    </div>
                    <div>
                        <Label className="font-mono-label text-xs text-[#596155]">
                            Confirm
                        </Label>
                        <Input
                            name="confirm"
                            type={show ? "text" : "password"}
                            value={form.confirm}
                            onChange={onChange}
                            data-testid="security-password-confirm"
                            aria-invalid={!!errors.confirm}
                            className={`mt-2 h-11 rounded-sm bg-white ${
                                errors.confirm ? "border-[#C45B38]" : "border-[#D1CDBC]"
                            }`}
                        />
                        {errors.confirm && (
                            <p className="mt-1 text-xs text-[#C45B38]">{errors.confirm}</p>
                        )}
                    </div>
                </div>

                {form.next && (
                    <div data-testid="security-strength">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-1 gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-sm ${
                                            i < strength
                                                ? STRENGTH_COLOR[strength]
                                                : "bg-[#D1CDBC]"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="font-mono-label text-[10px] text-[#596155]">
                                {STRENGTH_LABEL[strength]}
                            </span>
                        </div>
                        <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                            {REQUIREMENTS.map((r) => {
                                const ok = r.test(form.next);
                                return (
                                    <li
                                        key={r.label}
                                        className={`flex items-center gap-1.5 ${
                                            ok ? "text-[#284226]" : "text-[#596155]"
                                        }`}
                                    >
                                        <Check
                                            size={12}
                                            className={ok ? "opacity-100" : "opacity-30"}
                                        />
                                        {r.label}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    data-testid="security-password-submit"
                    className="inline-flex items-center gap-2 rounded-sm bg-[#284226] px-4 py-2.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] disabled:opacity-60"
                >
                    {saving ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <KeyRound size={14} /> Update password
                        </>
                    )}
                </button>
            </form>
        </SectionCard>
    );
};

// ─── SessionsSection ──────────────────────────────────────────────────────────

const SessionsSection = () => {
    const [sessions, setSessions] = useState<Session[]>(getSessions);

    const persist = (list: Session[]) => {
        setSessions(list);
        saveSessions(list);
    };
    const signOutOne = (id: string) => {
        persist(sessions.filter((s) => s.id !== id));
        toast.success("Signed that session out.");
    };
    const signOutOthers = () => {
        persist(sessions.filter((s) => s.current));
        toast.success("Signed all other sessions out.");
    };

    return (
        <SectionCard
            testId="security-section-sessions"
            title="Active sessions"
            description="Devices currently signed into your Bincycle account."
        >
            <ul className="space-y-3" data-testid="security-sessions-list">
                {sessions.map((s) => {
                    const Icon = deviceIcon(s.platform);
                    return (
                        <li
                            key={s.id}
                            data-testid={`session-row-${s.id}`}
                            className="flex flex-col gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-white border border-[#D1CDBC] text-[#284226] shrink-0">
                                    <Icon size={16} />
                                </span>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-display text-base font-bold tracking-tight text-[#121710]">
                                            {s.device}
                                        </p>
                                        {s.current && (
                                            <span className="inline-flex items-center gap-1 rounded-sm border border-[#284226]/30 bg-[#284226]/10 px-1.5 py-0.5 font-mono-label text-[9px] text-[#284226]">
                                                <span className="h-1 w-1 rounded-full bg-[#284226]" />
                                                This device
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-[#596155]">
                                        {s.browser} · {s.platform} · {s.location}
                                    </p>
                                    <p className="mt-1 font-mono-label text-[10px] text-[#596155]">
                                        Last active{" "}
                                        {formatDistanceToNow(parseISO(s.lastActiveAt), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                </div>
                            </div>
                            {!s.current && (
                                <button
                                    type="button"
                                    onClick={() => signOutOne(s.id)}
                                    data-testid={`session-signout-${s.id}`}
                                    className="self-start inline-flex items-center gap-1.5 rounded-sm border border-[#C45B38]/40 bg-[#C45B38]/5 px-2.5 py-1.5 text-xs font-medium text-[#C45B38] hover:bg-[#C45B38] hover:text-[#F7F5F0]"
                                >
                                    <LogOut size={12} /> Sign out
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
            {sessions.filter((s) => !s.current).length > 0 && (
                <button
                    type="button"
                    onClick={signOutOthers}
                    data-testid="security-signout-others"
                    className="mt-5 inline-flex items-center gap-2 rounded-sm border border-[#121710] px-4 py-2.5 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0]"
                >
                    <LogOut size={14} /> Sign out of all other sessions
                </button>
            )}
        </SectionCard>
    );
};

// ─── LoginHistorySection ──────────────────────────────────────────────────────

const LoginHistorySection = () => (
    <SectionCard
        testId="security-section-history"
        title="Login history"
        description="The last few attempts on your account. Anything unfamiliar? Reset your password."
    >
        <ul className="space-y-2" data-testid="security-login-history">
            {(mockLoginHistory as LoginHistoryEntry[]).map((l) => (
                <li
                    key={l.id}
                    data-testid={`login-row-${l.id}`}
                    className="grid grid-cols-12 items-center gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3"
                >
                    <div className="col-span-12 sm:col-span-3">
                        <p className="text-sm text-[#121710]">
                            {format(parseISO(l.at), "d MMM, HH:mm")}
                        </p>
                        <p className="font-mono-label text-[10px] text-[#596155]">
                            {formatDistanceToNow(parseISO(l.at), { addSuffix: true })}
                        </p>
                    </div>
                    <div className="col-span-12 sm:col-span-3 text-sm text-[#121710]">
                        {l.device}
                    </div>
                    <div className="col-span-6 sm:col-span-3 text-xs text-[#596155]">
                        {l.browser}
                    </div>
                    <div className="col-span-6 sm:col-span-2 text-xs text-[#596155]">
                        {l.location}
                    </div>
                    <div className="col-span-12 sm:col-span-1 sm:text-right">
                        <span
                            className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono-label text-[9px] ${
                                l.status === "success"
                                    ? "border-[#284226]/30 bg-[#284226]/10 text-[#284226]"
                                    : "border-[#C45B38]/40 bg-[#C45B38]/10 text-[#C45B38]"
                            }`}
                        >
                            {l.status === "success" ? "Success" : "Failed"}
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    </SectionCard>
);

// ─── TwoFactorSection ─────────────────────────────────────────────────────────

const TwoFactorSection = () => {
    const [enabled, setEnabled] = useState(false);
    return (
        <SectionCard
            testId="security-section-2fa"
            title="Two-factor authentication"
            description="Add a second step at sign-in via SMS or an authenticator app."
        >
            <div className="flex items-center justify-between gap-4 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-4">
                <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-white border border-[#D1CDBC] text-[#284226]">
                        {enabled ? <ShieldCheck size={16} /> : <Shield size={16} />}
                    </span>
                    <div>
                        <p className="font-display text-base font-bold tracking-tight text-[#121710]">
                            2FA is{" "}
                            <span
                                data-testid="security-2fa-state"
                                className={enabled ? "text-[#284226]" : "text-[#596155]"}
                            >
                                {enabled ? "enabled" : "disabled"}
                            </span>
                        </p>
                        <p className="mt-1 text-xs text-[#596155]">
                            Coming soon — we'll guide you through the setup.
                        </p>
                    </div>
                </div>
                <Switch
                    checked={enabled}
                    onCheckedChange={(v) => {
                        setEnabled(v);
                        toast(v ? "2FA will be available soon." : "2FA toggled off.");
                    }}
                    data-testid="security-2fa-toggle"
                    aria-label="Toggle 2FA"
                    className="data-[state=checked]:bg-[#284226]"
                />
            </div>
        </SectionCard>
    );
};

// ─── DangerZoneSection ────────────────────────────────────────────────────────

const DangerZoneSection = () => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [pending, setPending] = useState(false);
    const router = useRouter();
    const canDelete = text.trim() === "DELETE";

    const onDelete = () => {
        if (!canDelete) return;
        setPending(true);
        setTimeout(() => {
            clearAllUserData();
            setPending(false);
            setOpen(false);
            toast.success("Account deleted. We'll miss you.");
            router.push("/login");
        }, 700);
    };

    return (
        <>
            <SectionCard
                testId="security-section-danger"
                tone="danger"
                title="Danger zone"
                description="Permanent actions live here. There's no undo."
            >
                <div className="flex flex-col gap-4 rounded-sm border border-[#C45B38]/40 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#C45B38]/10 text-[#C45B38]">
                            <AlertTriangle size={16} />
                        </span>
                        <div>
                            <p className="font-display text-base font-bold tracking-tight text-[#121710]">
                                Delete account
                            </p>
                            <p className="mt-1 text-sm text-[#596155]">
                                Erases your profile, addresses, drafts and pickup history on this
                                device.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        data-testid="security-delete-account-btn"
                        className="self-start inline-flex items-center gap-2 rounded-sm bg-[#C45B38] px-4 py-2.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B]"
                    >
                        <Trash2 size={14} /> Delete account
                    </button>
                </div>
            </SectionCard>

            <Dialog
                open={open}
                onOpenChange={(o) => {
                    if (!o) setText("");
                    setOpen(o);
                }}
            >
                <DialogContent
                    data-testid="delete-account-dialog"
                    className="rounded-sm border-[#C45B38] bg-[#F7F5F0] max-w-md p-6"
                >
                    <DialogHeader className="text-left space-y-1.5">
                        <p className="font-mono-label text-xs text-[#C45B38]">
                            Permanent action
                        </p>
                        <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
                            Delete your account?
                        </DialogTitle>
                        <DialogDescription className="text-[#596155]">
                            This wipes your profile, saved addresses, pickup drafts and history on
                            this device. Active pickups won't be cancelled automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-5">
                        <Label className="font-mono-label text-xs text-[#596155]">
                            Type{" "}
                            <span className="text-[#C45B38] font-bold">DELETE</span>{" "}
                            to confirm
                        </Label>
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="DELETE"
                            data-testid="delete-account-input"
                            autoFocus
                            className="mt-2 h-11 rounded-sm bg-white border-[#D1CDBC] focus-visible:ring-[#C45B38] tracking-widest"
                        />
                    </div>
                    <DialogFooter className="flex-row gap-2 mt-5">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            data-testid="delete-account-cancel-btn"
                            disabled={pending}
                            className="flex-1 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] disabled:opacity-60"
                        >
                            Keep my account
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={!canDelete || pending}
                            data-testid="delete-account-confirm-btn"
                            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-sm px-4 py-3 text-sm font-medium transition-colors ${
                                canDelete
                                    ? "bg-[#C45B38] text-[#F7F5F0] hover:bg-[#A64A2B]"
                                    : "bg-[#C45B38]/30 text-[#F7F5F0]/70 cursor-not-allowed"
                            } ${pending ? "opacity-70" : ""}`}
                        >
                            {pending ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={14} /> Delete account
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

// ─── SecurityTab ──────────────────────────────────────────────────────────────

export const SecurityTab = () => (
    <div data-testid="account-tab-security" className="space-y-4 sm:space-y-5">
        <header className="pb-4 sm:pb-6 mb-1 sm:mb-2 border-b border-[#D1CDBC]">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#121710]">
                Security
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#596155]">
                Keep your account safe. Updates here apply only on this device in this preview.
            </p>
        </header>
        <PasswordSection />
        <SessionsSection />
        <LoginHistorySection />
        <TwoFactorSection />
        <DangerZoneSection />
    </div>
);

export default SecurityTab;
