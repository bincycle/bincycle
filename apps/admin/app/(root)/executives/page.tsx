"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus, MapPin, Star } from "lucide-react";
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
    SectionCard,
} from "@/components/AdminUI";
import CreateExecutiveDialog from "@/components/CreateExecutiveDialog";
import { loadExecutives, updateExecutive } from "@workspace/data/adminMock";
import { toast } from "sonner";

const AdminExecutives = () => {
    const [version, setVersion] = useState(0);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [zoneFilter, setZoneFilter] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);

    const all = useMemo(
        () => loadExecutives(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [version]
    );
    const zones = useMemo(
        () => [...new Set(all.map((e) => e.zone))].sort(),
        [all]
    );

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return all.filter((e) => {
            if (statusFilter !== "all" && e.status !== statusFilter)
                return false;
            if (zoneFilter !== "all" && e.zone !== zoneFilter) return false;
            if (qq) {
                const blob = [e.name, e.empId, e.email, e.phone, e.zone]
                    .join(" ")
                    .toLowerCase();
                if (!blob.includes(qq)) return false;
            }
            return true;
        });
    }, [all, q, statusFilter, zoneFilter]);

    const toggleStatus = (id: string, current: string) => {
        const next = current === "active" ? "inactive" : "active";
        updateExecutive(id, { status: next });
        toast.success(`Executive ${next === "active" ? "enabled" : "disabled"}.`);
        setVersion((v) => v + 1);
    };

    return (
        <div
            data-testid="admin-executives-page"
            className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10"
        >
            <AdminPageHeader
                eyebrow="[ admin · executives ]"
                title="Field executives"
                description="Manage your pickup partners. Onboard, edit, and monitor performance."
                actions={
                    <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        data-testid="open-create-exec"
                        className="inline-flex items-center gap-2 rounded-sm bg-[#171A15] px-4 py-2.5 text-sm text-[#F7F5F0] hover:bg-[#C45B38] transition-colors"
                    >
                        <Plus size={14} /> Create executive
                    </button>
                }
            />

            <div
                data-testid="execs-filters"
                className="rounded-sm border border-[#D1CDBC] bg-white p-3 mb-4 grid gap-2 sm:grid-cols-12"
            >
                <div className="sm:col-span-6 relative">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#596155]"
                    />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        data-testid="execs-search"
                        placeholder="Search by name, employee ID, phone, email"
                        className="h-10 pl-9 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
                    />
                </div>
                <div className="sm:col-span-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger
                            data-testid="execs-filter-status"
                            className="h-10 rounded-sm border-[#D1CDBC] focus:ring-[#284226]"
                        >
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="sm:col-span-3">
                    <Select value={zoneFilter} onValueChange={setZoneFilter}>
                        <SelectTrigger
                            data-testid="execs-filter-zone"
                            className="h-10 rounded-sm border-[#D1CDBC] focus:ring-[#284226]"
                        >
                            <SelectValue placeholder="Zone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All zones</SelectItem>
                            {zones.map((z) => (
                                <SelectItem key={z} value={z}>
                                    {z}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    title="No executives match"
                    body="Try clearing some filters or onboard a new partner."
                />
            ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((e) => {
                        const rate =
                            e.totalPickups > 0
                                ? Math.round(
                                      (e.completedPickups / e.totalPickups) * 100
                                  )
                                : 0;
                        return (
                            <article
                                key={e.id}
                                data-testid={`exec-card-${e.id}`}
                                className="rounded-sm border border-[#D1CDBC] bg-white p-5 flex flex-col"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-display text-lg font-bold tracking-tight text-[#121710] truncate">
                                            {e.name}
                                        </p>
                                        <p className="font-mono-label text-[10px] text-[#596155] mt-0.5">
                                            {e.empId}
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
                                </div>

                                <p className="mt-3 text-xs text-[#596155] flex items-center gap-1.5">
                                    <MapPin size={11} /> {e.zone}
                                </p>
                                <p className="text-xs text-[#596155]">{e.phone}</p>

                                <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-[#D1CDBC] bg-[#D1CDBC]">
                                    <div className="bg-[#F7F5F0] px-2 py-2.5 text-center">
                                        <p className="font-mono-label text-[9px] text-[#596155]">
                                            PICKUPS
                                        </p>
                                        <p className="font-display text-base font-bold text-[#121710]">
                                            {e.totalPickups}
                                        </p>
                                    </div>
                                    <div className="bg-[#F7F5F0] px-2 py-2.5 text-center">
                                        <p className="font-mono-label text-[9px] text-[#596155]">
                                            RATE
                                        </p>
                                        <p className="font-display text-base font-bold text-[#284226]">
                                            {rate}%
                                        </p>
                                    </div>
                                    <div className="bg-[#F7F5F0] px-2 py-2.5 text-center">
                                        <p className="font-mono-label text-[9px] text-[#596155]">
                                            RATING
                                        </p>
                                        <p className="font-display text-base font-bold text-[#C45B38] inline-flex items-center justify-center gap-1">
                                            <Star
                                                size={11}
                                                className="fill-[#C45B38]"
                                            />
                                            {e.rating || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center gap-2">
                                    <Link
                                        href={`/executives/${e.id}`}
                                        data-testid={`view-exec-${e.id}`}
                                        className="flex-1 inline-flex items-center justify-center rounded-sm border border-[#121710] px-3 py-2 text-xs font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors"
                                    >
                                        View details
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleStatus(e.id, e.status)
                                        }
                                        data-testid={`toggle-exec-${e.id}`}
                                        className={`inline-flex items-center justify-center rounded-sm px-3 py-2 text-xs font-medium transition-colors ${
                                            e.status === "active"
                                                ? "bg-[#171A15] text-[#F7F5F0] hover:bg-[#C45B38]"
                                                : "bg-[#284226] text-[#F7F5F0] hover:bg-[#1d3219]"
                                        }`}
                                    >
                                        {e.status === "active"
                                            ? "Disable"
                                            : "Enable"}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <CreateExecutiveDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={() => setVersion((v) => v + 1)}
            />
        </div>
    );
};

export default AdminExecutives;
