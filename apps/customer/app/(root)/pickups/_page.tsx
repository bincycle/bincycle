"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowRight, Calendar, Clock, MapPin, Plus } from "lucide-react";
import { loadAllPickups, STATUS_META, isUpcoming } from "@workspace/data/mockPickups";
import { savedAddresses, timeSlots } from "@workspace/data/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pickup {
    id: string;
    date: string;
    status: string;
    addressId: string;
    slotId: string;
}

interface Address {
    id: string;
    label: string;
    city: string;
}

interface TimeSlot {
    id: string;
    range: string;
}

type TabId = "upcoming" | "completed";

interface Tab {
    id: TabId;
    label: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const findAddress = (id: string): Address | undefined =>
    (savedAddresses as Address[]).find((a) => a.id === id);

const findSlot = (id: string): TimeSlot | undefined =>
    (timeSlots as TimeSlot[]).find((s) => s.id === id);

// ─── StatusBadge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
    status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const meta = STATUS_META[status] ?? STATUS_META.scheduled;
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
    const addr = findAddress(p.addressId);
    const slot = findSlot(p.slotId);
    const d = parseISO(p.date);
    return (
        <Link
            href={`/pickups/${p.id}`}
            data-testid={`pickup-row-${p.id}`}
            className="group grid grid-cols-12 items-center gap-4 rounded-sm border border-[#D1CDBC] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#284226]"
        >
            <div className="col-span-12 sm:col-span-3 flex flex-col gap-2">
                <p className="font-mono-label text-[10px] text-[#596155]">Booking</p>
                <p className="font-display text-lg font-bold tracking-tight text-[#121710]">
                    {p.id}
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
                    <p className="text-sm text-[#121710] mt-1">{slot?.range ?? "—"}</p>
                </div>
            </div>
            <div className="col-span-6 sm:col-span-3 flex items-start gap-2">
                <MapPin size={14} className="text-[#596155] mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <p className="font-mono-label text-[10px] text-[#596155]">Address</p>
                    <p className="truncate text-sm text-[#121710] mt-1">
                        {addr?.label ?? "—"} ·{" "}
                        <span className="text-[#596155]">{addr?.city ?? ""}</span>
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

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
];

// ─── Pickups page ─────────────────────────────────────────────────────────────

const Pickups = () => {
    const all = useMemo(() => loadAllPickups() as Pickup[], []);
    const [tab, setTab] = useState<TabId>("upcoming");

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
                {list.length === 0 ? (
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
                    list.map((p) => <PickupRow key={p.id} p={p} />)
                )}
            </div>
        </div>
    );
};

export default Pickups;
