"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    StickyNote,
    Image as ImageIcon,
    BadgePercent,
    Leaf,
    Loader2,
    type LucideIcon,
} from "lucide-react";
import { createClient } from "@workspace/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import PickupTimeline, { type PickupForTimeline } from "@/components/PickupTimeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
    id: string;
    label: string | null;
    address_line1: string;
    city: string;
    pincode: string;
}

interface Payment {
    amount: number;
    status: string;
    method: string | null;
    metadata: { coupon_code?: string; discount?: number } | null;
}

interface Pickup extends PickupForTimeline {
    id: string;
    pickup_id: string;
    notes: string | null;
    image_urls: string[] | null;
    total_amount: number;
    address: Address | null;
    payments: Payment[];
}

const SLOT_RANGES: Record<string, { range: string; label: string }> = {
    // slot_8_10: { range: "8 AM – 10 AM", label: "Morning" },
    // slot_10_12: { range: "10 AM – 12 PM", label: "Late Morning" },
    // slot_12_14: { range: "12 PM – 2 PM", label: "Noon" },
    // slot_14_16: { range: "2 PM – 4 PM", label: "Afternoon" },
    // slot_16_18: { range: "4 PM – 6 PM", label: "Evening" },
    // slot_18_20: { range: "6 PM – 8 PM", label: "Late Evening" },
    slot_8_12: { range: "8 AM – 12 PM", label: "Morning" },
    slot_18_22: { range: "6 PM – 10 PM", label: "Evening" },
};

const STATUS_META: Record<string, { label: string; chip: string; dot: string }> = {
    pending: { label: "Pending", chip: "border-[#D1CDBC] bg-[#F7F5F0] text-[#596155]", dot: "bg-[#596155]" },
    confirmed: { label: "Confirmed", chip: "border-[#284226]/30 bg-[#284226]/10 text-[#284226]", dot: "bg-[#284226]" },
    assigned: { label: "Assigned", chip: "border-[#284226]/30 bg-[#284226]/10 text-[#284226]", dot: "bg-[#284226]" },
    en_route: { label: "On the way", chip: "border-[#C45B38]/30 bg-[#C45B38]/10 text-[#C45B38]", dot: "bg-[#C45B38]" },
    arrived: { label: "Arrived", chip: "border-[#C45B38]/30 bg-[#C45B38]/10 text-[#C45B38]", dot: "bg-[#C45B38]" },
    collected: { label: "Collected", chip: "border-[#284226]/30 bg-[#284226]/10 text-[#284226]", dot: "bg-[#284226]" },
    completed: { label: "Completed", chip: "border-[#D1CDBC] bg-[#EDE9DC] text-[#121710]", dot: "bg-[#121710]" },
    cancelled: { label: "Cancelled", chip: "border-[#D1CDBC] bg-[#F7F5F0] text-[#596155]", dot: "bg-[#596155]" },
};

// ─── StatusChip ───────────────────────────────────────────────────────────────

const StatusChip = ({ status }: { status: string }) => {
    const meta = STATUS_META[status] ?? STATUS_META.pending;
    return (
        <span
            data-testid={`details-status-${status}`}
            className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono-label text-[10px] ${meta.chip}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
};

// ─── Field ────────────────────────────────────────────────────────────────────

interface FieldProps {
    icon: LucideIcon;
    label: string;
    children: React.ReactNode;
    testId?: string;
}

const Field = ({ icon: Icon, label, children, testId }: FieldProps) => (
    <div data-testid={testId} className="flex items-start gap-3">
        <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226] shrink-0">
            <Icon size={14} />
        </span>
        <div className="min-w-0 flex-1">
            <p className="font-mono-label text-[10px] text-[#596155]">{label}</p>
            <div className="mt-1 text-[#121710]">{children}</div>
        </div>
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const PickupDetails = () => {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [pickup, setPickup] = useState<Pickup | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundFlag, setNotFoundFlag] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // ── Auth ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) {
                router.replace("/login");
                return;
            }
            setUser(data.user);
        });
    }, []);

    // ── Fetch the pickup, joined with address + payments ──────────────────────
    const fetchPickup = useCallback(async () => {
        if (!user || !params.id) return;
        setLoading(true);

        const { data, error } = await supabase
            .from("pickups")
            .select(
                `
                id,
                pickup_id,
                status,
                scheduled_date,
                scheduled_slot,
                notes,
                image_urls,
                total_amount,
                picked_up_at,
                created_at,
                updated_at,
                cancellation_reason,
                address:addresses ( id, label, address_line1, city, pincode ),
                payments ( amount, status, method, metadata )
                `
            )
            .eq("pickup_id", params.id)
            .eq("customer_id", user.id)
            .maybeSingle<Pickup>();

        if (error) {
            console.error("Failed to fetch pickup:", error);
            setNotFoundFlag(true);
        } else if (!data) {
            setNotFoundFlag(true);
        } else {
            setPickup(data);
        }
        setLoading(false);
    }, [user?.id, params.id]);

    useEffect(() => {
        fetchPickup();
    }, [fetchPickup]);

    // ── Cancel ───────────────────────────────────────────────────────────────
    const cancelPickup = async () => {
        if (!pickup || !user) return;
        setCancelling(true);

        const { error } = await supabase
            .from("pickups")
            .update({
                status: "cancelled",
                cancelled_by: user.id,
                cancellation_reason: "Cancelled by customer",
                updated_at: new Date().toISOString(),
            })
            .eq("id", pickup.id)
            .eq("customer_id", user.id);

        if (error) {
            console.error("Failed to cancel pickup:", error);
        } else {
            setPickup((p) => (p ? { ...p, status: "cancelled" } : p));
        }
        setCancelling(false);
    };

    // ── Render states ───────────────────────────────────────────────────────
    if (notFoundFlag) notFound();

    if (loading || !pickup) {
        return (
            <div className="px-5 sm:px-10 lg:px-14 py-8 lg:py-12">
                <div className="h-5 w-28 rounded-sm bg-[#EDE9DC] animate-pulse mb-6" />
                <div className="h-12 w-72 rounded-sm bg-[#EDE9DC] animate-pulse mb-4" />
                <div className="h-6 w-96 rounded-sm bg-[#EDE9DC] animate-pulse" />
                <div className="mt-10 grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-48 rounded-sm bg-[#EDE9DC] animate-pulse" />
                        <div className="h-40 rounded-sm bg-[#EDE9DC] animate-pulse" />
                    </div>
                    <div className="lg:col-span-4">
                        <div className="h-72 rounded-sm bg-[#EDE9DC] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const slot = pickup.scheduled_slot ? SLOT_RANGES[pickup.scheduled_slot] : undefined;
    const d = parseISO(pickup.scheduled_date);
    const created = parseISO(pickup.created_at);

    const payment = pickup.payments?.[0];
    const discount = payment?.metadata?.discount ?? 0;
    const couponCode = payment?.metadata?.coupon_code;
    const total = Math.max(0, (pickup.total_amount ?? 0) - discount);

    const canModify = pickup.status === "pending" || pickup.status === "confirmed";

    return (
        <div
            data-testid="pickup-details-page"
            className="px-5 sm:px-10 lg:px-14 py-8 lg:py-12"
        >
            <Link
                href="/pickups"
                data-testid="details-back-link"
                className="inline-flex items-center gap-1.5 text-sm text-[#596155] hover:text-[#121710]"
            >
                <ArrowLeft size={14} /> All pickups
            </Link>

            {/* Header */}
            <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p
                        className="font-mono-label text-xs text-[#596155]"
                        data-testid="details-booking-id-label"
                    >
                        [ booking · {pickup.pickup_id} ]
                    </p>
                    <h1 className="mt-3 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                        Pickup detail
                    </h1>
                    <p className="mt-3 text-[#596155]">
                        Created{" "}
                        <span className="text-[#121710]">
                            {format(created, "d MMM yyyy")}
                        </span>{" "}
                        · scheduled for{" "}
                        <span className="text-[#121710]">
                            {format(d, "EEEE, d MMM")}
                        </span>
                    </p>
                </div>
                <StatusChip status={pickup.status} />
            </header>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
                {/* Main */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tracking timeline */}
                    <section
                        data-testid="details-section-timeline"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <p className="font-mono-label text-xs text-[#596155]">
                                01 · Tracking
                            </p>
                            <StatusChip status={pickup.status} />
                        </div>
                        <PickupTimeline pickup={pickup} />
                    </section>

                    {/* Schedule + Address */}
                    <section
                        data-testid="details-section-schedule"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8"
                    >
                        <p className="font-mono-label text-xs text-[#596155]">
                            02 · Schedule &amp; location
                        </p>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Field
                                icon={CalendarIcon}
                                label="Pickup date"
                                testId="details-field-date"
                            >
                                {format(d, "EEEE, d MMMM yyyy")}
                            </Field>
                            <Field
                                icon={Clock}
                                label="Time slot"
                                testId="details-field-slot"
                            >
                                {slot ? `${slot.range} · ${slot.label}` : "—"}
                            </Field>
                            <Field
                                icon={MapPin}
                                label="Pickup address"
                                testId="details-field-address"
                            >
                                {pickup.address ? (
                                    <>
                                        <p className="font-medium">{pickup.address.label}</p>
                                        <p className="text-sm text-[#596155] mt-0.5">
                                            {pickup.address.address_line1}, {pickup.address.city} —{" "}
                                            {pickup.address.pincode}
                                        </p>
                                    </>
                                ) : (
                                    "—"
                                )}
                            </Field>
                            <Field
                                icon={BadgePercent}
                                label="Status"
                                testId="details-field-status"
                            >
                                <StatusChip status={pickup.status} />
                            </Field>
                        </div>
                    </section>

                    {/* Notes */}
                    <section
                        data-testid="details-section-notes"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8"
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-mono-label text-xs text-[#596155]">
                                03 · Notes
                            </p>
                        </div>
                        <div className="mt-4 flex items-start gap-3">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226] shrink-0">
                                <StickyNote size={14} />
                            </span>
                            <p
                                className="text-[#121710] leading-relaxed"
                                data-testid="details-notes"
                            >
                                {pickup.notes ? (
                                    pickup.notes
                                ) : (
                                    <span className="text-[#596155] italic">
                                        No notes were added.
                                    </span>
                                )}
                            </p>
                        </div>
                    </section>

                    {/* Images */}
                    <section
                        data-testid="details-section-images"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <p className="font-mono-label text-xs text-[#596155]">
                                04 · Pictures
                            </p>
                            <p className="font-mono-label text-[10px] text-[#596155]">
                                {pickup.image_urls?.length ?? 0} attached
                            </p>
                        </div>
                        {pickup.image_urls && pickup.image_urls.length > 0 ? (
                            <div
                                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                                data-testid="details-images-grid"
                            >
                                {pickup.image_urls.map((url, i) => (
                                    <div
                                        key={url}
                                        className="overflow-hidden rounded-sm border border-[#D1CDBC]"
                                    >
                                        <img
                                            src={url}
                                            alt={`Pickup ${i + 1}`}
                                            className="h-32 w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                data-testid="details-images-empty"
                                className="flex items-center gap-3 rounded-sm border border-dashed border-[#D1CDBC] bg-[#F7F5F0] p-6 text-sm text-[#596155]"
                            >
                                <ImageIcon size={16} />
                                No pictures uploaded for this pickup.
                            </div>
                        )}
                    </section>
                </div>

                {/* Right summary */}
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-8 rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
                        <p className="font-mono-label text-xs text-[#596155]">Booking</p>
                        <p
                            className="mt-3 font-display text-2xl font-bold tracking-tight text-[#121710]"
                            data-testid="details-summary-id"
                        >
                            {pickup.pickup_id}
                        </p>

                        <dl className="mt-6 space-y-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-[#596155]">Pickup fee</dt>
                                <dd className="text-[#121710]">₹{pickup.total_amount}</dd>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-[#596155]">
                                        Discount{" "}
                                        {couponCode && (
                                            <span className="font-mono-label text-[10px] text-[#C45B38]">
                                                {couponCode}
                                            </span>
                                        )}
                                    </dt>
                                    <dd className="text-[#C45B38]">− ₹{discount}</dd>
                                </div>
                            )}
                        </dl>

                        <div className="mt-5 border-t border-[#D1CDBC] pt-5 flex items-end justify-between">
                            <div>
                                <p className="font-mono-label text-[10px] text-[#596155]">
                                    Total
                                </p>
                                <p
                                    className="font-display text-3xl font-black tracking-tight text-[#121710]"
                                    data-testid="details-summary-total"
                                >
                                    ₹{total}
                                </p>
                            </div>
                            <p className="text-xs text-[#596155]">GST included</p>
                        </div>

                        {canModify && (
                            <div className="mt-7 space-y-2">
                                <button
                                    type="button"
                                    data-testid="details-reschedule-btn"
                                    className="w-full rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors"
                                >
                                    Reschedule
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelPickup}
                                    disabled={cancelling}
                                    data-testid="details-cancel-btn"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-[#C45B38]/10 border border-[#C45B38]/40 px-4 py-3 text-sm font-medium text-[#C45B38] hover:bg-[#C45B38] hover:text-[#F7F5F0] transition-colors disabled:opacity-60"
                                >
                                    {cancelling && <Loader2 size={14} className="animate-spin" />}
                                    Cancel pickup
                                </button>
                            </div>
                        )}

                        {pickup.status === "completed" && (
                            <div className="mt-7 flex items-center gap-2 text-sm text-[#284226]">
                                <Leaf size={16} /> Thanks for recycling with Bincycle.
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default PickupDetails;
