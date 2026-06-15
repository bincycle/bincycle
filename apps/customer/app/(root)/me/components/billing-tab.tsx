import { format, parseISO } from "date-fns";
import {
    CreditCard,
    Banknote,
    ArrowUpRight,
    Plus,
    BadgePercent,
    Receipt,
    Check,
} from "lucide-react";
import {
    billingPlan,
    mockPaymentMethods,
    mockInvoices,
    mockCouponHistory,
} from "@workspace/data/accountStorage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentMethod {
    id: string;
    isDefault: boolean;
    type: "card" | "upi";
    // card fields
    brand?: string;
    last4?: string;
    expiry?: string;
    holder?: string;
    // upi fields
    upiId?: string;
}

interface Invoice {
    id: string;
    date: string;
    plan: string;
    amount: number;
}

interface CouponEntry {
    bookingId: string;
    code: string;
    appliedOn: string;
    savedAmount: number;
}

// ─── BillingTab ───────────────────────────────────────────────────────────────

export const BillingTab = () => {
    return (
        <div data-testid="account-tab-billing" className="space-y-5">
            <header className="pb-4 sm:pb-6 mb-1 sm:mb-2 border-b border-[#D1CDBC]">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#121710]">
                    Billing
                </h2>
                <p className="mt-1 text-sm text-[#596155]">
                    Your plan, payment methods, invoices and savings from promo codes.
                </p>
            </header>

            {/* Current plan */}
            <section
                data-testid="billing-section-plan"
                className="rounded-sm border border-[#D1CDBC] bg-[#171A15] text-[#F7F5F0] p-4 sm:p-6 lg:p-8"
            >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="font-mono-label text-xs text-[#F7F5F0]/60">
                            Current plan
                        </p>
                        <p className="mt-3 font-display text-4xl font-black tracking-tighter">
                            {billingPlan.name}
                        </p>
                        <p className="mt-2 text-[#F7F5F0]/70">
                            {billingPlan.price}{" "}
                            <span className="text-[#F7F5F0]/50">{billingPlan.cadence}</span>
                            {" · "}renews {format(parseISO(billingPlan.renewsOn), "d MMM")}
                        </p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                            Pickups left this month
                        </p>
                        <p className="font-display text-3xl font-black tracking-tighter">
                            {billingPlan.bagsRemaining}/{billingPlan.bagsTotal}
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        data-testid="billing-change-plan-btn"
                        className="inline-flex items-center gap-2 rounded-sm bg-[#C45B38] px-4 py-2.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B]"
                    >
                        Change plan <ArrowUpRight size={14} />
                    </button>
                    <button
                        type="button"
                        data-testid="billing-cancel-plan-btn"
                        className="inline-flex items-center gap-2 rounded-sm border border-[#F7F5F0]/30 px-4 py-2.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#F7F5F0]/10"
                    >
                        Pause subscription
                    </button>
                </div>
            </section>

            {/* Payment methods */}
            <section
                data-testid="billing-section-methods"
                className="rounded-sm border border-[#D1CDBC] bg-white p-4 sm:p-6 lg:p-8"
            >
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <h3 className="font-display text-lg font-bold tracking-tight text-[#121710]">
                            Payment methods
                        </h3>
                        <p className="mt-1 text-sm text-[#596155]">
                            We auto-debit your default method each cycle.
                        </p>
                    </div>
                    <button
                        type="button"
                        data-testid="billing-add-method-btn"
                        className="inline-flex items-center gap-2 rounded-sm border border-[#121710] px-3 py-2 text-xs font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0]"
                    >
                        <Plus size={12} /> Add method
                    </button>
                </div>
                <ul className="space-y-3" data-testid="billing-methods-list">
                    {(mockPaymentMethods as PaymentMethod[]).map((m) => {
                        const Icon = m.type === "card" ? CreditCard : Banknote;
                        const title =
                            m.type === "card"
                                ? `${m.brand} ending in ${m.last4}`
                                : `UPI · ${m.upiId}`;
                        const subtitle =
                            m.type === "card"
                                ? `Expires ${m.expiry} · ${m.holder}`
                                : "Linked via Bincycle app";
                        return (
                            <li
                                key={m.id}
                                data-testid={`payment-method-${m.id}`}
                                className="flex items-center justify-between gap-4 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-4"
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-white border border-[#D1CDBC] text-[#284226]">
                                        <Icon size={16} />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-display text-base font-bold tracking-tight text-[#121710]">
                                                {title}
                                            </p>
                                            {m.isDefault && (
                                                <span className="inline-flex items-center gap-1 rounded-sm border border-[#284226]/30 bg-[#284226]/10 px-1.5 py-0.5 font-mono-label text-[9px] text-[#284226]">
                                                    <Check size={9} /> Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-xs text-[#596155]">
                                            {subtitle}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>

            {/* Invoices */}
            <section
                data-testid="billing-section-invoices"
                className="rounded-sm border border-[#D1CDBC] bg-white p-4 sm:p-6 lg:p-8"
            >
                <h3 className="font-display text-lg font-bold tracking-tight text-[#121710] mb-5">
                    Invoices &amp; receipts
                </h3>
                <div className="overflow-x-auto rounded-sm border border-[#D1CDBC]">
                    <table className="w-full text-sm" data-testid="billing-invoices-table">
                        <thead className="bg-[#F7F5F0]">
                            <tr>
                                <th className="text-left p-4 font-mono-label text-[10px] text-[#596155]">Invoice</th>
                                <th className="text-left p-4 font-mono-label text-[10px] text-[#596155]">Date</th>
                                <th className="text-left p-4 font-mono-label text-[10px] text-[#596155]">Description</th>
                                <th className="text-right p-4 font-mono-label text-[10px] text-[#596155]">Amount</th>
                                <th className="text-right p-4 font-mono-label text-[10px] text-[#596155]">Status</th>
                                <th className="text-right p-4 font-mono-label text-[10px] text-[#596155]">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(mockInvoices as Invoice[]).map((inv, i) => (
                                <tr
                                    key={inv.id}
                                    data-testid={`billing-invoice-${inv.id}`}
                                    className={i % 2 ? "bg-[#F7F5F0]/50" : "bg-white"}
                                >
                                    <td className="p-4 font-mono-label text-xs text-[#121710]">
                                        {inv.id}
                                    </td>
                                    <td className="p-4 text-[#121710]">
                                        {format(parseISO(inv.date), "d MMM yyyy")}
                                    </td>
                                    <td className="p-4 text-[#596155]">{inv.plan}</td>
                                    <td className="p-4 text-right text-[#121710]">
                                        ₹{inv.amount}
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="inline-flex items-center gap-1 rounded-sm border border-[#284226]/30 bg-[#284226]/10 px-1.5 py-0.5 font-mono-label text-[9px] text-[#284226]">
                                            Paid
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            type="button"
                                            data-testid={`invoice-download-${inv.id}`}
                                            className="inline-flex items-center gap-1 text-xs text-[#C45B38] hover:underline"
                                        >
                                            <Receipt size={12} /> Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Coupon history */}
            <section
                data-testid="billing-section-coupons"
                className="rounded-sm border border-[#D1CDBC] bg-white p-4 sm:p-6 lg:p-8"
            >
                <div className="flex items-start gap-3 mb-5">
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#C45B38]">
                        <BadgePercent size={14} />
                    </span>
                    <div>
                        <h3 className="font-display text-lg font-bold tracking-tight text-[#121710]">
                            Coupons &amp; savings
                        </h3>
                        <p className="mt-1 text-sm text-[#596155]">
                            Codes you've redeemed and how much they saved you.
                        </p>
                    </div>
                </div>
                {mockCouponHistory.length === 0 ? (
                    <div
                        data-testid="billing-coupons-empty"
                        className="rounded-sm border border-dashed border-[#D1CDBC] bg-[#F7F5F0] p-6 text-center text-sm text-[#596155]"
                    >
                        No coupons redeemed yet.
                    </div>
                ) : (
                    <ul className="space-y-2" data-testid="billing-coupon-list">
                        {(mockCouponHistory as CouponEntry[]).map((c) => (
                            <li
                                key={c.bookingId}
                                data-testid={`coupon-row-${c.code}`}
                                className="flex flex-col gap-2 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center rounded-sm bg-[#284226] text-[#F7F5F0] px-2 py-0.5 font-mono-label text-[10px]">
                                        {c.code}
                                    </span>
                                    <p className="text-sm text-[#596155]">
                                        Applied to{" "}
                                        <span className="text-[#121710]">{c.bookingId}</span>{" "}
                                        on {format(parseISO(c.appliedOn), "d MMM yyyy")}
                                    </p>
                                </div>
                                <p className="font-display text-base font-bold tracking-tight text-[#C45B38]">
                                    − ₹{c.savedAmount}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default BillingTab;
