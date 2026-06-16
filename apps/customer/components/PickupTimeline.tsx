import { Check, CircleDashed, Truck, Recycle, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getPickupTimeline } from "@workspace/data/mockPickups";

const ICONS = {
    scheduled: Check,
    confirmed: Check,
    driver_assigned: Truck,
    in_progress: Truck,
    completed: Recycle,
    cancelled: X,
};

const stateClasses = (state) => {
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

export const PickupTimeline = ({ pickup }) => {
    const steps = getPickupTimeline(pickup);
    if (!steps.length) return null;

    return (
        <ol
            data-testid="pickup-timeline"
            className="relative space-y-0"
        >
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
                                    <p
                                        className={`font-mono-label text-[10px] ${c.time}`}
                                    >
                                        {format(
                                            parseISO(step.at),
                                            "d MMM · HH:mm"
                                        )}
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
