"use client";

import { useMemo } from "react";
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
import {
    computeAdminStats,
    loadEnrichedPickups,
    loadCustomers,
    loadExecutives,
    ADMIN_STATUS,
} from "@workspace/data/adminMock";
import { format, parseISO, formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
    scheduled: "#284226",
    confirmed: "#3F6038",
    assigned: "#5A8550",
    in_progress: "#C45B38",
    payment_pending: "#A64A2B",
    completed: "#596155",
    cancelled: "#171A15",
};

const AdminOverview = () => {
    const stats = useMemo(() => computeAdminStats(), []);
    const pickups = useMemo(() => loadEnrichedPickups(), []);
    const recentPickups = pickups.slice(0, 5);
    const customers = useMemo(
        () =>
            [...loadCustomers()]
                .sort(
                    (a, b) =>
                        new Date(b.joinedAt).getTime() -
                        new Date(a.joinedAt).getTime()
                )
                .slice(0, 5),
        []
    );
    const execs = useMemo(
        () =>
            [...loadExecutives()]
                .sort(
                    (a, b) =>
                        new Date(b.joinedAt).getTime() -
                        new Date(a.joinedAt).getTime()
                )
                .slice(0, 4),
        []
    );

    const distData = stats.statusDistribution.filter(
        (s: { count: number }) => s.count > 0
    );

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

                <SectionCard
                    testid="chart-status-distribution"
                    title="Pickup status distribution"
                >
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distData}
                                        dataKey="count"
                                        nameKey="label"
                                        innerRadius={36}
                                        outerRadius={64}
                                        paddingAngle={2}
                                    >
                                        {distData.map(
                                            (d: { key: string; label: string; count: number }) => (
                                                <Cell
                                                    key={d.key}
                                                    fill={
                                                        STATUS_COLORS[d.key] ||
                                                        "#284226"
                                                    }
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
                        <ul className="space-y-1.5">
                            {stats.statusDistribution.map(
                                (d: { key: string; label: string; count: number }) => (
                                    <li
                                        key={d.key}
                                        className="flex items-center gap-2 text-xs"
                                    >
                                        <span
                                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                                            style={{
                                                background:
                                                    STATUS_COLORS[d.key] ||
                                                    "#284226",
                                            }}
                                        />
                                        <span className="text-[#596155] flex-1 truncate">
                                            {d.label}
                                        </span>
                                        <span className="font-display font-bold text-[#121710]">
                                            {d.count}
                                        </span>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                </SectionCard>
            </div>

            {/* Quick actions */}
            <SectionCard testid="quick-actions" title="Quick actions">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                        {
                            to: "/pickups",
                            icon: ListChecks,
                            label: "View all pickups",
                            testid: "qa-pickups",
                        },
                        {
                            to: "/executives",
                            icon: UserPlus,
                            label: "Manage executives",
                            testid: "qa-execs",
                        },
                        {
                            to: "/customers",
                            icon: Eye,
                            label: "Browse customers",
                            testid: "qa-customers",
                        },
                        {
                            to: "/me",
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
                            href="/pickups"
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
                                        href={`/pickups/${p.id}`}
                                        data-testid={`overview-pickup-${p.id}`}
                                        className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3 hover:border-[#121710] transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-display text-sm font-bold tracking-tight">
                                                    {p.id}
                                                </p>
                                                <StatusChip status={p.status} />
                                            </div>
                                            <p className="mt-0.5 text-xs text-[#596155] truncate">
                                                {p.customer?.name} ·{" "}
                                                {format(parseISO(p.date), "d MMM")}{" "}
                                                · {p.slot}
                                            </p>
                                        </div>
                                        <p className="font-display text-sm font-bold tracking-tight text-[#121710]">
                                            ₹{p.amount}
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
                            href="/customers"
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
                                    href={`/customers/${c.id}`}
                                    data-testid={`overview-customer-${c.id}`}
                                    className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3 hover:border-[#121710] transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[#121710] truncate">
                                            {c.name}
                                        </p>
                                        <p className="text-xs text-[#596155] truncate">
                                            {c.email} · {c.plan}
                                        </p>
                                    </div>
                                    <p className="font-mono-label text-[10px] text-[#596155] shrink-0">
                                        {formatDistanceToNow(parseISO(c.joinedAt), {
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
                        href="/executives"
                        data-testid="link-all-execs"
                        className="text-xs text-[#C45B38] hover:underline"
                    >
                        View all →
                    </Link>
                }
            >
                <ul className="grid sm:grid-cols-2 gap-2">
                    {execs.map((e) => (
                        <li key={e.id}>
                            <Link
                                href={`/executives/${e.id}`}
                                data-testid={`overview-exec-${e.id}`}
                                className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3 hover:border-[#121710] transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#121710] truncate">
                                        {e.name}
                                    </p>
                                    <p className="text-xs text-[#596155] truncate">
                                        {e.empId} · {e.zone}
                                    </p>
                                </div>
                                <span
                                    className={`font-mono-label text-[10px] px-2 py-0.5 rounded-sm border ${
                                        e.status === "active"
                                            ? "border-[#284226]/40 bg-[#284226]/10 text-[#284226]"
                                            : "border-[#596155]/40 bg-[#596155]/10 text-[#596155]"
                                    }`}
                                >
                                    {e.status === "active" ? "ACTIVE" : "INACTIVE"}
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
