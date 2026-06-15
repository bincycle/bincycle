"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, Check, X, Crosshair } from "lucide-react";
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
import { toast } from "sonner";
import { getAddresses, saveAddresses } from "@workspace/data/accountStorage";
import LocationPickerDialog from "@/components/LocationPickerDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
    id: string;
    label: string;
    line1: string;
    city: string;
    pincode: string;
    lat: number | null;
    lng: number | null;
    displayName: string;
    isDefault: boolean;
}

type AddressFormData = Omit<Address, "id" | "isDefault">;

type FormErrors = Partial<Record<keyof AddressFormData, string>>;

interface PickedLocation {
    lat: number;
    lng: number;
    line1?: string;
    city?: string;
    pincode?: string;
    displayName?: string;
}

interface AddressFormProps {
    initial?: AddressFormData | null;
    onCancel: () => void;
    onSave: (data: AddressFormData) => void;
    submitting?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const blankForm: AddressFormData = {
    label: "",
    line1: "",
    city: "",
    pincode: "",
    lat: null,
    lng: null,
    displayName: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validate = (f: AddressFormData): FormErrors => {
    const e: FormErrors = {};
    if (!f.label.trim()) e.label = "Add a short label (Home, Office…).";
    if (!f.line1.trim()) e.line1 = "Street address is required.";
    if (!f.city.trim()) e.city = "City is required.";
    if (!/^\d{6}$/.test(f.pincode || "")) e.pincode = "6-digit pincode required.";
    return e;
};

// ─── AddressForm ──────────────────────────────────────────────────────────────

const AddressForm = ({ initial, onCancel, onSave, submitting }: AddressFormProps) => {
    const [form, setForm] = useState<AddressFormData>(initial ?? blankForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [mapOpen, setMapOpen] = useState(false);

    const onChange = (e: ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const submit = () => {
        const e = validate(form);
        setErrors(e);
        if (Object.keys(e).length === 0) onSave(form);
    };

    const applyPickedLocation = ({
        lat,
        lng,
        line1,
        city,
        pincode,
        displayName,
    }: PickedLocation) => {
        setForm((f) => ({
            ...f,
            lat,
            lng,
            displayName: displayName ?? f.displayName,
            line1: f.line1?.trim() ? f.line1 : line1 || f.line1,
            city: f.city?.trim() ? f.city : city || f.city,
            pincode:
                f.pincode?.trim() && /^\d{6}$/.test(f.pincode)
                    ? f.pincode
                    : pincode || f.pincode,
        }));
        setErrors({});
        toast.success("Location pinned.");
    };

    return (
        <div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label className="font-mono-label text-xs text-[#596155]">
                        Label
                    </Label>
                    <Input
                        name="label"
                        value={form.label}
                        onChange={onChange}
                        placeholder="Home"
                        data-testid="address-form-label"
                        aria-invalid={!!errors.label}
                        className={`mt-2 h-11 rounded-sm bg-white ${
                            errors.label ? "border-[#C45B38]" : "border-[#D1CDBC]"
                        }`}
                    />
                    {errors.label && (
                        <p className="mt-1 text-xs text-[#C45B38]">{errors.label}</p>
                    )}
                </div>
                <div>
                    <Label className="font-mono-label text-xs text-[#596155]">
                        Pincode
                    </Label>
                    <Input
                        name="pincode"
                        value={form.pincode}
                        onChange={onChange}
                        placeholder="560038"
                        data-testid="address-form-pincode"
                        aria-invalid={!!errors.pincode}
                        className={`mt-2 h-11 rounded-sm bg-white ${
                            errors.pincode ? "border-[#C45B38]" : "border-[#D1CDBC]"
                        }`}
                    />
                    {errors.pincode && (
                        <p className="mt-1 text-xs text-[#C45B38]">{errors.pincode}</p>
                    )}
                </div>
                <div className="sm:col-span-2">
                    <Label className="font-mono-label text-xs text-[#596155]">
                        Street address
                    </Label>
                    <Input
                        name="line1"
                        value={form.line1}
                        onChange={onChange}
                        placeholder="12, Hibiscus Lane, Indiranagar"
                        data-testid="address-form-line1"
                        aria-invalid={!!errors.line1}
                        className={`mt-2 h-11 rounded-sm bg-white ${
                            errors.line1 ? "border-[#C45B38]" : "border-[#D1CDBC]"
                        }`}
                    />
                    {errors.line1 && (
                        <p className="mt-1 text-xs text-[#C45B38]">{errors.line1}</p>
                    )}
                </div>
                <div>
                    <Label className="font-mono-label text-xs text-[#596155]">
                        City
                    </Label>
                    <Input
                        name="city"
                        value={form.city}
                        onChange={onChange}
                        placeholder="Bengaluru"
                        data-testid="address-form-city"
                        aria-invalid={!!errors.city}
                        className={`mt-2 h-11 rounded-sm bg-white ${
                            errors.city ? "border-[#C45B38]" : "border-[#D1CDBC]"
                        }`}
                    />
                    {errors.city && (
                        <p className="mt-1 text-xs text-[#C45B38]">{errors.city}</p>
                    )}
                </div>
                <div className="sm:col-span-2">
                    <div className="flex items-center justify-between gap-2 rounded-sm border border-dashed border-[#D1CDBC] bg-[#F7F5F0] p-3">
                        <div className="min-w-0 flex items-start gap-3">
                            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[#284226]/10 text-[#284226] shrink-0">
                                <MapPin size={14} />
                            </span>
                            <div className="min-w-0">
                                <p className="font-mono-label text-[10px] text-[#596155]">
                                    Pinpoint
                                </p>
                                {form.lat != null && form.lng != null ? (
                                    <>
                                        <p
                                            data-testid="address-form-coords"
                                            className="text-sm text-[#121710] truncate"
                                        >
                                            {form.displayName ||
                                                `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`}
                                        </p>
                                        <p className="font-mono-label text-[10px] text-[#596155]">
                                            {form.lat.toFixed(6)},{" "}
                                            {form.lng.toFixed(6)}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-[#596155]">
                                        No coordinates yet. Pin it on the map.
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMapOpen(true)}
                            data-testid="address-form-pin-on-map"
                            className="inline-flex items-center gap-1.5 rounded-sm border border-[#121710] px-3 py-2 text-xs text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] shrink-0"
                        >
                            <Crosshair size={12} />
                            {form.lat != null ? "Adjust on map" : "Pin on map"}
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-5 flex gap-2">
                <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    data-testid="address-form-save-btn"
                    className="inline-flex items-center gap-2 rounded-sm bg-[#284226] px-4 py-2.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] disabled:opacity-60"
                >
                    <Check size={14} /> Save address
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    data-testid="address-form-cancel-btn"
                    className="inline-flex items-center gap-2 rounded-sm border border-[#D1CDBC] px-4 py-2.5 text-sm font-medium text-[#596155] hover:border-[#121710] hover:text-[#121710]"
                >
                    <X size={14} /> Cancel
                </button>
            </div>
            <LocationPickerDialog
                open={mapOpen}
                onOpenChange={setMapOpen}
                initial={
                    form.lat != null && form.lng != null
                        ? { lat: form.lat, lng: form.lng }
                        : null
                }
                onConfirm={applyPickedLocation}
            />
        </div>
    );
};

// ─── AddressesTab ─────────────────────────────────────────────────────────────

export const AddressesTab = () => {
    const [list, setList] = useState<Address[]>(getAddresses);
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Address | null>(null);

    useEffect(() => {
        saveAddresses(list);
    }, [list]);

    const addAddress = (data: AddressFormData) => {
        const id = `addr_${Date.now()}`;
        const isDefault = list.length === 0;
        setList((prev) => [...prev, { id, ...data, isDefault }]);
        setAdding(false);
        toast.success("Address added.");
    };

    const updateAddress = (data: AddressFormData) => {
        setList((prev) =>
            prev.map((a) => (a.id === editingId ? { ...a, ...data } : a))
        );
        setEditingId(null);
        toast.success("Address updated.");
    };

    const removeAddress = () => {
        if (!confirmDelete) return;
        setList((prev) => {
            const next = prev.filter((a) => a.id !== confirmDelete.id);
            // If we removed the default, promote the first remaining.
            if (
                confirmDelete.isDefault &&
                next.length > 0 &&
                !next.some((a) => a.isDefault)
            ) {
                next[0] = { ...next[0], isDefault: true };
            }
            return next;
        });
        toast.success("Address removed.");
        setConfirmDelete(null);
    };

    const setDefault = (id: string) => {
        setList((prev) =>
            prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
        toast.success("Default address updated.");
    };

    return (
        <div data-testid="account-tab-addresses">
            <header className="flex items-start justify-between gap-4 pb-6 mb-6 border-b border-[#D1CDBC]">
                <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#121710]">
                        Saved addresses
                    </h2>
                    <p className="mt-1 text-sm text-[#596155]">
                        Manage the doorsteps we ring. Mark one as default to
                        speed up bookings.
                    </p>
                </div>
                {!adding && !editingId && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        data-testid="address-add-btn"
                        className="inline-flex items-center gap-2 rounded-sm bg-[#284226] px-3 py-2 text-xs font-medium text-[#F7F5F0] hover:bg-[#1C2E1A]"
                    >
                        <Plus size={12} /> Add address
                    </button>
                )}
            </header>

            {adding && (
                <div
                    data-testid="address-add-form"
                    className="mb-5 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-5"
                >
                    <p className="font-mono-label text-[10px] text-[#596155] mb-4">
                        New address
                    </p>
                    <AddressForm
                        onCancel={() => setAdding(false)}
                        onSave={addAddress}
                    />
                </div>
            )}

            {list.length === 0 ? (
                <div
                    data-testid="addresses-empty"
                    className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-10 text-center"
                >
                    <MapPin size={20} className="mx-auto text-[#596155]" />
                    <p className="mt-3 font-display text-lg text-[#121710]">
                        No addresses yet.
                    </p>
                    <p className="mt-1 text-sm text-[#596155]">
                        Add one to make bookings faster.
                    </p>
                </div>
            ) : (
                <ul className="space-y-3" data-testid="addresses-list">
                    {list.map((a) => (
                        <li
                            key={a.id}
                            data-testid={`address-item-${a.id}`}
                            className="rounded-sm border border-[#D1CDBC] bg-white p-5"
                        >
                            {editingId === a.id ? (
                                <AddressForm
                                    initial={a}
                                    onCancel={() => setEditingId(null)}
                                    onSave={updateAddress}
                                />
                            ) : (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226] shrink-0">
                                            <MapPin size={14} />
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-display text-base font-bold tracking-tight text-[#121710]">
                                                    {a.label}
                                                </p>
                                                {a.isDefault && (
                                                    <span
                                                        data-testid={`address-default-badge-${a.id}`}
                                                        className="inline-flex items-center gap-1 rounded-sm border border-[#284226]/30 bg-[#284226]/10 px-1.5 py-0.5 font-mono-label text-[9px] text-[#284226]"
                                                    >
                                                        <Star
                                                            size={9}
                                                            className="fill-[#284226]"
                                                        />
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-[#596155]">
                                                {a.line1}, {a.city} — {a.pincode}
                                            </p>
                                            {a.lat != null && a.lng != null && (
                                                <p
                                                    data-testid={`address-coords-${a.id}`}
                                                    className="mt-1 inline-flex items-center gap-1 font-mono-label text-[10px] text-[#284226]"
                                                >
                                                    <Crosshair size={10} />
                                                    {a.lat.toFixed(5)},{" "}
                                                    {a.lng.toFixed(5)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                        {!a.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() => setDefault(a.id)}
                                                data-testid={`address-set-default-${a.id}`}
                                                className="inline-flex items-center gap-1.5 rounded-sm border border-[#D1CDBC] px-2.5 py-1.5 text-xs text-[#596155] hover:border-[#121710] hover:text-[#121710]"
                                            >
                                                <Star size={12} /> Make default
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(a.id)}
                                            data-testid={`address-edit-${a.id}`}
                                            aria-label="Edit address"
                                            className="inline-flex items-center gap-1.5 rounded-sm border border-[#D1CDBC] px-2.5 py-1.5 text-xs text-[#596155] hover:border-[#121710] hover:text-[#121710]"
                                        >
                                            <Pencil size={12} /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete(a)}
                                            data-testid={`address-delete-${a.id}`}
                                            aria-label="Delete address"
                                            className="inline-flex items-center gap-1.5 rounded-sm border border-[#C45B38]/40 bg-[#C45B38]/5 px-2.5 py-1.5 text-xs text-[#C45B38] hover:bg-[#C45B38] hover:text-[#F7F5F0]"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <Dialog
                open={!!confirmDelete}
                onOpenChange={(o) => !o && setConfirmDelete(null)}
            >
                <DialogContent
                    data-testid="address-delete-dialog"
                    className="rounded-sm border-[#D1CDBC] bg-[#F7F5F0] max-w-md p-6"
                >
                    <DialogHeader className="text-left space-y-1.5">
                        <p className="font-mono-label text-xs text-[#596155]">
                            Delete address
                        </p>
                        <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
                            Remove &ldquo;{confirmDelete?.label}&rdquo;?
                        </DialogTitle>
                        <DialogDescription className="text-[#596155]">
                            Existing pickups using this address are unaffected,
                            but you won't be able to choose it for new bookings.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row gap-2 mt-5">
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            data-testid="address-delete-cancel"
                            className="flex-1 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors"
                        >
                            Keep it
                        </button>
                        <button
                            type="button"
                            onClick={removeAddress}
                            data-testid="address-delete-confirm"
                            className="flex-1 rounded-sm bg-[#C45B38] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B] transition-colors"
                        >
                            Delete address
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddressesTab;
