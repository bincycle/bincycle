"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Truck,
    BadgePercent,
    Wallet,
    Weight,
    UserCog,
    Image as ImageIcon,
    History,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
    AdminPageHeader,
    StatusChip,
    SectionCard,
    EmptyState,
} from "@/components/AdminUI";
import AssignExecutiveDialog, {
    type Executive,
} from "@/components/AssignExecutiveDialog";
import {
    findPickup,
    enrichPickup,
    getAdminTimeline,
    loadExecutives,
    findExecutive,
} from "@workspace/data/adminMock";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
}

interface Address {
    label: string;
    line1: string;
    city: string;
    pincode: string;
}

interface ExecutiveDetail extends Executive {
    phone: string;
    vehicle: string;
}

interface AssignmentHistoryEntry {
    action: string;
    executiveId: string;
    previousExecutiveId?: string;
    actor: string;
    at: string;
}

type TimelineState = "done" | "current" | "upcoming" | "cancelled";

interface TimelineStepData {
    key: string;
    label: string;
    state: TimelineState;
    at?: string;
}

interface Pickup {
    id: string;
    executiveId?: string;
    status: string;
    date: string;
    slot: string;
    amount: number;
    couponCode?: string;
    notes?: string;
    createdAt: string;
    customer?: Customer;
    address?: Address;
    executive?: ExecutiveDetail;
    weightKg?: number;
    paymentMethod?: string;
    paymentAt?: string;
    images?: string[];
    assignmentHistory?: AssignmentHistoryEntry[];
}

const TimelineStep = ({
    s,
    last,
}: {
    s: TimelineStepData;
    last: boolean;
}) => {
    const stateColor: Record<TimelineState, string> = {
        done: "bg-[#284226] border-[#284226]",
        current: "bg-[#C45B38] border-[#C45B38] animate-pulse",
        upcoming: "bg-white border-[#D1CDBC]",
        cancelled: "bg-[#171A15] border-[#171A15]",
    };
    return (
        <li className="relative pl-7 pb-5 last:pb-0">
            {!last && (
                <span className="absolute left-[9px] top-3 bottom-0 w-px bg-[#D1CDBC]" />
            )}
            <span
                className={`absolute left-1 top-1 h-3.5 w-3.5 rounded-full border-2 ${stateColor[s.state]}`}
            />
            <p
                className={`text-sm font-semibold ${
                    s.state === "upcoming"
                        ? "text-[#596155]"
                        : "text-[#121710]"
                }`}
            >
                {s.label}
            </p>
            {s.at && (
                <p className="text-xs text-[#596155] mt-0.5">
                    {format(parseISO(s.at), "EEE, d MMM · HH:mm")}
                </p>
            )}
        </li>
    );
};

const AdminPickupDetails = () => {
    const params = useParams();
    const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as
        | string
        | undefined;
    const router = useRouter();
    const [version, setVersion] = useState(0); // bump after assign
    const [assignOpen, setAssignOpen] = useState(false);

    const pickup: Pickup | null = useMemo(() => {
        const raw = findPickup(id);
        return raw ? enrichPickup(raw) : null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, version]);

    if (!pickup) {
        return (
            <div className="px-5 sm:px-8 lg:px-10 py-10">
                <Link
                    href="/pickups"
                    className="inline-flex items-center gap-2 text-sm text-[#596155] hover:text-[#121710] mb-6"
                >
                    <ArrowLeft size={14} /> Back to pickups
                </Link>
                <EmptyState
                    title="Pickup not found"
                    body="The booking ID you opened does not exist in this workspace."
                />
            </div>
        );
    }

    const timeline: TimelineStepData[] = getAdminTimeline(pickup);
    const execs: Executive[] = loadExecutives();

    return (
        <div
            data-testid="admin-pickup-details"
            className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10 space-y-6"
        >
            <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-[#596155] hover:text-[#121710]"
            >
                <ArrowLeft size={14} /> Back
            </button>

            <AdminPageHeader
                eyebrow={`[ booking · ${pickup.id} ]`}
                title={pickup.id}
                description={`${pickup.customer?.name || "—"} · ${format(
                    parseISO(pickup.date),
                    "EEE, d MMM yy"
                )} · ${pickup.slot}`}
                actions={
                    <button
                        type="button"
                        onClick={() => setAssignOpen(true)}
                        data-testid="open-assign-dialog"
                        className="inline-flex items-center gap-2 rounded-sm bg-[#171A15] px-4 py-2.5 text-sm text-[#F7F5F0] hover:bg-[#C45B38] transition-colors"
                    >
                        <UserCog size={14} />
                        {pickup.executiveId
                            ? "Reassign executive"
                            : "Assign executive"}
                    </button>
                }
            />

            <div className="flex items-center gap-3">
                <StatusChip status={pickup.status} />
                <p className="font-mono-label text-[11px] text-[#596155]">
                    Created{" "}
                    {format(parseISO(pickup.createdAt), "d MMM · HH:mm")}
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard testid="booking-info" title="Booking info">
                    <dl className="grid grid-cols-2 gap-y-3 text-sm">
                        <dt className="text-[#596155] font-mono-label text-[10px]">
                            Date
                        </dt>
                        <dd className="text-[#121710] text-right">
                            {format(parseISO(pickup.date), "d MMM yy")}
                        </dd>
                        <dt className="text-[#596155] font-mono-label text-[10px]">
                            Slot
                        </dt>
                        <dd className="text-[#121710] text-right">
                            {pickup.slot}
                        </dd>
                        <dt className="text-[#596155] font-mono-label text-[10px]">
                            Amount
                        </dt>
                        <dd className="text-[#121710] text-right font-display font-bold">
                            ₹{pickup.amount}
                        </dd>
                        <dt className="text-[#596155] font-mono-label text-[10px]">
                            Coupon
                        </dt>
                        <dd className="text-[#121710] text-right">
                            {pickup.couponCode ? (
                                <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#284226]/10 text-[#284226] border border-[#284226]/30 px-2 py-0.5 font-mono-label text-[10px]">
                                    <BadgePercent size={11} />
                                    {pickup.couponCode}
                                </span>
                            ) : (
                                <span className="text-[#596155]">—</span>
                            )}
                        </dd>
                    </dl>
                    {pickup.notes && (
                        <div className="mt-4 rounded-sm border border-dashed border-[#D1CDBC] bg-[#F7F5F0] p-3 text-xs text-[#596155]">
                            <p className="font-mono-label text-[10px] text-[#121710] mb-1">
                                Customer notes
                            </p>
                            {pickup.notes}
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    testid="customer-info"
                    title="Customer"
                    action={
                        pickup.customer && (
                            <Link
                                href={`/customers/${pickup.customer.id}`}
                                data-testid="view-customer"
                                className="text-xs text-[#C45B38] hover:underline"
                            >
                                Open profile →
                            </Link>
                        )
                    }
                >
                    {pickup.customer ? (
                        <div className="space-y-2.5 text-sm">
                            <p className="font-semibold text-[#121710]">
                                {pickup.customer.name}
                            </p>
                            <p className="flex items-center gap-2 text-[#596155]">
                                <Mail size={12} /> {pickup.customer.email}
                            </p>
                            <p className="flex items-center gap-2 text-[#596155]">
                                <Phone size={12} /> {pickup.customer.phone}
                            </p>
                            {pickup.address && (
                                <p className="flex items-start gap-2 text-[#596155]">
                                    <MapPin
                                        size={12}
                                        className="mt-0.5 shrink-0"
                                    />
                                    <span>
                                        {pickup.address.label} ·{" "}
                                        {pickup.address.line1},{" "}
                                        {pickup.address.city} —{" "}
                                        {pickup.address.pincode}
                                    </span>
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-[#596155]">
                            Customer record not found.
                        </p>
                    )}
                </SectionCard>

                <SectionCard
                    testid="executive-info"
                    title="Executive"
                    action={
                        pickup.executive && (
                            <Link
                                href={`/executives/${pickup.executive.id}`}
                                data-testid="view-executive"
                                className="text-xs text-[#C45B38] hover:underline"
                            >
                                Open profile →
                            </Link>
                        )
                    }
                >
                    {pickup.executive ? (
                        <div className="space-y-2.5 text-sm">
                            <p className="font-semibold text-[#121710]">
                                {pickup.executive.name}
                            </p>
                            <p className="text-[#596155]">
                                {pickup.executive.empId} ·{" "}
                                {pickup.executive.zone}
                            </p>
                            <p className="flex items-center gap-2 text-[#596155]">
                                <Phone size={12} /> {pickup.executive.phone}
                            </p>
                            <p className="flex items-center gap-2 text-[#596155]">
                                <Truck size={12} />{" "}
                                {pickup.executive.vehicle}
                            </p>
                        </div>
                    ) : (
                        <EmptyState
                            title="No executive assigned"
                            body="Use the Assign button above to dispatch this pickup."
                        />
                    )}
                </SectionCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard testid="pickup-timeline" title="Timeline">
                    <ol className="mt-2">
                        {timeline.map((s, i) => (
                            <TimelineStep
                                key={s.key}
                                s={s}
                                last={i === timeline.length - 1}
                            />
                        ))}
                    </ol>
                </SectionCard>

                <SectionCard testid="completion-details" title="Completion">
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between">
                            <span className="text-[#596155] flex items-center gap-2">
                                <Weight size={12} /> Weight collected
                            </span>
                            <span className="font-display font-bold text-[#121710]">
                                {pickup.weightKg
                                    ? `${pickup.weightKg} kg`
                                    : "—"}
                            </span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-[#596155] flex items-center gap-2">
                                <Wallet size={12} /> Payment method
                            </span>
                            <span className="text-[#121710] font-medium">
                                {pickup.paymentMethod
                                    ? pickup.paymentMethod.toUpperCase()
                                    : "—"}
                            </span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-[#596155] flex items-center gap-2">
                                <Calendar size={12} /> Paid at
                            </span>
                            <span className="text-[#121710]">
                                {pickup.paymentAt
                                    ? format(
                                          parseISO(pickup.paymentAt),
                                          "d MMM · HH:mm"
                                      )
                                    : "—"}
                            </span>
                        </li>
                    </ul>
                </SectionCard>

                <SectionCard testid="uploaded-images" title="Uploaded images">
                    {!pickup.images || pickup.images.length === 0 ? (
                        <div className="rounded-sm border border-dashed border-[#D1CDBC] bg-[#F7F5F0] p-6 text-center text-sm text-[#596155]">
                            <ImageIcon
                                size={18}
                                className="mx-auto mb-2 text-[#596155]"
                            />
                            No images attached to this pickup.
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {pickup.images.map((src, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={i}
                                    src={src}
                                    alt=""
                                    className="aspect-square w-full rounded-sm border border-[#D1CDBC] object-cover"
                                />
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            <SectionCard testid="assignment-history" title="Assignment history">
                {!pickup.assignmentHistory ||
                pickup.assignmentHistory.length === 0 ? (
                    <p className="text-sm text-[#596155]">
                        No assignment events for this booking yet.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {[...pickup.assignmentHistory]
                            .reverse()
                            .map((h, i) => {
                                const ex = findExecutive(h.executiveId);
                                const prev =
                                    h.previousExecutiveId &&
                                    findExecutive(h.previousExecutiveId);
                                return (
                                    <li
                                        key={i}
                                        data-testid={`assign-history-${i}`}
                                        className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3 text-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            <History
                                                size={14}
                                                className="text-[#596155] mt-0.5"
                                            />
                                            <div>
                                                <p className="text-[#121710] font-medium capitalize">
                                                    {h.action.replace(
                                                        "_",
                                                        " "
                                                    )}{" "}
                                                    →{" "}
                                                    {ex?.name || "Unknown"}
                                                </p>
                                                <p className="text-xs text-[#596155]">
                                                    {prev &&
                                                        `from ${prev.name} · `}
                                                    by {h.actor}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-mono-label text-[10px] text-[#596155]">
                                            {format(
                                                parseISO(h.at),
                                                "d MMM · HH:mm"
                                            )}
                                        </p>
                                    </li>
                                );
                            })}
                    </ul>
                )}
            </SectionCard>

            <AssignExecutiveDialog
                open={assignOpen}
                onOpenChange={setAssignOpen}
                pickup={pickup}
                executives={execs}
                onAssigned={() => setVersion((v) => v + 1)}
            />
        </div>
    );
};

export default AdminPickupDetails;
