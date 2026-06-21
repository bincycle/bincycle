"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    BadgePercent,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    StatCard,
    StatusChip,
    SectionCard,
    EmptyState,
} from "@/components/AdminUI";
import {
    findCustomer,
    loadEnrichedPickups,
    customerStats,
} from "@workspace/data/adminMock";

const AdminCustomerDetails = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string | undefined;

    const customer = useMemo(() => (id ? findCustomer(id) : null), [id]);
    const pickups = useMemo(() => {
        if (!customer || !id) return [];
        return loadEnrichedPickups().filter((p) => p.customerId === id);
    }, [id, customer]);
    const stats = useMemo(
        () => (customer ? customerStats(id!) : null),
        [id, customer]
    );

    if (!customer) {
        return (
            <div className="px-5 sm:px-8 lg:px-10 py-10">
                <Link
                    href="/customers"
                    className="inline-flex items-center gap-2 text-sm text-[#596155] hover:text-[#121710] mb-6"
                >
                    <ArrowLeft size={14} /> Back to customers
                </Link>
                <EmptyState title="Customer not found" />
            </div>
        );
    }

    const coupons = stats?.couponsUsed || [];

    return (
        <div
            data-testid="admin-customer-details"
            className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10 space-y-6"
        >
            <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-[#596155] hover:text-[#121710]"
            >
                <ArrowLeft size={14} /> Back
            </button>

            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>{customer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-mono-label text-xs text-[#596155]">
                            [ customer · {customer.id} ]
                        </p>
                        <h1 className="mt-1 font-display font-black tracking-tighter text-3xl sm:text-4xl text-[#121710]">
                            {customer.name}
                        </h1>
                        <p className="text-sm text-[#596155]">
                            {customer.plan} · joined{" "}
                            {formatDistanceToNow(parseISO(customer.joinedAt), {
                                addSuffix: true,
                            })}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard testid="cust-profile" title="Profile">
                    <ul className="space-y-2.5 text-sm">
                        <li className="flex items-center gap-2 text-[#596155]">
                            <Mail size={12} /> {customer.email}
                        </li>
                        <li className="flex items-center gap-2 text-[#596155]">
                            <Phone size={12} /> {customer.phone}
                        </li>
                    </ul>
                </SectionCard>

                <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                    <StatCard
                        testid="cust-stat-pickups"
                        label="Total pickups"
                        value={stats!.totalPickups}
                    />
                    <StatCard
                        testid="cust-stat-completed"
                        label="Completed"
                        value={stats!.completedPickups}
                        accent="text-[#284226]"
                    />
                    <StatCard
                        testid="cust-stat-spend"
                        label="Total spend"
                        value={`₹${stats!.totalSpend.toLocaleString("en-IN")}`}
                        accent="text-[#C45B38]"
                    />
                    <StatCard
                        testid="cust-stat-kg"
                        label="Recycled"
                        value={stats!.kgRecycled}
                        suffix="kg"
                    />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard testid="cust-addresses" title="Saved addresses">
                    {!customer.addresses || customer.addresses.length === 0 ? (
                        <EmptyState title="No addresses saved." />
                    ) : (
                        <ul className="space-y-2">
                            {customer.addresses.map((a) => (
                                <li
                                    key={a.id}
                                    data-testid={`cust-address-${a.id}`}
                                    className="rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3"
                                >
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <MapPin
                                            size={11}
                                            className="text-[#596155]"
                                        />
                                        <span className="font-mono-label text-[10px] text-[#284226]">
                                            {a.label.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#121710] mt-1.5">
                                        {a.line1}
                                    </p>
                                    <p className="text-xs text-[#596155]">
                                        {a.city} — {a.pincode}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                <SectionCard testid="cust-coupons" title="Promo codes used">
                    {coupons.length === 0 ? (
                        <p className="text-sm text-[#596155]">
                            This customer hasn't redeemed any promos yet.
                        </p>
                    ) : (
                        <ul className="grid gap-2">
                            {coupons.map((c) => (
                                <li
                                    key={c}
                                    data-testid={`cust-coupon-${c}`}
                                    className="inline-flex items-center gap-2 rounded-sm bg-[#284226] text-[#F7F5F0] px-3 py-1.5 font-mono-label text-[11px] w-fit"
                                >
                                    <BadgePercent size={11} />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
            </div>

            <SectionCard testid="cust-pickup-history" title="Pickup history">
                {pickups.length === 0 ? (
                    <EmptyState
                        title="No pickups yet"
                        body="As soon as this customer books, the history will populate here."
                    />
                ) : (
                    <ul className="space-y-2">
                        {pickups.map((p) => (
                            <li key={p.id}>
                                <Link
                                    href={`/pickups/${p.id}`}
                                    data-testid={`cust-pickup-${p.id}`}
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
                                            {format(parseISO(p.date), "d MMM yy")}{" "}
                                            · {p.slot}
                                            {p.executive
                                                ? ` · ${p.executive.name}`
                                                : ""}
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

export default AdminCustomerDetails;
