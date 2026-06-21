"use client";

import { useMemo, useState } from "react";
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
import { AdminPageHeader, EmptyState } from "@/components/AdminUI";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { loadCustomers, customerStats } from "@workspace/data/adminMock";

interface EnrichedCustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
    plan: string;
    avatar?: string;
    stats: ReturnType<typeof customerStats>;
}

interface AggregateStats {
    total: number;
    totalSpend: number;
    totalPickups: number;
    activeWeekly: number;
}

const AdminCustomers = () => {
    const [q, setQ] = useState("");
    const [plan, setPlan] = useState("all");

    const customers = useMemo(() => loadCustomers(), []);
    const enriched: EnrichedCustomer[] = useMemo(
        () =>
            customers.map((c) => ({
                ...c,
                stats: customerStats(c.id),
            })),
        [customers]
    );

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return enriched.filter((c) => {
            if (plan !== "all" && c.plan !== plan) return false;
            if (qq) {
                const blob = [c.name, c.email, c.phone]
                    .join(" ")
                    .toLowerCase();
                if (!blob.includes(qq)) return false;
            }
            return true;
        });
    }, [enriched, q, plan]);

    const aggregate: AggregateStats = useMemo(() => {
        const totalSpend = enriched.reduce(
            (s, c) => s + (c.stats?.totalSpend || 0),
            0
        );
        const totalPickups = enriched.reduce(
            (s, c) => s + (c.stats?.totalPickups || 0),
            0
        );
        const activeWeekly = enriched.filter(
            (c) => c.plan === "Weekly" || c.plan === "Household+"
        ).length;
        return {
            total: enriched.length,
            totalSpend,
            totalPickups,
            activeWeekly,
        };
    }, [enriched]);

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
                        Recurring plans
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
                    <Select value={plan} onValueChange={setPlan}>
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
                            <SelectItem value="Household+">Household+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

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
                                    <th className="text-left font-mono-label text-[10px] font-normal px-4 py-3">
                                        PLAN
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
                                                href={`/admin/customers/${c.id}`}
                                                data-testid={`customer-row-${c.id}`}
                                                className="flex items-center gap-3"
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={c.avatar} />
                                                    <AvatarFallback>
                                                        {c.name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-[#121710] hover:text-[#C45B38]">
                                                    {c.name}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-[#596155]">
                                            <p className="truncate max-w-[200px]">
                                                {c.email}
                                            </p>
                                            <p className="text-xs">{c.phone}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono-label text-[10px] border border-[#D1CDBC] bg-[#F7F5F0] text-[#121710] px-2 py-0.5 rounded-sm">
                                                {c.plan?.toUpperCase()}
                                            </span>
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
                                                          c.stats.lastActivity
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
                                    href={`/admin/customers/${c.id}`}
                                    data-testid={`customer-card-${c.id}`}
                                    className="block rounded-sm border border-[#D1CDBC] bg-white p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={c.avatar} />
                                            <AvatarFallback>
                                                {c.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-[#121710] truncate">
                                                {c.name}
                                            </p>
                                            <p className="text-xs text-[#596155] truncate">
                                                {c.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="font-mono-label text-[9px] text-[#596155]">
                                                PLAN
                                            </p>
                                            <p className="text-xs font-medium text-[#121710]">
                                                {c.plan}
                                            </p>
                                        </div>
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
