"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Truck,
    Star,
    Calendar,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import {
    AdminPageHeader,
    StatCard,
    StatusChip,
    SectionCard,
    EmptyState,
} from "@/components/AdminUI";
import {
    findExecutive,
    loadEnrichedPickups,
    executiveStats,
} from "@workspace/data/adminMock";

const AdminExecutiveDetails = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string | undefined;

    const exec = useMemo(() => (id ? findExecutive(id) : null), [id]);
    const stats = useMemo(
        () => (exec ? executiveStats(id!) : null),
        [id, exec]
    );
    const pickups = useMemo(() => {
        if (!exec || !id) return [];
        return loadEnrichedPickups().filter((p) => p.executiveId === id);
    }, [id, exec]);

    if (!exec) {
        return (
            <div className="px-5 sm:px-8 lg:px-10 py-10">
                <Link
                    href="/admin/executives"
                    className="inline-flex items-center gap-2 text-sm text-[#596155] hover:text-[#121710] mb-6"
                >
                    <ArrowLeft size={14} /> Back to executives
                </Link>
                <EmptyState
                    title="Executive not found"
                    body="No partner exists with this ID."
                />
            </div>
        );
    }

    const recent = pickups.slice(0, 8);

    return (
        <div
            data-testid="admin-exec-details"
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
                eyebrow={`[ executive · ${exec.empId} ]`}
                title={exec.name}
                description={`${exec.zone} · Joined ${formatDistanceToNow(
                    parseISO(exec.joinedAt),
                    { addSuffix: true }
                )}`}
                actions={
                    <span
                        className={`font-mono-label text-[10px] px-3 py-1.5 rounded-sm border ${
                            exec.status === "active"
                                ? "border-[#284226]/40 bg-[#284226]/10 text-[#284226]"
                                : "border-[#596155]/40 bg-[#596155]/10 text-[#596155]"
                        }`}
                    >
                        {exec.status === "active" ? "ACTIVE" : "INACTIVE"}
                    </span>
                }
            />

            <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard testid="exec-profile" title="Profile">
                    <ul className="space-y-2.5 text-sm">
                        <li className="flex items-center gap-2 text-[#596155]">
                            <Mail size={12} /> {exec.email}
                        </li>
                        <li className="flex items-center gap-2 text-[#596155]">
                            <Phone size={12} /> {exec.phone}
                        </li>
                        <li className="flex items-center gap-2 text-[#596155]">
                            <MapPin size={12} /> {exec.zone}
                        </li>
                        <li className="flex items-center gap-2 text-[#596155]">
                            <Truck size={12} /> {exec.vehicle}
                        </li>
                        <li className="flex items-center gap-2 text-[#596155]">
                            <Star
                                size={12}
                                className="text-[#C45B38] fill-[#C45B38]"
                            />{" "}
                            {exec.rating || "—"} rating
                        </li>
                    </ul>
                </SectionCard>

                <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                    <StatCard
                        testid="exec-stat-total"
                        label="Total assigned"
                        value={stats!.totalAssigned}
                    />
                    <StatCard
                        testid="exec-stat-active"
                        label="Active"
                        value={stats!.active}
                        accent="text-[#C45B38]"
                    />
                    <StatCard
                        testid="exec-stat-completed"
                        label="Completed"
                        value={stats!.completed}
                        accent="text-[#284226]"
                    />
                    <StatCard
                        testid="exec-stat-rate"
                        label="Completion rate"
                        value={`${stats!.completionRate}%`}
                    />
                    <StatCard
                        testid="exec-stat-earnings"
                        label="Earnings collected"
                        value={`₹${stats!.earnings.toLocaleString("en-IN")}`}
                    />
                    <StatCard
                        testid="exec-stat-kg"
                        label="Total collected"
                        value={stats!.kgCollected}
                        suffix="kg"
                    />
                </div>
            </div>

            <SectionCard
                testid="exec-recent-pickups"
                title="Recent pickups"
                action={
                    <Link
                        href={`/admin/pickups?exec=${exec.id}`}
                        data-testid="exec-view-all-pickups"
                        className="text-xs text-[#C45B38] hover:underline"
                    >
                        View all →
                    </Link>
                }
            >
                {recent.length === 0 ? (
                    <EmptyState
                        title="No pickups yet"
                        body="When pickups are assigned, they'll appear here."
                    />
                ) : (
                    <ul className="space-y-2">
                        {recent.map((p) => (
                            <li key={p.id}>
                                <Link
                                    href={`/admin/pickups/${p.id}`}
                                    data-testid={`exec-pickup-${p.id}`}
                                    className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3 hover:border-[#121710] transition-colors"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-display font-bold tracking-tight">
                                                {p.id}
                                            </p>
                                            <StatusChip status={p.status} />
                                        </div>
                                        <p className="text-xs text-[#596155] truncate">
                                            {p.customer?.name} ·{" "}
                                            {format(parseISO(p.date), "d MMM")}{" "}
                                            · {p.slot}
                                        </p>
                                    </div>
                                    <p className="font-display font-bold tracking-tight text-[#121710]">
                                        ₹{p.amount}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>
        </div>
    );
};

export default AdminExecutiveDetails;
