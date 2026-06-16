import { useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    LucideIcon,
} from "lucide-react";
import { findPickupById, STATUS_META } from "@workspace/data/mockPickups";
import { savedAddresses, timeSlots } from "@workspace/data/mockData";
import PickupTimeline from "@/components/PickupTimeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
    id: string;
    label: string;
    line1: string;
    city: string;
    pincode: string;
}

interface TimeSlot {
    id: string;
    range: string;
    label: string;
}

interface PickupImage {
    url: string;
    name?: string;
}

interface Pickup {
    id: string;
    date: string;
    createdAt: string;
    status: string;
    addressId: string;
    slotId: string;
    notes?: string;
    images?: PickupImage[];
    fee: number;
    discount: number;
    couponCode?: string;
    kgPicked?: number;
    co2Saved?: number;
}

interface PageProps {
    params: { id: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const findAddress = (id: string): Address | undefined =>
    (savedAddresses as Address[]).find((a) => a.id === id);

const findSlot = (id: string): TimeSlot | undefined =>
    (timeSlots as TimeSlot[]).find((s) => s.id === id);

// ─── StatusChip ───────────────────────────────────────────────────────────────

interface StatusChipProps {
    status: string;
}

const StatusChip = ({ status }: StatusChipProps) => {
    const meta = STATUS_META[status] ?? STATUS_META.scheduled;
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

const PickupDetails = ({ params }: PageProps) => {
    const { id } = params;
    const pickup = findPickupById(id) as Pickup | undefined;

    if (!pickup) notFound();

    const addr = findAddress(pickup.addressId);
    const slot = findSlot(pickup.slotId);
    const d = parseISO(pickup.date);
    const created = parseISO(pickup.createdAt);
    const total = Math.max(0, (pickup.fee ?? 0) - (pickup.discount ?? 0));

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
                        [ booking · {pickup.id} ]
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
                                {addr ? (
                                    <>
                                        <p className="font-medium">{addr.label}</p>
                                        <p className="text-sm text-[#596155] mt-0.5">
                                            {addr.line1}, {addr.city} — {addr.pincode}
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
                                {pickup.images?.length ?? 0} attached
                            </p>
                        </div>
                        {pickup.images && pickup.images.length > 0 ? (
                            <div
                                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                                data-testid="details-images-grid"
                            >
                                {pickup.images.map((img, i) => (
                                    <div
                                        key={i}
                                        className="overflow-hidden rounded-sm border border-[#D1CDBC]"
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.name ?? `Pickup ${i + 1}`}
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

                    {/* Impact (if completed) */}
                    {pickup.status === "completed" &&
                        (pickup.kgPicked ?? pickup.co2Saved) && (
                            <section
                                data-testid="details-section-impact"
                                className="rounded-sm border border-[#D1CDBC] bg-[#171A15] text-[#F7F5F0] p-6 sm:p-8"
                            >
                                <p className="font-mono-label text-xs text-[#F7F5F0]/60">
                                    05 · Impact
                                </p>
                                <div className="mt-5 grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="font-display text-4xl font-black tracking-tighter">
                                            {pickup.kgPicked} kg
                                        </p>
                                        <p className="mt-2 text-xs text-[#F7F5F0]/60">
                                            Diverted from landfill
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-display text-4xl font-black tracking-tighter">
                                            {pickup.co2Saved} kg
                                        </p>
                                        <p className="mt-2 text-xs text-[#F7F5F0]/60">
                                            CO₂e saved via recycling
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}
                </div>

                {/* Right summary */}
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-8 rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
                        <p className="font-mono-label text-xs text-[#596155]">Booking</p>
                        <p
                            className="mt-3 font-display text-2xl font-bold tracking-tight text-[#121710]"
                            data-testid="details-summary-id"
                        >
                            {pickup.id}
                        </p>

                        <dl className="mt-6 space-y-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-[#596155]">Pickup fee</dt>
                                <dd className="text-[#121710]">₹{pickup.fee}</dd>
                            </div>
                            {pickup.discount > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-[#596155]">
                                        Discount{" "}
                                        {pickup.couponCode && (
                                            <span className="font-mono-label text-[10px] text-[#C45B38]">
                                                {pickup.couponCode}
                                            </span>
                                        )}
                                    </dt>
                                    <dd className="text-[#C45B38]">− ₹{pickup.discount}</dd>
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

                        {(pickup.status === "scheduled" ||
                            pickup.status === "in_progress") && (
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
                                    data-testid="details-cancel-btn"
                                    className="w-full rounded-sm bg-[#C45B38]/10 border border-[#C45B38]/40 px-4 py-3 text-sm font-medium text-[#C45B38] hover:bg-[#C45B38] hover:text-[#F7F5F0] transition-colors"
                                >
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
