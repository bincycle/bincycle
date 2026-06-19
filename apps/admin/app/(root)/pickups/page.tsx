"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Input } from "@workspace/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import {
    AdminPageHeader,
    StatusChip,
    EmptyState,
} from "@/components/AdminUI";
import { createClient } from "@workspace/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateRangeKey = "any" | "today" | "week" | "month" | "past";

interface DateRange {
    id: DateRangeKey;
    label: string;
}

interface Pickup {
    id: string;
    pickup_id: string;
    status: string;
    scheduled_date: string;
    scheduled_slot: string | null;
    total_amount: number;
    customer?: { full_name: string; email: string };
    executive?: { full_name: string; id: string };
}

interface Executive {
    id: string;
    full_name: string;
}

interface Customer {
    id: string;
    full_name: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const dateRanges: DateRange[] = [
    { id: "any", label: "Any date" },
    { id: "today", label: "Today" },
    { id: "week", label: "This week" },
    { id: "month", label: "This month" },
    { id: "past", label: "Past 30 days" },
];

const STATUS_OPTIONS = [
    "pending",
    "confirmed",
    "assigned",
    "en_route",
    "arrived",
    "collected",
    "completed",
    "cancelled",
];

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    assigned: "Assigned",
    en_route: "En route",
    arrived: "Arrived",
    collected: "Collected",
    completed: "Completed",
    cancelled: "Cancelled",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inRange = (iso: string, key: DateRangeKey): boolean => {
    if (key === "any") return true;
    const d = new Date(iso);
    const n = new Date();
    n.setHours(0, 0, 0, 0);

    if (key === "today") {
        return (
            d.getFullYear() === n.getFullYear() &&
            d.getMonth() === n.getMonth() &&
            d.getDate() === n.getDate()
        );
    }
    if (key === "week") {
        const start = new Date(n);
        start.setDate(n.getDate() - n.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return d >= start && d < end;
    }
    if (key === "month") {
        return (
            d.getFullYear() === n.getFullYear() &&
            d.getMonth() === n.getMonth()
        );
    }
    if (key === "past") {
        const thirty = new Date(n);
        thirty.setDate(n.getDate() - 30);
        return d >= thirty;
    }
    return true;
};

// ─── Admin Pickups page ────────────────────────────────────────────────────────

const AdminPickups = () => {
    const supabase = createClient();

    const [q, setQ] = useState("");
    const [status, setStatus] = useState("all");
    const [dateKey, setDateKey] = useState<DateRangeKey>("any");
    const [execFilter, setExecFilter] = useState("all");
    const [custFilter, setCustFilter] = useState("all");

    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [executives, setExecutives] = useState<Executive[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Fetch all data ─────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const [
                { data: pickupsData },
                { data: exeData },
                { data: custData },
            ] = await Promise.all([
                // Pickups with customer and executive joined
                supabase
                    .from("pickups")
                    .select(
                        `
                        id,
                        pickup_id,
                        status,
                        scheduled_date,
                        scheduled_slot,
                        total_amount,
                        customer:profiles!customer_id ( full_name, email ),
                        executive:profiles!executive_id ( full_name, id )
                        `
                    )
                    .order("created_at", { ascending: false }),
                // All executives
                supabase
                    .from("profiles")
                    .select("id, full_name")
                    .eq("role", "executive")
                    .order("full_name", { ascending: true }),
                // All customers
                supabase
                    .from("profiles")
                    .select("id, full_name")
                    .eq("role", "customer")
                    .order("full_name", { ascending: true }),
            ]);

            // Normalize nested arrays from joins to single objects
            const normalized = (pickupsData ?? []).map((p) => ({
                ...p,
                customer: Array.isArray(p.customer)
                    ? p.customer[0]
                    : p.customer,
                executive: Array.isArray(p.executive)
                    ? p.executive[0]
                    : p.executive,
            }));

            setPickups(normalized);
            setExecutives(exeData ?? []);
            setCustomers(custData ?? []);
        } catch (err) {
            console.error("Failed to fetch pickups data:", err);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Filter logic ───────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return pickups.filter((p) => {
            if (status !== "all" && p.status !== status) return false;
            if (execFilter !== "all" && p.executive?.id !== execFilter)
                return false;
            if (custFilter !== "all" && p.customer?.email !== custFilter)
                return false;
            if (!inRange(p.scheduled_date, dateKey)) return false;
            if (qq) {
                const blob = [
                    p.pickup_id,
                    p.customer?.full_name,
                    p.customer?.email,
                    p.executive?.full_name,
                    p.executive?.id,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                if (!blob.includes(qq)) return false;
            }
            return true;
        });
    }, [pickups, q, status, dateKey, execFilter, custFilter]);

    const clearAll = () => {
        setQ("");
        setStatus("all");
        setDateKey("any");
        setExecFilter("all");
        setCustFilter("all");
    };

    const hasActive =
        q ||
        status !== "all" ||
        dateKey !== "any" ||
        execFilter !== "all" ||
        custFilter !== "all";

    if (loading) {
        return (
            <div
                data-testid="admin-pickups-page"
                className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10"
            >
                <AdminPageHeader
                    eyebrow="[ admin · pickups ]"
                    title="All pickups"
                    description="Search, filter and drill into every booking across the network."
                />
                <div className="mt-6 space-y-3">
                    <div className="h-10 rounded-sm bg-[#EDE9DC] animate-pulse" />
                    <div className="h-64 rounded-sm bg-[#EDE9DC] animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="admin-pickups-page"
            className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10"
        >
            <AdminPageHeader
                eyebrow="[ admin · pickups ]"
                title="All pickups"
                description="Search, filter and drill into every booking across the network."
            />

            {/* Filter bar */}
            <div
                data-testid="pickups-filters"
                className="rounded-sm border border-[#D1CDBC] bg-white p-3 sm:p-4 mb-4"
            >
                <div className="grid gap-2 lg:grid-cols-12">
                    {/* Search */}
                    <div className="lg:col-span-4 relative">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#596155]"
                        />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            data-testid="pickups-search"
                            placeholder="Search by ID, customer, executive"
                            className="h-10 pl-9 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
                        />
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger
                                data-testid="pickups-filter-status"
                                className="h-10 rounded-sm border-[#D1CDBC] focus:ring-[#284226]"
                            >
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All status</SelectItem>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {STATUS_LABELS[s] || s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date range */}
                    <div className="lg:col-span-2">
                        <Select
                            value={dateKey}
                            onValueChange={(v) =>
                                setDateKey(v as DateRangeKey)
                            }
                        >
                            <SelectTrigger
                                data-testid="pickups-filter-date"
                                className="h-10 rounded-sm border-[#D1CDBC] focus:ring-[#284226]"
                            >
                                <SelectValue placeholder="Date" />
                            </SelectTrigger>
                            <SelectContent>
                                {dateRanges.map((dr) => (
                                    <SelectItem key={dr.id} value={dr.id}>
                                        {dr.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Executive */}
                    <div className="lg:col-span-2">
                        <Select value={execFilter} onValueChange={setExecFilter}>
                            <SelectTrigger
                                data-testid="pickups-filter-executive"
                                className="h-10 rounded-sm border-[#D1CDBC] focus:ring-[#284226]"
                            >
                                <SelectValue placeholder="Executive" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All executives</SelectItem>
                                {executives.map((e) => (
                                    <SelectItem key={e.id} value={e.id}>
                                        {e.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Customer */}
                    <div className="lg:col-span-2">
                        <Select value={custFilter} onValueChange={setCustFilter}>
                            <SelectTrigger
                                data-testid="pickups-filter-customer"
                                className="h-10 rounded-sm border-[#D1CDBC] focus:ring-[#284226]"
                            >
                                <SelectValue placeholder="Customer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All customers</SelectItem>
                                {customers.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <p
                        data-testid="pickups-result-count"
                        className="font-mono-label text-[11px] text-[#596155]"
                    >
                        {filtered.length} of {pickups.length} pickups
                    </p>
                    {hasActive && (
                        <button
                            type="button"
                            onClick={clearAll}
                            data-testid="pickups-clear-filters"
                            className="inline-flex items-center gap-1 font-mono-label text-[11px] text-[#C45B38] hover:underline"
                        >
                            <X size={11} /> Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table — desktop */}
            <div
                data-testid="pickups-table-wrap"
                className="hidden md:block rounded-sm border border-[#D1CDBC] bg-white overflow-hidden"
            >
                <table className="w-full text-sm">
                    <thead className="bg-[#171A15] text-[#F7F5F0]">
                        <tr>
                            {["BOOKING", "CUSTOMER", "EXECUTIVE", "DATE", "STATUS"].map(
                                (h) => (
                                    <th
                                        key={h}
                                        className="text-left font-mono-label text-[10px] font-normal px-4 py-3"
                                    >
                                        {h}
                                    </th>
                                )
                            )}
                            <th className="text-right font-mono-label text-[10px] font-normal px-4 py-3">
                                AMOUNT
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p) => (
                            <tr
                                key={p.id}
                                className="border-t border-[#D1CDBC] hover:bg-[#F7F5F0] transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/admin/pickups/${p.pickup_id}`}
                                        data-testid={`pickup-row-${p.pickup_id}`}
                                        className="font-display font-bold tracking-tight text-[#121710] hover:text-[#C45B38]"
                                    >
                                        {p.pickup_id}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-[#121710]">
                                    <p className="truncate max-w-[180px]">
                                        {p.customer?.full_name ?? "—"}
                                    </p>
                                    <p className="text-xs text-[#596155] truncate max-w-[180px]">
                                        {p.customer?.email}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-[#121710]">
                                    {p.executive ? (
                                        <p className="truncate max-w-[160px]">
                                            {p.executive.full_name}
                                        </p>
                                    ) : (
                                        <span className="font-mono-label text-[10px] text-[#596155]">
                                            UNASSIGNED
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-[#121710]">
                                    <p>{format(parseISO(p.scheduled_date), "d MMM yy")}</p>
                                    <p className="text-xs text-[#596155]">
                                        {p.scheduled_slot || "—"}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusChip status={p.status} />
                                </td>
                                <td className="px-4 py-3 text-right font-display font-bold tracking-tight">
                                    ₹{p.total_amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-sm text-[#596155]">
                        No pickups match these filters.
                    </div>
                )}
            </div>

            {/* Cards — mobile */}
            <ul className="md:hidden space-y-2">
                {filtered.length === 0 && (
                    <li>
                        <EmptyState title="No pickups match these filters." />
                    </li>
                )}
                {filtered.map((p) => (
                    <li key={p.id}>
                        <Link
                            href={`/admin/pickups/${p.pickup_id}`}
                            data-testid={`pickup-card-${p.pickup_id}`}
                            className="block rounded-sm border border-[#D1CDBC] bg-white p-4"
                        >
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="font-display font-bold tracking-tight text-[#121710]">
                                    {p.pickup_id}
                                </p>
                                <StatusChip status={p.status} />
                            </div>
                            <p className="text-sm text-[#121710]">
                                {p.customer?.full_name}
                            </p>
                            <p className="text-xs text-[#596155]">
                                {p.executive
                                    ? p.executive.full_name
                                    : "Unassigned"}{" "}
                                · {format(parseISO(p.scheduled_date), "d MMM")} ·{" "}
                                {p.scheduled_slot || "—"}
                            </p>
                            <p className="mt-2 font-display font-bold tracking-tight text-[#121710]">
                                ₹{p.total_amount}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminPickups;
