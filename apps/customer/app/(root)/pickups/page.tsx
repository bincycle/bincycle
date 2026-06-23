"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowRight, Calendar, Clock, MapPin, Plus } from "lucide-react";
import { createClient } from "@workspace/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pickup {
    id: string;
    pickup_id: string;
    scheduled_date: string;
    status: string;
    scheduled_slot: string | null;
    address: {
        id: string;
        label: string | null;
        city: string;
    } | null;
}

type TabId = "upcoming" | "completed";

interface Tab {
    id: TabId;
    label: string;
}

// ─── Status metadata (kept local — purely presentational) ───────────────────

const STATUS_META: Record<string, { label: string; chip: string; dot: string }> = {
    pending: {
        label: "Pending",
        chip: "border-[#D1CDBC] bg-[#F7F5F0] text-[#596155]",
        dot: "bg-[#596155]",
    },
    confirmed: {
        label: "Confirmed",
        chip: "border-[#284226]/30 bg-[#284226]/10 text-[#284226]",
        dot: "bg-[#284226]",
    },
    assigned: {
        label: "Assigned",
        chip: "border-[#284226]/30 bg-[#284226]/10 text-[#284226]",
        dot: "bg-[#284226]",
    },
    en_route: {
        label: "On the way",
        chip: "border-[#C45B38]/30 bg-[#C45B38]/10 text-[#C45B38]",
        dot: "bg-[#C45B38]",
    },
    arrived: {
        label: "Arrived",
        chip: "border-[#C45B38]/30 bg-[#C45B38]/10 text-[#C45B38]",
        dot: "bg-[#C45B38]",
    },
    collected: {
        label: "Collected",
        chip: "border-[#284226]/30 bg-[#284226]/10 text-[#284226]",
        dot: "bg-[#284226]",
    },
    completed: {
        label: "Completed",
        chip: "border-[#D1CDBC] bg-[#EDE9DC] text-[#121710]",
        dot: "bg-[#121710]",
    },
    cancelled: {
        label: "Cancelled",
        chip: "border-[#D1CDBC] bg-[#F7F5F0] text-[#596155]",
        dot: "bg-[#596155]",
    },
};

const TERMINAL_STATUSES = new Set(["completed", "cancelled"]);
const isUpcoming = (p: Pickup) => !TERMINAL_STATUSES.has(p.status);

// Static slot label lookup — slot IDs map to fixed ranges set in the booking flow
const SLOT_RANGES: Record<string, string> = {
    slot_8_12: "8 AM – 12 PM",
    slot_18_22: "6 PM – 10 PM",
    // slot_10_12: "10 AM – 12 PM",
    // slot_12_14: "12 PM – 2 PM",
    // slot_14_16: "2 PM – 4 PM",
    // slot_16_18: "4 PM – 6 PM",
    // slot_18_20: "6 PM – 8 PM",
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
    status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const meta = STATUS_META[status] ?? STATUS_META.pending;
    return (
        <span
            data-testid={`status-badge-${status}`}
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono-label text-[10px] ${meta.chip}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
};

// ─── PickupRow ────────────────────────────────────────────────────────────────

interface PickupRowProps {
    p: Pickup;
}

const PickupRow = ({ p }: PickupRowProps) => {
    const d = parseISO(p.scheduled_date);
    const slotRange = p.scheduled_slot ? SLOT_RANGES[p.scheduled_slot] : undefined;
    return (
        <Link
            href={`/pickups/${p.pickup_id}`}
            data-testid={`pickup-row-${p.pickup_id}`}
            className="group grid grid-cols-12 items-center gap-4 rounded-sm border border-[#D1CDBC] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#284226]"
        >
            <div className="col-span-12 sm:col-span-3 flex flex-col gap-2">
                <p className="font-mono-label text-[10px] text-[#596155]">Booking</p>
                <p className="font-display text-lg font-bold tracking-tight text-[#121710]">
                    {p.pickup_id}
                </p>
                <StatusBadge status={p.status} />
            </div>
            <div className="col-span-12 sm:col-span-3 flex items-start gap-2">
                <Calendar size={14} className="text-[#596155] mt-0.5 shrink-0" />
                <div>
                    <p className="font-mono-label text-[10px] text-[#596155]">Date</p>
                    <p className="text-sm text-[#121710] mt-1">
                        {format(d, "EEE, d MMM yyyy")}
                    </p>
                </div>
            </div>
            <div className="col-span-6 sm:col-span-2 flex items-start gap-2">
                <Clock size={14} className="text-[#596155] mt-0.5 shrink-0" />
                <div>
                    <p className="font-mono-label text-[10px] text-[#596155]">Slot</p>
                    <p className="text-sm text-[#121710] mt-1">{slotRange ?? "—"}</p>
                </div>
            </div>
            <div className="col-span-6 sm:col-span-3 flex items-start gap-2">
                <MapPin size={14} className="text-[#596155] mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <p className="font-mono-label text-[10px] text-[#596155]">Address</p>
                    <p className="truncate text-sm text-[#121710] mt-1">
                        {p.address?.label ?? "—"} ·{" "}
                        <span className="text-[#596155]">{p.address?.city ?? ""}</span>
                    </p>
                </div>
            </div>
            <div className="col-span-12 sm:col-span-1 flex sm:justify-end">
                <span className="inline-flex items-center gap-1 text-sm text-[#596155] group-hover:text-[#284226]">
                    Details
                    <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5"
                    />
                </span>
            </div>
        </Link>
    );
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const PickupRowSkeleton = () => (
    <div className="grid grid-cols-12 items-center gap-4 rounded-sm border border-[#D1CDBC] bg-white p-5">
        <div className="col-span-12 sm:col-span-3 space-y-2">
            <div className="h-3 w-14 rounded-sm bg-[#EDE9DC] animate-pulse" />
            <div className="h-5 w-24 rounded-sm bg-[#EDE9DC] animate-pulse" />
        </div>
        <div className="col-span-12 sm:col-span-3 h-8 rounded-sm bg-[#EDE9DC] animate-pulse" />
        <div className="col-span-6 sm:col-span-2 h-8 rounded-sm bg-[#EDE9DC] animate-pulse" />
        <div className="col-span-6 sm:col-span-3 h-8 rounded-sm bg-[#EDE9DC] animate-pulse" />
        <div className="col-span-12 sm:col-span-1" />
    </div>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
];

// ─── Pickups page ─────────────────────────────────────────────────────────────

const Pickups = () => {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [all, setAll] = useState<Pickup[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<TabId>("upcoming");

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

    // ── Fetch pickups + joined address ──────────────────────────────────────
    const fetchPickups = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from("pickups")
            .select(
                `
                id,
                pickup_id,
                scheduled_date,
                scheduled_slot,
                status,
                address:addresses ( id, label, city )
                `
            )
            .eq("customer_id", user.id)
            .order("scheduled_date", { ascending: false })
            .returns<Pickup[]>();

        if (error) {
            console.error("Failed to fetch pickups:", error);
        } else {
            setAll(data ?? []);
        }
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        fetchPickups();
    }, [fetchPickups]);

    const list = useMemo(() => {
        if (tab === "upcoming") return all.filter(isUpcoming);
        return all.filter((p) => !isUpcoming(p));
    }, [all, tab]);

    const counts = useMemo(
        () => ({
            upcoming: all.filter(isUpcoming).length,
            completed: all.filter((p) => !isUpcoming(p)).length,
        }),
        [all]
    );

    return (
        <div
            data-testid="pickups-page"
            className="px-5 sm:px-10 lg:px-14 py-8 lg:py-12"
        >
            <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10">
                <div>
                    <p className="font-mono-label text-xs text-[#596155]">
                        [ dashboard · pickups ]
                    </p>
                    <h1 className="mt-3 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                        Your pickups
                    </h1>
                    <p className="mt-3 text-[#596155] max-w-2xl">
                        Everything on the calendar, and a clean record of what's already done.
                        Tap any row to see the details.
                    </p>
                </div>
                <Link
                    href="/book-pickup"
                    data-testid="pickups-new-cta"
                    className="self-start inline-flex items-center gap-2 rounded-sm bg-[#284226] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] transition-colors"
                >
                    <Plus size={16} /> New pickup
                </Link>
            </header>

            {/* Filter tabs */}
            <div
                role="tablist"
                data-testid="pickups-tabs"
                className="inline-flex items-center gap-1 rounded-sm border border-[#D1CDBC] bg-white p-1"
            >
                {TABS.map((t) => {
                    const active = tab === t.id;
                    return (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={active}
                            data-testid={`pickups-tab-${t.id}`}
                            onClick={() => setTab(t.id)}
                            className={`inline-flex items-center gap-2 rounded-sm px-3.5 py-2 text-sm transition-colors ${
                                active
                                    ? "bg-[#171A15] text-[#F7F5F0]"
                                    : "text-[#596155] hover:text-[#121710]"
                            }`}
                        >
                            {t.label}
                            <span
                                className={`font-mono-label text-[10px] ${
                                    active ? "text-[#F7F5F0]/70" : "text-[#596155]"
                                }`}
                            >
                                {counts[t.id]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* List */}
            <div className="mt-6 space-y-3" data-testid="pickups-list">
                {loading ? (
                    <>
                        <PickupRowSkeleton />
                        <PickupRowSkeleton />
                        <PickupRowSkeleton />
                    </>
                ) : list.length === 0 ? (
                    <div
                        data-testid="pickups-empty"
                        className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-10 text-center"
                    >
                        <p className="font-display text-xl text-[#121710]">
                            Nothing here yet.
                        </p>
                        <p className="mt-2 text-sm text-[#596155]">
                            {tab === "upcoming"
                                ? "Schedule your first pickup — it takes about 20 seconds."
                                : "Your completed pickups will appear here once partners wrap up."}
                        </p>
                        {tab === "upcoming" && (
                            <Link
                                href="/book-pickup"
                                data-testid="pickups-empty-cta"
                                className="mt-6 inline-flex items-center gap-2 rounded-sm bg-[#284226] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A]"
                            >
                                Book a pickup
                                <ArrowRight size={14} />
                            </Link>
                        )}
                    </div>
                ) : (
                    list.map((p) => <PickupRow key={p.pickup_id} p={p} />)
                )}
            </div>
        </div>
    );
};

export default Pickups;
