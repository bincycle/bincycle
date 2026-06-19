"use client";

import { useState } from "react";
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
import { Loader2, UserPlus, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createExecutive, loadExecutives } from "@workspace/data/adminMock";

const ZONES = [
    "Bengaluru East",
    "Bengaluru West",
    "Bengaluru South",
    "Bengaluru North",
    "Mumbai West",
    "Mumbai East",
    "Gurugram",
    "Hyderabad",
    "Pune",
    "Kolkata",
    "Delhi NCR",
];

const randomPassword = (): string => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    return Array.from(
        { length: 10 },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
};

const nextEmpId = (): string => {
    const all = loadExecutives();
    const nums = all
        .map((e) => parseInt((e.empId || "").replace(/\D/g, ""), 10))
        .filter((n) => !Number.isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `EXEC-${String(next).padStart(4, "0")}`;
};

interface FormState {
    name: string;
    empId: string;
    email: string;
    phone: string;
    zone: string;
    vehicle: string;
    password: string;
}

interface FormErrors {
    name?: string;
    empId?: string;
    email?: string;
    phone?: string;
    zone?: string;
    password?: string;
}

interface CreateExecutiveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: (created: ReturnType<typeof createExecutive>) => void;
}

export const CreateExecutiveDialog = ({
    open,
    onOpenChange,
    onCreated,
}: CreateExecutiveDialogProps) => {
    const makeInitial = (): FormState => ({
        name: "",
        empId: nextEmpId(),
        email: "",
        phone: "",
        zone: ZONES[0],
        vehicle: "",
        password: randomPassword(),
    });

    const [form, setForm] = useState<FormState>(makeInitial);
    const [errors, setErrors] = useState<FormErrors>({});
    const [pending, setPending] = useState(false);
    const [showPwd, setShowPwd] = useState(true);

    const reset = () => {
        setForm(makeInitial());
        setErrors({});
    };

    const onChange = (k: keyof FormState, v: string) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k as keyof FormErrors]) {
            setErrors((er) => ({ ...er, [k]: undefined }));
        }
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const er: FormErrors = {};
        if (!form.name.trim()) er.name = "Required.";
        if (!form.empId.trim()) er.empId = "Required.";
        if (!form.email.trim()) er.email = "Required.";
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Invalid email.";
        if (!form.phone.trim()) er.phone = "Required.";
        else if (form.phone.replace(/\D/g, "").length < 10)
            er.phone = "Min 10 digits.";
        if (!form.zone) er.zone = "Required.";
        if (!form.password || form.password.length < 6)
            er.password = "Min 6 characters.";
        setErrors(er);
        if (Object.keys(er).length) return;

        setPending(true);
        setTimeout(() => {
            const created = createExecutive(form);
            setPending(false);
            toast.success(`Executive ${created.name} created.`);
            onCreated?.(created);
            onOpenChange(false);
            reset();
        }, 500);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) reset();
            }}
        >
            <DialogContent
                data-testid="create-exec-dialog"
                className="rounded-sm border-[#D1CDBC] bg-[#F7F5F0] max-w-lg p-6"
            >
                <DialogHeader className="text-left space-y-1.5">
                    <p className="font-mono-label text-xs text-[#596155]">
                        Onboarding
                    </p>
                    <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
                        Create executive
                    </DialogTitle>
                    <DialogDescription className="text-[#596155]">
                        Add a new pickup partner to your roster. A temporary
                        password will be issued.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={submit}
                    data-testid="create-exec-form"
                    noValidate
                    className="mt-4 space-y-4"
                >
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="font-mono-label text-[10px] text-[#596155]">
                                Full name
                            </Label>
                            <Input
                                value={form.name}
                                onChange={(e) => onChange("name", e.target.value)}
                                data-testid="exec-form-name"
                                placeholder="e.g. Suresh Kumar"
                                aria-invalid={!!errors.name}
                                className={`mt-1 h-10 rounded-sm bg-white border-[#D1CDBC] focus-visible:ring-[#284226] ${
                                    errors.name ? "border-[#C45B38]" : ""
                                }`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-[#C45B38]">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="font-mono-label text-[10px] text-[#596155]">
                                Employee ID
                            </Label>
                            <Input
                                value={form.empId}
                                onChange={(e) =>
                                    onChange("empId", e.target.value.toUpperCase())
                                }
                                data-testid="exec-form-empid"
                                placeholder="EXEC-XXXX"
                                aria-invalid={!!errors.empId}
                                className={`mt-1 h-10 rounded-sm bg-white border-[#D1CDBC] focus-visible:ring-[#284226] tracking-wider ${
                                    errors.empId ? "border-[#C45B38]" : ""
                                }`}
                            />
                            {errors.empId && (
                                <p className="mt-1 text-xs text-[#C45B38]">
                                    {errors.empId}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="font-mono-label text-[10px] text-[#596155]">
                                Email
                            </Label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(e) => onChange("email", e.target.value)}
                                data-testid="exec-form-email"
                                placeholder="name@bincycle.in"
                                aria-invalid={!!errors.email}
                                className={`mt-1 h-10 rounded-sm bg-white border-[#D1CDBC] focus-visible:ring-[#284226] ${
                                    errors.email ? "border-[#C45B38]" : ""
                                }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-[#C45B38]">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="font-mono-label text-[10px] text-[#596155]">
                                Phone
                            </Label>
                            <Input
                                value={form.phone}
                                onChange={(e) => onChange("phone", e.target.value)}
                                data-testid="exec-form-phone"
                                placeholder="+91 ..."
                                aria-invalid={!!errors.phone}
                                className={`mt-1 h-10 rounded-sm bg-white border-[#D1CDBC] focus-visible:ring-[#284226] ${
                                    errors.phone ? "border-[#C45B38]" : ""
                                }`}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-xs text-[#C45B38]">
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="font-mono-label text-[10px] text-[#596155]">
                                Assigned zone
                            </Label>
                            <select
                                value={form.zone}
                                onChange={(e) => onChange("zone", e.target.value)}
                                data-testid="exec-form-zone"
                                className="mt-1 w-full h-10 rounded-sm border border-[#D1CDBC] bg-white px-3 text-sm text-[#121710] focus:outline-none focus:ring-2 focus:ring-[#284226]"
                            >
                                {ZONES.map((z) => (
                                    <option key={z} value={z}>
                                        {z}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="font-mono-label text-[10px] text-[#596155]">
                                Vehicle (optional)
                            </Label>
                            <Input
                                value={form.vehicle}
                                onChange={(e) =>
                                    onChange("vehicle", e.target.value)
                                }
                                data-testid="exec-form-vehicle"
                                placeholder="EV-T-066"
                                className="mt-1 h-10 rounded-sm bg-white border-[#D1CDBC] focus-visible:ring-[#284226]"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="font-mono-label text-[10px] text-[#596155]">
                            Temporary password
                        </Label>
                        <div className="relative mt-1">
                            <Input
                                type={showPwd ? "text" : "password"}
                                value={form.password}
                                onChange={(e) =>
                                    onChange("password", e.target.value)
                                }
                                data-testid="exec-form-password"
                                aria-invalid={!!errors.password}
                                className={`h-10 rounded-sm bg-white pr-20 border-[#D1CDBC] focus-visible:ring-[#284226] font-mono-label ${
                                    errors.password ? "border-[#C45B38]" : ""
                                }`}
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((s) => !s)}
                                    data-testid="exec-form-show-pwd"
                                    className="rounded-sm p-1.5 text-[#596155] hover:text-[#121710]"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPwd ? (
                                        <EyeOff size={14} />
                                    ) : (
                                        <Eye size={14} />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange("password", randomPassword())
                                    }
                                    data-testid="exec-form-regen-pwd"
                                    className="rounded-sm p-1.5 text-[#596155] hover:text-[#121710]"
                                    aria-label="Regenerate password"
                                >
                                    <RefreshCw size={13} />
                                </button>
                            </div>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs text-[#C45B38]">
                                {errors.password}
                            </p>
                        )}
                        <p className="mt-1 font-mono-label text-[10px] text-[#596155]">
                            Share this with the partner. They'll change it on
                            first login.
                        </p>
                    </div>

                    <DialogFooter className="flex-row gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={pending}
                            data-testid="exec-form-cancel"
                            className="flex-1 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={pending}
                            data-testid="exec-form-submit"
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-sm bg-[#171A15] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#C45B38] transition-colors disabled:opacity-60"
                        >
                            {pending ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={14} />
                                    Create executive
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateExecutiveDialog;
