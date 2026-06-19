"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Truck,
    Hourglass,
    Activity,
    CheckCircle2,
    Users,
    UserCog,
    Wallet,
    CalendarCheck,
    PlusCircle,
    ListChecks,
    UserPlus,
    Eye,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    AdminPageHeader,
    StatCard,
    StatusChip,
    SectionCard,
    EmptyState,
} from "@/components/AdminUI";
import { createClient } from "@workspace/supabase/client";
import { format, parseISO, formatDistanceToNow, subDays, startOfDay } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    totalPickups: number;
    pendingPickups: number;
    inProgressPickups: number;
    completedPickups: number;
    totalCustomers: number;
    totalExecutives: number;
    revenueCollected: number;
    todaysCollections: number;
    weeklyTrend: Array<{ label: string; volume: number }>;
    statusDistribution: Array<{ name: string; count: number; fill: string }>;
}

interface Pickup {
    id: string;
    pickup_id: string;
    status: string;
    scheduled_date: string;
    scheduled_slot: string | null;
    total_amount: number;
    customer?: { full_name: string };
}

interface Customer {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
}

interface Executive {
    id: string;
    full_name: string;
    is_active: boolean;
    created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: "#284226",
    confirmed: "#3F6038",
    assigned: "#5A8550",
    en_route: "#C45B38",
    arrived: "#D97052",
    collected: "#C45B38",
    completed: "#596155",
    cancelled: "#171A15",
};

const SLOT_RANGES: Record<string, string> = {
    slot_8_10: "8–10 AM",
    slot_10_12: "10 AM–12 PM",
    slot_12_14: "12–2 PM",
    slot_14_16: "2–4 PM",
    slot_16_18: "4–6 PM",
    slot_18_20: "6–8 PM",
};

// ─── Admin Overview ───────────────────────────────────────────────────────────

const AdminOverview = () => {
    const supabase = createClient();

    const [stats, setStats] = useState<Stats | null>(null);
    const [recentPickups, setRecentPickups] = useState<Pickup[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [executives, setExecutives] = useState<Executive[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Fetch all data ─────────────────────────────────────────────────────
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);

        try {
            // 1. Count stats
            const [
                { count: totalPickups },
                { count: pendingPickups },
                { count: completedPickups },
                { count: totalCustomers },
                { count: totalExecutives },
                { data: allPickups },
                { data: paidPayments },
                { data: recentPickupsData },
                { data: customersData },
                { data: executivesData },
            ] = await Promise.all([
                // Total pickups
                supabase
                    .from("pickups")
                    .select("id", { count: "exact", head: true }),
                // Pending pickups
                supabase
                    .from("pickups")
                    .select("id", { count: "exact", head: true })
                    .eq("status", "pending"),
                // Completed pickups
                supabase
                    .from("pickups")
                    .select("id", { count: "exact", head: true })
                    .eq("status", "completed"),
                // Total customers (role = 'customer')
                supabase
                    .from("profiles")
                    .select("id", { count: "exact", head: true })
                    .eq("role", "customer"),
                // Total active executives
                supabase
                    .from("profiles")
                    .select("id", { count: "exact", head: true })
                    .eq("role", "executive")
                    .eq("is_active", true),
                // All pickups for calculations
                supabase
                    .from("pickups")
                    .select("id, status, scheduled_date")
                    .order("created_at", { ascending: false }),
                // Paid payments for revenue
                supabase
                    .from("payments")
                    .select("amount, paid_at")
                    .eq("status", "paid"),
                // Recent pickups with customer
                supabase
                    .from("pickups")
                    .select(
                        "id, pickup_id, status, scheduled_date, scheduled_slot, total_amount, customer:profiles(full_name)"
                    )
                    .order("created_at", { ascending: false })
                    .limit(5),
                // New customers
                supabase
                    .from("profiles")
                    .select("id, full_name, email, created_at")
                    .eq("role", "customer")
                    .order("created_at", { ascending: false })
                    .limit(5),
                // Recent executives
                supabase
                    .from("profiles")
                    .select("id, full_name, is_active, created_at")
                    .eq("role", "executive")
                    .order("created_at", { ascending: false })
                    .limit(4),
            ]);

            // 2. Compute derived stats
            const inProgressPickups = (allPickups ?? []).filter((p) =>
                ["confirmed", "assigned", "en_route", "arrived", "collected"].includes(
                    p.status
                )
            ).length;

            // Revenue collected (all paid payments)
            const revenueCollected = (paidPayments ?? []).reduce(
                (sum, p) => sum + (p.amount || 0),
                0
            );

            // Today's collections
            const today = startOfDay(new Date());
            const todaysCollections = (paidPayments ?? [])
                .filter((p) => p.paid_at && new Date(p.paid_at) >= today)
                .reduce((sum, p) => sum + (p.amount || 0), 0);

            // 3. Weekly trend (last 7 days)
            const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(today, 6 - i);
                const label = format(d, "ddd");
                const volume = (allPickups ?? []).filter(
                    (p) =>
                        p.scheduled_date ===
                        format(d, "yyyy-MM-dd")
                ).length;
                return { label, volume };
            });

            // 4. Status distribution
            const statusDist = ["pending", "confirmed", "assigned", "en_route", "arrived", "collected", "completed", "cancelled"].map(
                (status) => ({
                    name: status.charAt(0).toUpperCase() + status.slice(1),
                    count: (allPickups ?? []).filter((p) => p.status === status)
                        .length,
                    fill: STATUS_COLORS[status] || "#D1CDBC",
                })
            ).filter((s) => s.count > 0);

            setStats({
                totalPickups: totalPickups ?? 0,
                pendingPickups: pendingPickups ?? 0,
                inProgressPickups,
                completedPickups: completedPickups ?? 0,
                totalCustomers: totalCustomers ?? 0,
                totalExecutives: totalExecutives ?? 0,
                revenueCollected,
                todaysCollections,
                weeklyTrend,
                statusDistribution: statusDist,
            });

            setRecentPickups(
                (recentPickupsData ?? []).map((p) => ({
                    ...p,
                    customer: Array.isArray(p.customer)
                        ? p.customer[0]
                        : p.customer,
                }))
            );
            setCustomers(customersData ?? []);
            setExecutives(executivesData ?? []);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading || !stats) {
        return (
            <div className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10 space-y-8">
                <AdminPageHeader
                    eyebrow="[ admin · overview ]"
                    title="Operations console"
                    description="Live snapshot of pickups, customers, executives and money — across all cities."
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 rounded-sm bg-[#EDE9DC] animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="admin-overview"
            className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10 space-y-8"
        >
            <AdminPageHeader
                eyebrow="[ admin · overview ]"
                title="Operations console"
                description="Live snapshot of pickups, customers, executives and money — across all cities."
            />

            {/* KPI grid */}
            <div
                data-testid="admin-kpi-grid"
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
                <StatCard
                    testid="kpi-total-pickups"
                    label="Total pickups"
                    value={stats.totalPickups}
                />
                <StatCard
                    testid="kpi-pending"
                    label="Pending"
                    value={stats.pendingPickups}
                    accent="text-[#284226]"
                />
                <StatCard
                    testid="kpi-in-progress"
                    label="In progress"
                    value={stats.inProgressPickups}
                    accent="text-[#C45B38]"
                />
                <StatCard
                    testid="kpi-completed"
                    label="Completed"
                    value={stats.completedPickups}
                    accent="text-[#596155]"
                />
                <StatCard
                    testid="kpi-customers"
                    label="Total customers"
                    value={stats.totalCustomers}
                />
                <StatCard
                    testid="kpi-executives"
                    label="Active executives"
                    value={stats.totalExecutives}
                />
                <StatCard
                    testid="kpi-revenue"
                    label="Revenue collected"
                    value={`₹${stats.revenueCollected.toLocaleString("en-IN")}`}
                />
                <StatCard
                    testid="kpi-todays-collections"
                    label="Today's collections"
                    value={`₹${stats.todaysCollections.toLocaleString("en-IN")}`}
                    accent="text-[#C45B38]"
                />
            </div>

            {/* Charts row */}
            <div className="grid gap-4 lg:grid-cols-5">
                <SectionCard
                    testid="chart-volume"
                    title="Pickup volume · last 7 days"
                >
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.weeklyTrend}
                                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#D1CDBC"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: "#596155", fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#596155", fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "#EDE9DC" }}
                                    contentStyle={{
                                        background: "#171A15",
                                        border: "none",
                                        borderRadius: 4,
                                        color: "#F7F5F0",
                                        fontSize: 11,
                                    }}
                                />
                                <Bar
                                    dataKey="volume"
                                    fill="#284226"
                                    radius={[2, 2, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard testid="chart-status" title="Status breakdown">
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="count"
                                >
                                    {stats.statusDistribution.map(
                                        (entry, idx) => (
                                            <Cell
                                                key={idx}
                                                fill={entry.fill}
                                            />
                                        )
                                    )}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: "#171A15",
                                        border: "none",
                                        borderRadius: 4,
                                        color: "#F7F5F0",
                                        fontSize: 11,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <ul className="mt-4 space-y-2">
                        {stats.statusDistribution.map((s) => (
                            <li
                                key={s.name}
                                className="flex items-center justify-between text-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ background: s.fill }}
                                    />
                                    {s.name}
                                </span>
                                <span className="font-semibold text-[#121710]">
                                    {s.count}
                                </span>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            </div>

            {/* Quick actions */}
            <SectionCard testid="quick-actions" title="Quick actions">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                        {
                            to: "/admin/pickups",
                            icon: ListChecks,
                            label: "View all pickups",
                            testid: "qa-pickups",
                        },
                        {
                            to: "/admin/executives",
                            icon: UserPlus,
                            label: "Manage executives",
                            testid: "qa-execs",
                        },
                        {
                            to: "/admin/customers",
                            icon: Eye,
                            label: "Browse customers",
                            testid: "qa-customers",
                        },
                        {
                            to: "/admin/me",
                            icon: PlusCircle,
                            label: "Admin profile",
                            testid: "qa-profile",
                        },
                    ].map((qa) => {
                        const Icon = qa.icon;
                        return (
                            <Link
                                key={qa.label}
                                href={qa.to}
                                data-testid={qa.testid}
                                className="flex items-center gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3.5 hover:-translate-y-0.5 hover:border-[#121710] transition-all"
                            >
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#171A15] text-[#F7F5F0]">
                                    <Icon size={14} />
                                </span>
                                <span className="text-sm font-medium text-[#121710]">
                                    {qa.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Recent rows */}
            <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard
                    testid="section-recent-pickups"
                    title="Recent pickups"
                    action={
                        <Link
                            href="/admin/pickups"
                            data-testid="link-all-pickups"
                            className="text-xs text-[#C45B38] hover:underline"
                        >
                            View all →
                        </Link>
                    }
                >
                    {recentPickups.length === 0 ? (
                        <EmptyState title="No pickups yet" />
                    ) : (
                        <ul className="space-y-2">
                            {recentPickups.map((p) => (
                                <li key={p.id}>
                                    <Link
                                        href={`/admin/pickups/${p.pickup_id}`}
                                        data-testid={`overview-pickup-${p.pickup_id}`}
                                        className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3 hover:border-[#121710] transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-display text-sm font-bold tracking-tight">
                                                    {p.pickup_id}
                                                </p>
                                                <StatusChip status={p.status} />
                                            </div>
                                            <p className="mt-0.5 text-xs text-[#596155] truncate">
                                                {p.customer?.full_name} ·{" "}
                                                {format(parseISO(p.scheduled_date), "d MMM")}{" "}
                                                · {SLOT_RANGES[p.scheduled_slot ?? ""] || "—"}
                                            </p>
                                        </div>
                                        <p className="font-display text-sm font-bold tracking-tight text-[#121710]">
                                            ₹{p.total_amount}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                <SectionCard
                    testid="section-recent-customers"
                    title="New customers"
                    action={
                        <Link
                            href="/admin/customers"
                            data-testid="link-all-customers"
                            className="text-xs text-[#C45B38] hover:underline"
                        >
                            View all →
                        </Link>
                    }
                >
                    <ul className="space-y-2">
                        {customers.map((c) => (
                            <li key={c.id}>
                                <Link
                                    href={`/admin/customers/${c.id}`}
                                    data-testid={`overview-customer-${c.id}`}
                                    className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3 hover:border-[#121710] transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[#121710] truncate">
                                            {c.full_name}
                                        </p>
                                        <p className="text-xs text-[#596155] truncate">
                                            {c.email}
                                        </p>
                                    </div>
                                    <p className="font-mono-label text-[10px] text-[#596155] shrink-0">
                                        {formatDistanceToNow(parseISO(c.created_at), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            </div>

            <SectionCard
                testid="section-recent-execs"
                title="Recent executive activity"
                action={
                    <Link
                        href="/admin/executives"
                        data-testid="link-all-execs"
                        className="text-xs text-[#C45B38] hover:underline"
                    >
                        View all →
                    </Link>
                }
            >
                <ul className="grid sm:grid-cols-2 gap-2">
                    {executives.map((e) => (
                        <li key={e.id}>
                            <Link
                                href={`/admin/executives/${e.id}`}
                                data-testid={`overview-exec-${e.id}`}
                                className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3 hover:border-[#121710] transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#121710] truncate">
                                        {e.full_name}
                                    </p>
                                    <p className="text-xs text-[#596155] truncate">
                                        Exec · {e.is_active ? "Active" : "Inactive"}
                                    </p>
                                </div>
                                <span
                                    className={`font-mono-label text-[10px] px-2 py-0.5 rounded-sm border ${
                                        e.is_active
                                            ? "border-[#284226]/40 bg-[#284226]/10 text-[#284226]"
                                            : "border-[#596155]/40 bg-[#596155]/10 text-[#596155]"
                                    }`}
                                >
                                    {e.is_active ? "ACTIVE" : "INACTIVE"}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </SectionCard>
        </div>
    );
};

export default AdminOverview;
