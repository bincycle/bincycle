// Mock pickup history + helpers + coupons.
import { StatusMeta, TimelineStep } from "./types";

const STORE_KEY = "bincycle:pickups";

export type PickupStatus =
    | "scheduled"
    | "in_progress"
    | "completed"
    | "cancelled";

export interface Pickup {
    id: string;
    date: string;
    slotId: string;
    addressId: string;
    notes: string;
    images: string[];
    status: PickupStatus;
    createdAt: string;
    fee: number;
    discount: number;
    couponCode: string | null;
    kgPicked?: number;
    co2Saved?: number;
}

// status: "scheduled" | "in_progress" | "completed" | "cancelled"
export const seedPickups: Pickup[] = [
    {
        id: "BC-8431",
        date: nextDayISO(2),
        slotId: "ts3",
        addressId: "addr_1",
        notes: "Two bags + a small e-waste box. Gate code 4-5-2-1.",
        images: [],
        status: "scheduled",
        createdAt: hoursAgoISO(36),
        fee: 149,
        discount: 0,
        couponCode: null,
    },
    {
        id: "BC-8307",
        date: nextDayISO(0),
        slotId: "ts2",
        addressId: "addr_2",
        notes: "Cardboard only. Lots of it — Diwali aftermath.",
        images: [],
        status: "in_progress",
        createdAt: hoursAgoISO(48),
        fee: 149,
        discount: 20,
        couponCode: "GREEN20",
    },
    {
        id: "BC-7984",
        date: pastDayISO(4),
        slotId: "ts4",
        addressId: "addr_3",
        notes: "Mostly kitchen waste this week.",
        images: [],
        status: "completed",
        createdAt: pastDayISO(5),
        fee: 149,
        discount: 0,
        couponCode: null,
        kgPicked: 6.4,
        co2Saved: 1.8,
    },
    {
        id: "BC-7712",
        date: pastDayISO(11),
        slotId: "ts5",
        addressId: "addr_1",
        notes: "",
        images: [],
        status: "completed",
        createdAt: pastDayISO(12),
        fee: 149,
        discount: 50,
        couponCode: "WELCOME50",
        kgPicked: 9.2,
        co2Saved: 2.7,
    },
    {
        id: "BC-7508",
        date: pastDayISO(18),
        slotId: "ts2",
        addressId: "addr_4",
        notes: "Two large jute bags by main door.",
        images: [],
        status: "completed",
        createdAt: pastDayISO(19),
        fee: 149,
        discount: 0,
        couponCode: null,
        kgPicked: 4.1,
        co2Saved: 1.2,
    },
    {
        id: "BC-7321",
        date: pastDayISO(26),
        slotId: "ts1",
        addressId: "addr_2",
        notes: "",
        images: [],
        status: "cancelled",
        createdAt: pastDayISO(27),
        fee: 149,
        discount: 0,
        couponCode: null,
    },
];

function nextDayISO(daysAhead: number): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString();
}
function pastDayISO(daysAgo: number): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
}
function hoursAgoISO(hrs: number): string {
    const d = new Date();
    d.setHours(d.getHours() - hrs);
    return d.toISOString();
}

export const loadUserPickups = (): Pickup[] => {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as Pickup[]) : [];
    } catch {
        return [];
    }
};

export const saveUserPickup = (pickup: Pickup): void => {
    try {
        const existing = loadUserPickups();
        const next = [pickup, ...existing];
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch (e) {
        console.warn(
            "Could not save pickup:",
            e instanceof Error ? e.message : e
        );
    }
};

export const loadAllPickups = (): Pickup[] => {
    // Newest first by createdAt
    const all = [...loadUserPickups(), ...seedPickups];
    return all.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const findPickupById = (id: string): Pickup | null =>
    loadAllPickups().find((p) => p.id === id) || null;

// --- Status helpers ---
export const STATUS_META: Record<PickupStatus, StatusMeta> = {
    scheduled: {
        label: "Scheduled",
        dot: "bg-[#284226]",
        chip: "bg-[#284226]/10 text-[#284226] border-[#284226]/30",
    },
    in_progress: {
        label: "In progress",
        dot: "bg-[#C45B38]",
        chip: "bg-[#C45B38]/10 text-[#C45B38] border-[#C45B38]/30",
    },
    completed: {
        label: "Completed",
        dot: "bg-[#596155]",
        chip: "bg-[#596155]/10 text-[#596155] border-[#596155]/40",
    },
    cancelled: {
        label: "Cancelled",
        dot: "bg-[#171A15]",
        chip: "bg-[#171A15]/10 text-[#171A15] border-[#171A15]/30",
    },
};

export const isUpcoming = (p: Pickup): boolean =>
    p.status === "scheduled" || p.status === "in_progress";
export const isFinished = (p: Pickup): boolean =>
    p.status === "completed" || p.status === "cancelled";

// --- Coupons ---
export type CouponType = "percent" | "flat";

export interface Coupon {
    code: string;
    description: string;
    type: CouponType;
    value: number;
}

export const coupons: Coupon[] = [
    {
        code: "WELCOME50",
        description: "50% off your first pickup",
        type: "percent",
        value: 50,
    },
    {
        code: "GREEN20",
        description: "Flat ₹20 off",
        type: "flat",
        value: 20,
    },
    {
        code: "NEWYEAR10",
        description: "10% off your booking",
        type: "percent",
        value: 10,
    },
    {
        code: "FIRSTPICKUP",
        description: "Your first pickup is on us",
        type: "flat",
        value: 49,
    },
];

export const findCoupon = (code?: string | null): Coupon | null => {
    if (!code) return null;
    return (
        coupons.find(
            (c) => c.code.toLowerCase() === code.trim().toLowerCase()
        ) || null
    );
};

// ----- Pickup tracking timeline -----
export const computeDiscount = (
    coupon: Coupon | null,
    baseFee: number
): number => {
    if (!coupon) return 0;
    if (coupon.type === "percent") {
        // Math.floor so e.g. 50% off ₹149 → ₹74 discount → clean ₹75 total
        return Math.min(Math.floor((baseFee * coupon.value) / 100), baseFee);
    }
    return Math.min(coupon.value, baseFee);
};

// Returns an ordered list of timeline steps for a given pickup.
// Each step: { key, label, description, at (ISO or null), state: 'done'|'current'|'upcoming'|'cancelled' }
export const getPickupTimeline = (pickup: Pickup | null): TimelineStep[] => {
    if (!pickup) return [];
    const created = pickup.createdAt;
    const scheduled = pickup.date;

    const minutes = (iso: string, m: number): string => {
        const d = new Date(iso);
        d.setMinutes(d.getMinutes() + m);
        return d.toISOString();
    };
    const hours = (iso: string, h: number): string => minutes(iso, h * 60);

    if (pickup.status === "cancelled") {
        return [
            {
                key: "scheduled",
                label: "Booking received",
                description: "We received your pickup request.",
                at: created,
                state: "done",
            },
            {
                key: "cancelled",
                label: "Pickup cancelled",
                description:
                    "This pickup was cancelled. No charges were applied.",
                at: hours(created, 2),
                state: "cancelled",
            },
        ];
    }

    const all: Omit<TimelineStep, "state">[] = [
        {
            key: "scheduled",
            label: "Booking received",
            description: "We received your pickup request.",
            at: created,
        },
        {
            key: "confirmed",
            label: "Booking confirmed",
            description: "Slot locked in and assigned to a route.",
            at: minutes(created, 5),
        },
        {
            key: "driver_assigned",
            label: "Driver assigned",
            description:
                "A Bincycle partner is dispatched to your address window.",
            at: hours(scheduled, -1),
        },
        {
            key: "in_progress",
            label: "Pickup in progress",
            description: "Your partner is on the way / collecting bags.",
            at: scheduled,
        },
        {
            key: "completed",
            label: "Recycled",
            description:
                "Bags weighed at depot and routed to verified recyclers.",
            at: hours(scheduled, 2),
        },
    ];

    if (pickup.status === "completed") {
        // Every step done — booking is finished, nothing should pulse.
        return all.map((s) => ({ ...s, state: "done" as const }));
    }

    // Mark state based on pickup.status
    const idxByStatus: Record<string, number> = {
        scheduled: 1, // arrived through 'confirmed'
        in_progress: 3, // partner en route
    };
    const currentIdx = idxByStatus[pickup.status] ?? 1;

    return all.map((s, i) => {
        if (i < currentIdx) return { ...s, state: "done" as const };
        if (i === currentIdx) return { ...s, state: "current" as const };
        return { ...s, at: null, state: "upcoming" as const };
    });
};

// ----- Referral mock -----
export interface ReferralInfo {
    code: string;
    perFriend: number;
    friendsJoined: number;
    earnedTotal: number;
}

export const referralInfo: ReferralInfo = {
    code: "AANYA100",
    perFriend: 100,
    friendsJoined: 3,
    earnedTotal: 300,
};
