"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    BadgePercent,
    Loader2,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@workspace/ui/components/avatar";
import {
    StatCard,
    StatusChip,
    SectionCard,
    EmptyState,
} from "@/components/AdminUI";
import { createClient } from "@workspace/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
}

interface Address {
    id: string;
    label: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    pincode: string;
}

interface Pickup {
    id: string;
    pickup_id: string;
    status: string;
    scheduled_date: string;
    scheduled_slot: string | null;
    total_amount: number;
    executive?: { full_name: string };
}

interface CustomerStats {
    totalPickups: number;
    completedPickups: number;
    totalSpend: number;
}

// ─── Admin Customer Details page ───────────────────────────────────────────────

const AdminCustomerDetails = () => {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const supabase = createClient();

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [stats, setStats] = useState<CustomerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // ── Fetch all customer data ────────────────────────────────────────────
    const fetchCustomerData = useCallback(async () => {
        if (!params.id) return;
        setLoading(true);

        try {
            // 1. Fetch customer profile
            const { data: customerData, error: customerError } = await supabase
                .from("profiles")
                .select("id, full_name, email, phone, avatar_url, created_at")
                .eq("id", params.id)
                .eq("role", "customer")
                .maybeSingle<Customer>();

            if (customerError || !customerData) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setCustomer(customerData);

            // 2. Fetch customer's addresses
            const { data: addressesData } = await supabase
                .from("addresses")
                .select(
                    "id, label, address_line1, address_line2, city, pincode"
                )
                .eq("customer_id", params.id)
                .order("is_default", { ascending: false });

            setAddresses(addressesData ?? []);

            // 3. Fetch customer's pickups with executive info
            const { data: pickupsData } = await supabase
                .from("pickups")
                .select(
                    `
                    id,
                    pickup_id,
                    status,
                    scheduled_date,
                    scheduled_slot,
                    total_amount,
                    executive:profiles!executive_id ( full_name )
                    `
                )
                .eq("customer_id", params.id)
                .order("created_at", { ascending: false });

            // Normalize nested objects
            const normalizedPickups = (pickupsData ?? []).map((p) => ({
                ...p,
                executive: Array.isArray(p.executive)
                    ? p.executive[0]
                    : p.executive,
            }));

            setPickups(normalizedPickups);

            // 4. Calculate stats from pickups and payments
            const { count: totalPickups } = await supabase
                .from("pickups")
                .select("id", { count: "exact", head: true })
                .eq("customer_id", params.id);

            const { count: completedPickups } = await supabase
                .from("pickups")
                .select("id", { count: "exact", head: true })
                .eq("customer_id", params.id)
                .eq("status", "completed");

            const { data: paymentsData } = await supabase
                .from("payments")
                .select("amount")
                .eq("customer_id", params.id)
                .eq("status", "paid");

            const totalSpend = (paymentsData ?? []).reduce(
                (sum, p) => sum + (p.amount || 0),
                0
            );

            setStats({
                totalPickups: totalPickups ?? 0,
                completedPickups: completedPickups ?? 0,
                totalSpend,
            });
        } catch (err) {
            console.error("Failed to fetch customer data:", err);
            setNotFound(true);
        }

        setLoading(false);
    }, [params.id]);

    useEffect(() => {
        fetchCustomerData();
    }, [fetchCustomerData]);

    if (loading) {
        return (
            <div className="px-5 sm:px-8 lg:px-10 py-10">
                <div className="space-y-6">
                    <div className="h-6 w-32 rounded-sm bg-[#EDE9DC] animate-pulse" />
                    <div className="h-20 rounded-sm bg-[#EDE9DC] animate-pulse" />
                </div>
            </div>
        );
    }

    if (notFound || !customer || !stats) {
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

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={customer.avatar_url || undefined} />
                        <AvatarFallback>
                            {customer.full_name[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-mono-label text-xs text-[#596155]">
                            [ customer · {customer.id} ]
                        </p>
                        <h1 className="mt-1 font-display font-black tracking-tighter text-3xl sm:text-4xl text-[#121710]">
                            {customer.full_name}
                        </h1>
                        <p className="text-sm text-[#596155]">
                            joined{" "}
                            {formatDistanceToNow(
                                parseISO(customer.created_at),
                                {
                                    addSuffix: true,
                                }
                            )}
                        </p>
                    </div>
                </div>
            </header>

            {/* Profile + Stats */}
            <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard testid="cust-profile" title="Profile">
                    <ul className="space-y-2.5 text-sm">
                        <li className="flex items-center gap-2 text-[#596155]">
                            <Mail size={12} /> {customer.email}
                        </li>
                        <li className="flex items-center gap-2 text-[#596155]">
                            <Phone size={12} /> {customer.phone || "—"}
                        </li>
                    </ul>
                </SectionCard>

                <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                    <StatCard
                        testid="cust-stat-pickups"
                        label="Total pickups"
                        value={stats.totalPickups}
                    />
                    <StatCard
                        testid="cust-stat-completed"
                        label="Completed"
                        value={stats.completedPickups}
                        accent="text-[#284226]"
                    />
                    <StatCard
                        testid="cust-stat-spend"
                        label="Total spend"
                        value={`₹${stats.totalSpend.toLocaleString("en-IN")}`}
                        accent="text-[#C45B38]"
                    />
                    <StatCard
                        testid="cust-stat-kg"
                        label="Recycled"
                        value="—"
                        suffix="kg"
                    />
                </div>
            </div>

            {/* Addresses */}
            <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard testid="cust-addresses" title="Saved addresses">
                    {addresses.length === 0 ? (
                        <EmptyState title="No addresses saved." />
                    ) : (
                        <ul className="space-y-2">
                            {addresses.map((a) => (
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
                                        {a.address_line1}
                                    </p>
                                    <p className="text-xs text-[#596155]">
                                        {a.city} — {a.pincode}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                {/* Coupons section — placeholder for future */}
                <SectionCard testid="cust-coupons" title="Promo codes used">
                    <p className="text-sm text-[#596155]">
                        This customer hasn't redeemed any promos yet.
                    </p>
                </SectionCard>
            </div>

            {/* Pickup history */}
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
                                    href={`/pickups/${p.pickup_id}`}
                                    data-testid={`cust-pickup-${p.pickup_id}`}
                                    className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3 hover:border-[#121710] transition-colors"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-display font-bold tracking-tight">
                                                {p.pickup_id}
                                            </p>
                                            <StatusChip status={p.status} />
                                        </div>
                                        <p className="text-xs text-[#596155] truncate">
                                            {format(
                                                parseISO(p.scheduled_date),
                                                "d MMM yy"
                                            )}{" "}
                                            · {p.scheduled_slot || "—"}
                                            {p.executive
                                                ? ` · ${p.executive.full_name}`
                                                : ""}
                                        </p>
                                    </div>
                                    <p className="font-display font-bold tracking-tight text-[#121710]">
                                        ₹{p.total_amount}
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
