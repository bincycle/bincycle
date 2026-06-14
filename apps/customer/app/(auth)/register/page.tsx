"use client";

import { useMemo, useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { toast } from "sonner";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+\-\s]{7,15}$/;

interface FormState {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirm: string;
    agree: boolean;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

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

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirm: "",
        agree: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [show, setShow] = useState(false);

    const strength = useMemo(() => scorePassword(form.password), [form.password]);

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.name.trim()) e.name = "Please tell us your name.";
        if (!form.email) e.email = "Email is required.";
        else if (!emailRe.test(form.email)) e.email = "Please enter a valid email.";
        if (form.phone && !phoneRe.test(form.phone))
            e.phone = "That doesn't look like a valid phone number.";
        if (!form.password) e.password = "Password is required.";
        else if (form.password.length < 8) e.password = "Use at least 8 characters.";
        else if (strength < 2) e.password = "Add a number or uppercase letter for strength.";
        if (!form.confirm) e.confirm = "Please confirm your password.";
        else if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
        if (!form.agree) e.agree = "Please accept the terms to continue.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
        if (errors[name as keyof FormState]) {
            setErrors((er) => ({ ...er, [name]: undefined }));
        }
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            toast.success("Account created. Let's book your first pickup.");
            router.push("/dashboard/book-pickup");
        }, 1000);
    };

    return (
        <div data-testid="register-page">
            <p className="font-mono-label text-xs text-[#596155]">
                [ create your account ]
            </p>
            <h1 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                Get picked up.
            </h1>
            <p className="mt-3 text-[#596155]">
                Already with us?{" "}
                <Link
                    href="/login"
                    data-testid="register-link-login"
                    className="text-[#C45B38] font-medium hover:underline underline-offset-4"
                >
                    Sign in
                </Link>
                .
            </p>

            <form
                onSubmit={onSubmit}
                noValidate
                data-testid="register-form"
                className="mt-8 space-y-5"
            >
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <Label
                            htmlFor="name"
                            className="font-mono-label text-xs text-[#596155]"
                        >
                            Full name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            data-testid="register-input-name"
                            placeholder="Aanya Rao"
                            aria-invalid={!!errors.name}
                            className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
                                errors.name ? "border-[#C45B38]" : "border-[#D1CDBC]"
                            }`}
                        />
                        {errors.name && (
                            <p
                                data-testid="register-error-name"
                                className="mt-1.5 text-xs text-[#C45B38]"
                            >
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label
                            htmlFor="phone"
                            className="font-mono-label text-xs text-[#596155]"
                        >
                            Phone (optional)
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            data-testid="register-input-phone"
                            placeholder="+91 98765 43210"
                            aria-invalid={!!errors.phone}
                            className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
                                errors.phone ? "border-[#C45B38]" : "border-[#D1CDBC]"
                            }`}
                        />
                        {errors.phone && (
                            <p
                                data-testid="register-error-phone"
                                className="mt-1.5 text-xs text-[#C45B38]"
                            >
                                {errors.phone}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <Label
                        htmlFor="email"
                        className="font-mono-label text-xs text-[#596155]"
                    >
                        Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        data-testid="register-input-email"
                        placeholder="you@bincycle.in"
                        aria-invalid={!!errors.email}
                        className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
                            errors.email ? "border-[#C45B38]" : "border-[#D1CDBC]"
                        }`}
                    />
                    {errors.email && (
                        <p
                            data-testid="register-error-email"
                            className="mt-1.5 text-xs text-[#C45B38]"
                        >
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <Label
                        htmlFor="password"
                        className="font-mono-label text-xs text-[#596155]"
                    >
                        Password
                    </Label>
                    <div className="relative mt-2">
                        <Input
                            id="password"
                            name="password"
                            type={show ? "text" : "password"}
                            value={form.password}
                            onChange={onChange}
                            data-testid="register-input-password"
                            placeholder="At least 8 characters"
                            aria-invalid={!!errors.password}
                            className={`h-12 rounded-sm bg-white pr-12 focus-visible:ring-[#284226] ${
                                errors.password ? "border-[#C45B38]" : "border-[#D1CDBC]"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            data-testid="register-toggle-password"
                            aria-label={show ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-0 grid place-items-center w-12 text-[#596155] hover:text-[#121710]"
                        >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {form.password && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex flex-1 gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        data-testid={`register-strength-bar-${i}`}
                                        className={`h-1 flex-1 rounded-sm ${
                                            i < strength
                                                ? STRENGTH_COLOR[strength]
                                                : "bg-[#D1CDBC]"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span
                                data-testid="register-strength-label"
                                className="font-mono-label text-[10px] text-[#596155]"
                            >
                                {STRENGTH_LABEL[strength]}
                            </span>
                        </div>
                    )}
                    {errors.password && (
                        <p
                            data-testid="register-error-password"
                            className="mt-1.5 text-xs text-[#C45B38]"
                        >
                            {errors.password}
                        </p>
                    )}
                </div>

                <div>
                    <Label
                        htmlFor="confirm"
                        className="font-mono-label text-xs text-[#596155]"
                    >
                        Confirm password
                    </Label>
                    <Input
                        id="confirm"
                        name="confirm"
                        type={show ? "text" : "password"}
                        value={form.confirm}
                        onChange={onChange}
                        data-testid="register-input-confirm"
                        placeholder="Re-enter your password"
                        aria-invalid={!!errors.confirm}
                        className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
                            errors.confirm ? "border-[#C45B38]" : "border-[#D1CDBC]"
                        }`}
                    />
                    {errors.confirm && (
                        <p
                            data-testid="register-error-confirm"
                            className="mt-1.5 text-xs text-[#C45B38]"
                        >
                            {errors.confirm}
                        </p>
                    )}
                </div>

                <label className="flex items-start gap-2 text-sm text-[#596155]">
                    <Checkbox
                        checked={form.agree}
                        onCheckedChange={(v) =>
                            setForm((f) => ({ ...f, agree: !!v }))
                        }
                        data-testid="register-agree-checkbox"
                        className="mt-0.5 border-[#D1CDBC] data-[state=checked]:bg-[#284226] data-[state=checked]:border-[#284226]"
                    />
                    <span>
                        I agree to Bincycle's{" "}
                        <Link
                            href="/terms-of-service"
                            className="underline underline-offset-2 hover:text-[#121710]"
                        >
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy-policy"
                            className="underline underline-offset-2 hover:text-[#121710]"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </span>
                </label>
                {errors.agree && (
                    <p
                        data-testid="register-error-agree"
                        className="-mt-3 text-xs text-[#C45B38]"
                    >
                        {errors.agree}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    data-testid="register-submit-btn"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-[#284226] px-5 py-3.5 text-sm font-medium text-[#F7F5F0] transition-colors hover:bg-[#1C2E1A] disabled:opacity-60"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        <>
                            Create account
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
