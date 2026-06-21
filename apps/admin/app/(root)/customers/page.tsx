"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
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
    EmptyState,
} from "@/components/AdminUI";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@workspace/ui/components/avatar";
import { createClient } from "@workspace/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerStats {
    totalPickups: number;
    totalSpend: number;
    lastActivity?: string;
}

interface EnrichedCustomer {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
    stats: CustomerStats;
}

interface AggregateStats {
    total: number;
    totalSpend: number;
    totalPickups: number;
    activeWeekly: number;
}

// ─── Admin Customers page ──────────────────────────────────────────────────────

const AdminCustomers = () => {
    const supabase = createClient();

    const [q, setQ] = useState("");
    const [planFilter, setPlanFilter] = useState("all");
    const [customers, setCustomers] = useState<EnrichedCustomer[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Fetch customers with stats ─────────────────────────────────────────
    const fetchCustomers = useCallback(async () => {
        setLoading(true);

        try {
            // 1. Get all customers (profiles with role = 'customer')
            const { data: customersData, error: customersError } =
                await supabase
                    .from("profiles")
                    .select("id, full_name, email, phone, avatar_url, created_at")
                    .eq("role", "customer")
                    .order("created_at", { ascending: false });

            if (customersError) throw customersError;

            // 2. For each customer, fetch their stats (pickups, spend, last activity)
            const enriched = await Promise.all(
                (customersData ?? []).map(async (c) => {
                    const [
                        { count: totalPickups },
                        { data: paymentData },
                        { data: lastPickupData },
                    ] = await Promise.all([
                        // Count pickups
                        supabase
                            .from("pickups")
                            .select("id", { count: "exact", head: true })
                            .eq("customer_id", c.id),
                        // Sum spent (paid payments only)
                        supabase
                            .from("payments")
                            .select("amount")
                            .eq("customer_id", c.id)
                            .eq("status", "paid"),
                        // Last activity (most recent pickup)
                        supabase
                            .from("pickups")
                            .select("created_at")
                            .eq("customer_id", c.id)
                            .order("created_at", { ascending: false })
                            .limit(1)
                            .maybeSingle<{ created_at: string }>(),
                    ]);

                    const totalSpend = (paymentData ?? []).reduce(
                        (sum, p) => sum + (p.amount || 0),
                        0
                    );

                    return {
                        ...c,
                        stats: {
                            totalPickups: totalPickups ?? 0,
                            totalSpend,
                            lastActivity:
                                lastPickupData?.created_at ||
                                c.created_at,
                        },
                    };
                })
            );

            setCustomers(enriched);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // ── Filter logic ───────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return customers.filter((c) => {
            // Plan filter: based on pickup frequency/pattern
            // For now, we'll assume all are on-demand since we don't have a plan field
            // In a real system, you'd have a subscription/plan table
            if (planFilter !== "all") {
                // Placeholder: filter by activity pattern
                // Weekly users have pickups in recent weeks
                // For now, all are "On-demand"
                if (planFilter !== "On-demand") return false;
            }

            // Search filter
            if (qq) {
                const blob = [
                    c.full_name,
                    c.email,
                    c.phone,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                if (!blob.includes(qq)) return false;
            }
            return true;
        });
    }, [customers, q, planFilter]);

    // ── Aggregate stats ────────────────────────────────────────────────────
    const aggregate: AggregateStats = useMemo(() => {
        const totalSpend = customers.reduce(
            (s, c) => s + (c.stats?.totalSpend || 0),
            0
        );
        const totalPickups = customers.reduce(
            (s, c) => s + (c.stats?.totalPickups || 0),
            0
        );
        // Recurring: customers with recent activity (in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeWeekly = customers.filter((c) => {
            if (!c.stats.lastActivity) return false;
            return (
                new Date(c.stats.lastActivity) >= sevenDaysAgo
            );
        }).length;

        return {
            total: customers.length,
            totalSpend,
            totalPickups,
            activeWeekly,
        };
    }, [customers]);

    if (loading) {
        return (
            <div
                data-testid="admin-customers-page"
                className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10"
            >
                <AdminPageHeader
                    eyebrow="[ admin · customers ]"
                    title="Customers"
                    description="Search and inspect every household, office and society on the platform."
                />
                <div className="mt-6 space-y-3">
                    <div className="h-20 rounded-sm bg-[#EDE9DC] animate-pulse" />
                    <div className="h-64 rounded-sm bg-[#EDE9DC] animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="admin-customers-page"
            className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10"
        >
            <AdminPageHeader
                eyebrow="[ admin · customers ]"
                title="Customers"
                description="Search and inspect every household, office and society on the platform."
            />

            {/* Summary stats */}
            <div
                data-testid="customers-summary"
                className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-sm border border-[#D1CDBC] bg-[#D1CDBC] mb-5"
            >
                <div className="bg-white p-4">
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Total customers
                    </p>
                    <p className="font-display text-2xl font-black text-[#121710] mt-1">
                        {aggregate.total}
                    </p>
                </div>
                <div className="bg-white p-4">
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Active this week
                    </p>
                    <p className="font-display text-2xl font-black text-[#284226] mt-1">
                        {aggregate.activeWeekly}
                    </p>
                </div>
                <div className="bg-white p-4">
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Total pickups
                    </p>
                    <p className="font-display text-2xl font-black text-[#121710] mt-1">
                        {aggregate.totalPickups}
                    </p>
                </div>
                <div className="bg-white p-4">
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Lifetime revenue
                    </p>
                    <p className="font-display text-2xl font-black text-[#C45B38] mt-1">
                        ₹{aggregate.totalSpend.toLocaleString("en-IN")}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div
                data-testid="customers-filters"
                className="rounded-sm border border-[#D1CDBC] bg-white p-3 mb-4 grid gap-2 sm:grid-cols-12"
            >
                <div className="sm:col-span-8 relative">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#596155]"
                    />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        data-testid="customers-search"
                        placeholder="Search by name, email or phone"
                        className="h-10 pl-9 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
                    />
                </div>
                <div className="sm:col-span-4">
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                        <SelectTrigger
                            data-testid="customers-filter-plan"
                            className="h-10 rounded-sm border-[#D1CDBC] focus:ring-[#284226]"
                        >
                            <SelectValue placeholder="Plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All plans</SelectItem>
                            <SelectItem value="On-demand">On-demand</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Household+">
                                Household+
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
                <EmptyState title="No customers match" />
            ) : (
                <>
                    {/* Desktop table */}
                    <div
                        data-testid="customers-table-wrap"
                        className="hidden md:block rounded-sm border border-[#D1CDBC] bg-white overflow-hidden"
                    >
                        <table className="w-full text-sm">
                            <thead className="bg-[#171A15] text-[#F7F5F0]">
                                <tr>
                                    <th className="text-left font-mono-label text-[10px] font-normal px-4 py-3">
                                        CUSTOMER
                                    </th>
                                    <th className="text-left font-mono-label text-[10px] font-normal px-4 py-3">
                                        CONTACT
                                    </th>
                                    <th className="text-right font-mono-label text-[10px] font-normal px-4 py-3">
                                        PICKUPS
                                    </th>
                                    <th className="text-right font-mono-label text-[10px] font-normal px-4 py-3">
                                        SPEND
                                    </th>
                                    <th className="text-left font-mono-label text-[10px] font-normal px-4 py-3">
                                        LAST ACTIVITY
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-t border-[#D1CDBC] hover:bg-[#F7F5F0] transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/customers/${c.id}`}
                                                data-testid={`customer-row-${c.id}`}
                                                className="flex items-center gap-3"
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={
                                                            c.avatar_url ||
                                                            undefined
                                                        }
                                                    />
                                                    <AvatarFallback>
                                                        {c.full_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-[#121710] hover:text-[#C45B38]">
                                                    {c.full_name}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-[#596155]">
                                            <p className="truncate max-w-[200px]">
                                                {c.email}
                                            </p>
                                            <p className="text-xs">
                                                {c.phone || "—"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-right font-display font-bold tracking-tight text-[#121710]">
                                            {c.stats.totalPickups}
                                        </td>
                                        <td className="px-4 py-3 text-right font-display font-bold tracking-tight text-[#C45B38]">
                                            ₹
                                            {c.stats.totalSpend.toLocaleString(
                                                "en-IN"
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[#596155]">
                                            {c.stats.lastActivity
                                                ? formatDistanceToNow(
                                                      parseISO(
                                                          c.stats
                                                              .lastActivity
                                                      ),
                                                      { addSuffix: true }
                                                  )
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <ul className="md:hidden space-y-2">
                        {filtered.map((c) => (
                            <li key={c.id}>
                                <Link
                                    href={`/customers/${c.id}`}
                                    data-testid={`customer-card-${c.id}`}
                                    className="block rounded-sm border border-[#D1CDBC] bg-white p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={
                                                    c.avatar_url ||
                                                    undefined
                                                }
                                            />
                                            <AvatarFallback>
                                                {c.full_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-[#121710] truncate">
                                                {c.full_name}
                                            </p>
                                            <p className="text-xs text-[#596155] truncate">
                                                {c.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="font-mono-label text-[9px] text-[#596155]">
                                                PICKUPS
                                            </p>
                                            <p className="text-xs font-bold text-[#121710]">
                                                {c.stats.totalPickups}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-mono-label text-[9px] text-[#596155]">
                                                SPEND
                                            </p>
                                            <p className="text-xs font-bold text-[#C45B38]">
                                                ₹
                                                {c.stats.totalSpend.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-mono-label text-[9px] text-[#596155]">
                                                LAST
                                            </p>
                                            <p className="text-xs text-[#596155]">
                                                {c.stats.lastActivity
                                                    ? formatDistanceToNow(
                                                          parseISO(
                                                              c.stats
                                                                  .lastActivity
                                                          ),
                                                          {
                                                              addSuffix:
                                                                  false,
                                                          }
                                                      )
                                                    : "—"}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default AdminCustomers;
