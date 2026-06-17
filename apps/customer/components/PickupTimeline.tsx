import { Check, CircleDashed, Truck, Recycle, X, type LucideIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickupForTimeline {
    status: string;
    created_at: string;
    scheduled_date: string;
    picked_up_at: string | null;
    updated_at: string;
    cancellation_reason?: string | null;
}

type StepState = "done" | "current" | "upcoming" | "cancelled";

interface TimelineStep {
    key: string;
    label: string;
    description: string;
    state: StepState;
    at: string | null;
}

interface PickupTimelineProps {
    pickup: PickupForTimeline;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ICONS: Record<string, LucideIcon> = {
    confirmed: Check,
    assigned: Truck,
    en_route: Truck,
    arrived: Truck,
    collected: Truck,
    completed: Recycle,
    cancelled: X,
};

// Linear progression through the pickups.status check constraint, minus the
// terminal branch (cancelled can happen from any state).
const STATUS_ORDER = [
    "pending",
    "confirmed",
    "assigned",
    "en_route",
    "arrived",
    "collected",
    "completed",
] as const;

const STEP_COPY: Record<string, { label: string; description: string }> = {
    pending: {
        label: "Booking received",
        description: "We've got your request and are lining up a partner.",
    },
    confirmed: {
        label: "Confirmed",
        description: "Your slot is locked in.",
    },
    assigned: {
        label: "Partner assigned",
        description: "A pickup partner has been assigned to your booking.",
    },
    en_route: {
        label: "On the way",
        description: "Your partner is heading to the pickup address.",
    },
    arrived: {
        label: "Arrived",
        description: "Your partner has reached your address.",
    },
    collected: {
        label: "Collected",
        description: "Items picked up and on the way to processing.",
    },
    completed: {
        label: "Completed",
        description: "Pickup wrapped up. Thanks for recycling with us.",
    },
};

// ─── Derive timeline steps from real pickup data ─────────────────────────────
// There's no separate timeline/events table — we infer progress from
// `status`, falling back to `updated_at` / `picked_up_at` / `created_at`
// for the "at" timestamp shown on each step.

const getPickupTimeline = (pickup: PickupForTimeline): TimelineStep[] => {
    if (pickup.status === "cancelled") {
        return [
            {
                key: "pending",
                label: STEP_COPY.pending.label,
                description: STEP_COPY.pending.description,
                state: "done",
                at: pickup.created_at,
            },
            {
                key: "cancelled",
                label: "Cancelled",
                description:
                    pickup.cancellation_reason || "This pickup was cancelled.",
                state: "cancelled",
                at: pickup.updated_at,
            },
        ];
    }

    const currentIdx = STATUS_ORDER.indexOf(
        pickup.status as (typeof STATUS_ORDER)[number]
    );
    // Unknown status — treat as just-started rather than crashing
    const safeIdx = currentIdx === -1 ? 0 : currentIdx;

    return STATUS_ORDER.map((key, idx) => {
        let state: StepState = "upcoming";
        if (idx < safeIdx) state = "done";
        else if (idx === safeIdx) state = "current";

        // Best-effort timestamp per step — only the first and current/collected
        // steps have a reliable source column; the rest are left blank.
        let at: string | null = null;
        if (key === "pending") at = pickup.created_at;
        else if (key === "collected" && pickup.picked_up_at) at = pickup.picked_up_at;
        else if (state === "current" || state === "done") at = pickup.updated_at;

        return {
            key,
            label: STEP_COPY[key].label,
            description: STEP_COPY[key].description,
            state,
            at,
        };
    });
};

// ─── Visual state → class mapping ────────────────────────────────────────────

const stateClasses = (state: StepState) => {
    if (state === "done")
        return {
            dot: "bg-[#284226] text-[#F7F5F0]",
            ring: "ring-[#284226]/20",
            label: "text-[#121710]",
            time: "text-[#596155]",
        };
    if (state === "current")
        return {
            dot: "bg-[#C45B38] text-[#F7F5F0]",
            ring: "ring-[#C45B38]/30 ring-4 animate-pulse",
            label: "text-[#121710] font-semibold",
            time: "text-[#C45B38]",
        };
    if (state === "cancelled")
        return {
            dot: "bg-[#C45B38] text-[#F7F5F0]",
            ring: "ring-[#C45B38]/20",
            label: "text-[#C45B38] font-semibold",
            time: "text-[#C45B38]",
        };
    return {
        dot: "bg-[#F7F5F0] text-[#596155] border border-[#D1CDBC]",
        ring: "",
        label: "text-[#596155]",
        time: "text-[#596155]",
    };
};

// ─── PickupTimeline ───────────────────────────────────────────────────────────

export const PickupTimeline = ({ pickup }: PickupTimelineProps) => {
    const steps = getPickupTimeline(pickup);
    if (!steps.length) return null;

    return (
        <ol data-testid="pickup-timeline" className="relative space-y-0">
            {steps.map((step, idx) => {
                const Icon =
                    step.state === "upcoming"
                        ? CircleDashed
                        : ICONS[step.key] || Check;
                const c = stateClasses(step.state);
                const last = idx === steps.length - 1;
                return (
                    <li
                        key={step.key}
                        data-testid={`timeline-step-${step.key}`}
                        data-state={step.state}
                        className="relative flex gap-4 pb-6 last:pb-0"
                    >
                        {/* connector line */}
                        {!last && (
                            <span
                                aria-hidden
                                className={`absolute left-[15px] top-9 bottom-0 w-px ${
                                    step.state === "done"
                                        ? "bg-[#284226]"
                                        : "bg-[#D1CDBC]"
                                }`}
                            />
                        )}
                        <span
                            className={`relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${c.dot} ${c.ring}`}
                        >
                            <Icon size={14} />
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p
                                    className={`font-display text-base tracking-tight ${c.label}`}
                                >
                                    {step.label}
                                </p>
                                {step.at && (
                                    <p className={`font-mono-label text-[10px] ${c.time}`}>
                                        {format(parseISO(step.at), "d MMM · HH:mm")}
                                    </p>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-[#596155]">
                                {step.description}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};

export default PickupTimeline;
