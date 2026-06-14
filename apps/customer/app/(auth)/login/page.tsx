"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { toast } from "sonner";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
    email: string;
    password: string;
    remember: boolean;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState<FormState>({
        email: "",
        password: "",
        remember: true,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [show, setShow] = useState(false);

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.email) e.email = "Email is required.";
        else if (!emailRe.test(form.email)) e.email = "Please enter a valid email.";
        if (!form.password) e.password = "Password is required.";
        else if (form.password.length < 8) e.password = "Use at least 8 characters.";
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
        // Mocked auth — frontend only
        setTimeout(() => {
            setSubmitting(false);
            toast.success("Signed in. Welcome back.");
            router.push("/dashboard/book-pickup");
        }, 900);
    };

    return (
        <div data-testid="login-page">
            <p className="font-mono-label text-xs text-[#596155]">
                [ sign in to bincycle ]
            </p>
            <h1 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                Welcome back.
            </h1>
            <p className="mt-3 text-[#596155]">
                New here?{" "}
                <Link
                    href="/register"
                    data-testid="login-link-register"
                    className="text-[#C45B38] font-medium hover:underline underline-offset-4"
                >
                    Create an account
                </Link>
                .
            </p>

            <form
                onSubmit={onSubmit}
                noValidate
                data-testid="login-form"
                className="mt-8 space-y-5"
            >
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
                        autoComplete="email"
                        value={form.email}
                        onChange={onChange}
                        data-testid="login-input-email"
                        placeholder="you@bincycle.in"
                        aria-invalid={!!errors.email}
                        className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
                            errors.email ? "border-[#C45B38]" : "border-[#D1CDBC]"
                        }`}
                    />
                    {errors.email && (
                        <p
                            data-testid="login-error-email"
                            className="mt-1.5 text-xs text-[#C45B38]"
                        >
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="password"
                            className="font-mono-label text-xs text-[#596155]"
                        >
                            Password
                        </Label>
                        <Link
                            href="/forgot-password"
                            data-testid="login-link-forgot"
                            className="text-xs text-[#596155] hover:text-[#C45B38]"
                        >
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative mt-2">
                        <Input
                            id="password"
                            name="password"
                            type={show ? "text" : "password"}
                            autoComplete="current-password"
                            value={form.password}
                            onChange={onChange}
                            data-testid="login-input-password"
                            placeholder="••••••••"
                            aria-invalid={!!errors.password}
                            className={`h-12 rounded-sm bg-white pr-12 focus-visible:ring-[#284226] ${
                                errors.password ? "border-[#C45B38]" : "border-[#D1CDBC]"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            data-testid="login-toggle-password"
                            aria-label={show ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-0 grid place-items-center w-12 text-[#596155] hover:text-[#121710]"
                        >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p
                            data-testid="login-error-password"
                            className="mt-1.5 text-xs text-[#C45B38]"
                        >
                            {errors.password}
                        </p>
                    )}
                </div>

                <label className="flex items-center gap-2 text-sm text-[#596155]">
                    <Checkbox
                        checked={form.remember}
                        onCheckedChange={(v) =>
                            setForm((f) => ({ ...f, remember: !!v }))
                        }
                        data-testid="login-remember-checkbox"
                        className="border-[#D1CDBC] data-[state=checked]:bg-[#284226] data-[state=checked]:border-[#284226]"
                    />
                    Keep me signed in on this device
                </label>

                <button
                    type="submit"
                    disabled={submitting}
                    data-testid="login-submit-btn"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-[#284226] px-5 py-3.5 text-sm font-medium text-[#F7F5F0] transition-colors hover:bg-[#1C2E1A] disabled:opacity-60"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Signing you in...
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-8 text-xs text-[#596155] leading-relaxed">
                By signing in you agree to our{" "}
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
            </p>
        </div>
    );
}
