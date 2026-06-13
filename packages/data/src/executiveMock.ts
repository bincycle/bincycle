// Executive portal — mock data + persistent overrides via localStorage.
// Frontend-only. Statuses live on the executive side and do not affect the
// customer-facing mockPickups feed.
import { StatusMeta } from "./types";

const AUTH_KEY = "bincycle:executive:auth";
const PICKUPS_KEY = "bincycle:executive:pickups";

// ---------- Status meta ----------
export type ExecStatusKey =
    | "assigned"
    | "accepted"
    | "on_the_way"
    | "arrived"
    | "collecting"
    | "payment_pending"
    | "completed";

export const EXEC_STATUS: Record<ExecStatusKey, StatusMeta> = {
    assigned: {
        label: "Assigned",
        dot: "bg-[#284226]",
        chip: "bg-[#284226]/10 text-[#284226] border-[#284226]/30",
    },
    accepted: {
        label: "Accepted",
        dot: "bg-[#284226]",
        chip: "bg-[#284226]/10 text-[#284226] border-[#284226]/30",
    },
    on_the_way: {
        label: "On the way",
        dot: "bg-[#C45B38]",
        chip: "bg-[#C45B38]/10 text-[#C45B38] border-[#C45B38]/30",
    },
    arrived: {
        label: "Arrived",
        dot: "bg-[#C45B38]",
        chip: "bg-[#C45B38]/10 text-[#C45B38] border-[#C45B38]/30",
    },
    collecting: {
        label: "Collecting",
        dot: "bg-[#C45B38]",
        chip: "bg-[#C45B38]/10 text-[#C45B38] border-[#C45B38]/30",
    },
    payment_pending: {
        label: "Payment pending",
        dot: "bg-[#C45B38]",
        chip: "bg-[#C45B38]/20 text-[#C45B38] border-[#C45B38]",
    },
    completed: {
        label: "Completed",
        dot: "bg-[#596155]",
        chip: "bg-[#596155]/10 text-[#596155] border-[#596155]/40",
    },
};

export const STATUS_ORDER: ExecStatusKey[] = [
    "assigned",
    "accepted",
    "on_the_way",
    "arrived",
    "collecting",
    "payment_pending",
    "completed",
];

export const STATUS_DESCRIPTION: Record<ExecStatusKey, string> = {
    assigned: "Pickup assigned to you. Accept to begin.",
    accepted: "You've accepted the route. Start the trip when ready.",
    on_the_way: "On the way to the customer.",
    arrived: "Arrived at the doorstep.",
    collecting: "Sorting and weighing items.",
    payment_pending: "Collecting payment from the customer.",
    completed: "Pickup complete. Bags routed to depot.",
};

// ---------- Item categories with mock rates ----------
export interface ItemCategory {
    id: string;
    label: string;
    rate: number;
}

export const ITEM_CATEGORIES: ItemCategory[] = [
    { id: "dry", label: "Dry recyclables", rate: 8 },
    { id: "wet", label: "Wet / organic", rate: 2 },
    { id: "paper", label: "Paper & cardboard", rate: 6 },
    { id: "metal", label: "Metal", rate: 20 },
    { id: "glass", label: "Glass", rate: 4 },
    { id: "ewaste", label: "E-waste", rate: 15 },
];

// ---------- Auth ----------
const safeGet = <T,>(k: string, f: T): T => {
    try {
        const r = localStorage.getItem(k);
        return r ? (JSON.parse(r) as T) : f;
    } catch {
        return f;
    }
};
const safeSet = <T,>(k: string, v: T): void => {
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch {
        /* ignore */
    }
};

export interface ExecProfile {
    empId: string;
    name: string;
    phone: string;
    email: string;
    zone: string;
    vehicle: string;
    joinedAt: string;
    rating: number;
    avatar: string;
}

export const execProfile: ExecProfile = {
    empId: "EXEC-0042",
    name: "Vikram Patel",
    phone: "+91 98765 12345",
    email: "vikram@bincycle.in",
    zone: "Bengaluru East",
    vehicle: "EV-T-018",
    joinedAt: "2024-03-15T00:00:00.000Z",
    rating: 4.8,
    avatar:
        "https://api.dicebear.com/9.x/initials/svg?seed=Vikram%20Patel&backgroundColor=284226&textColor=F7F5F0",
};

export interface ExecAuth {
    empId: string;
    name: string;
    signedInAt: string;
}

export const getExecAuth = (): ExecAuth | null => safeGet(AUTH_KEY, null);
export const signInExec = (): void => {
    safeSet(AUTH_KEY, {
        empId: execProfile.empId,
        name: execProfile.name,
        signedInAt: new Date().toISOString(),
    });
};
export const signOutExec = (): void => {
    try {
        localStorage.removeItem(AUTH_KEY);
    } catch {
        /* ignore */
    }
};

// ---------- Pickups ----------
const todayIso = (hours = 0, minutes = 0): string => {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
};
const minutesFromNow = (m: number): string => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + m);
    return d.toISOString();
};

export interface PickupItem {
    category: string;
    weight: number;
    qty: number;
    notes: string;
}

export interface PickupPayment {
    method: string;
    amount: number;
    collectedAt: string;
}

export interface PickupCustomer {
    name: string;
    phone: string;
}

export interface PickupAddress {
    label: string;
    line1: string;
    city: string;
    pincode: string;
    lat?: number;
    lng?: number;
}

export interface PickupTimelineEntry {
    key: string;
    at: string;
}

export interface ExecPickup {
    id: string;
    status: ExecStatusKey;
    scheduledFor: string;
    slot: string;
    customer: PickupCustomer;
    address: PickupAddress;
    notes: string;
    customerImages: string[];
    items: PickupItem[];
    photos: string[];
    payment: PickupPayment | null;
    timeline: PickupTimelineEntry[];
}

// Seed list. We persist any modifications in localStorage so the demo feels
// alive across navigations.
const seed: ExecPickup[] = [
    {
        id: "EXP-9034",
        status: "on_the_way",
        scheduledFor: todayIso(11, 0),
        slot: "11:00 — 13:00",
        customer: {
            name: "Aanya Rao",
            phone: "+91 98201 11122",
        },
        address: {
            label: "Home",
            line1: "12, Hibiscus Lane, Indiranagar",
            city: "Bengaluru",
            pincode: "560038",
            lat: 12.9784,
            lng: 77.6408,
        },
        notes:
            "Gate code 4-5-2-1. Two dry bags + a small e-waste box near the side gate.",
        customerImages: [],
        items: [],
        photos: [],
        payment: null,
        timeline: [
            { key: "assigned", at: todayIso(7, 12) },
            { key: "accepted", at: todayIso(7, 30) },
            { key: "on_the_way", at: minutesFromNow(-15) },
        ],
    },
    {
        id: "EXP-9035",
        status: "assigned",
        scheduledFor: todayIso(14, 0),
        slot: "14:00 — 16:00",
        customer: {
            name: "Karan Mehta",
            phone: "+91 98301 22233",
        },
        address: {
            label: "Office",
            line1: "Tower B, 4th Floor, Prestige Tech Park",
            city: "Bengaluru",
            pincode: "560103",
        },
        notes: "Reception will call when you arrive. Lots of cardboard.",
        customerImages: [],
        items: [],
        photos: [],
        payment: null,
        timeline: [{ key: "assigned", at: todayIso(7, 10) }],
    },
    {
        id: "EXP-9036",
        status: "assigned",
        scheduledFor: todayIso(16, 0),
        slot: "16:00 — 18:00",
        customer: {
            name: "Sneha Pillai",
            phone: "+91 98401 33344",
        },
        address: {
            label: "Studio",
            line1: "B-301, Lotus Heights, Andheri West",
            city: "Mumbai",
            pincode: "400053",
        },
        notes: "",
        customerImages: [],
        items: [],
        photos: [],
        payment: null,
        timeline: [{ key: "assigned", at: todayIso(7, 8) }],
    },
    {
        id: "EXP-9020",
        status: "completed",
        scheduledFor: todayIso(8, 30),
        slot: "08:00 — 09:00",
        customer: {
            name: "Rohit Sharma",
            phone: "+91 99001 55566",
        },
        address: {
            label: "Home",
            line1: "Flat 304, Brigade Meadows",
            city: "Bengaluru",
            pincode: "560082",
        },
        notes: "",
        customerImages: [],
        items: [
            { category: "dry", weight: 4.2, qty: 3, notes: "" },
            { category: "paper", weight: 2.1, qty: 1, notes: "" },
        ],
        photos: [],
        payment: { method: "upi", amount: 46, collectedAt: todayIso(9, 5) },
        timeline: [
            { key: "assigned", at: todayIso(6, 30) },
            { key: "accepted", at: todayIso(6, 45) },
            { key: "on_the_way", at: todayIso(7, 50) },
            { key: "arrived", at: todayIso(8, 30) },
            { key: "collecting", at: todayIso(8, 32) },
            { key: "payment_pending", at: todayIso(8, 58) },
            { key: "completed", at: todayIso(9, 5) },
        ],
    },
    {
        id: "EXP-9021",
        status: "completed",
        scheduledFor: todayIso(10, 0),
        slot: "10:00 — 11:00",
        customer: {
            name: "Priya Iyer",
            phone: "+91 99201 66677",
        },
        address: {
            label: "PG",
            line1: "House 7, 4th Cross, Koramangala 5th Block",
            city: "Bengaluru",
            pincode: "560095",
        },
        notes: "Door 5A.",
        customerImages: [],
        items: [
            { category: "ewaste", weight: 1.5, qty: 4, notes: "Old chargers" },
        ],
        photos: [],
        payment: { method: "cash", amount: 22, collectedAt: todayIso(10, 25) },
        timeline: [
            { key: "assigned", at: todayIso(7, 0) },
            { key: "accepted", at: todayIso(7, 10) },
            { key: "on_the_way", at: todayIso(9, 30) },
            { key: "arrived", at: todayIso(10, 1) },
            { key: "collecting", at: todayIso(10, 4) },
            { key: "payment_pending", at: todayIso(10, 20) },
            { key: "completed", at: todayIso(10, 25) },
        ],
    },
];

export const loadPickups = (): ExecPickup[] => {
    const stored = safeGet<ExecPickup[] | null>(PICKUPS_KEY, null);
    if (stored && Array.isArray(stored) && stored.length) return stored;
    safeSet(PICKUPS_KEY, seed);
    return seed;
};

export const savePickups = (list: ExecPickup[]): void =>
    safeSet(PICKUPS_KEY, list);

export const findPickup = (id: string): ExecPickup | null =>
    loadPickups().find((p) => p.id === id) || null;

export const updatePickup = (
    id: string,
    patch: Partial<ExecPickup>
): ExecPickup | undefined => {
    const list = loadPickups();
    const next = list.map((p) => (p.id === id ? { ...p, ...patch } : p));
    savePickups(next);
    return next.find((p) => p.id === id);
};

export const advanceStatus = (
    id: string,
    nextStatus: ExecStatusKey,
    extra: Partial<ExecPickup> = {}
): ExecPickup | null => {
    const list = loadPickups();
    const target = list.find((p) => p.id === id);
    if (!target) return null;
    const timeline: PickupTimelineEntry[] = [
        ...(target.timeline || []),
        { key: nextStatus, at: new Date().toISOString() },
    ];
    const updated: ExecPickup = {
        ...target,
        ...extra,
        status: nextStatus,
        timeline,
    };
    savePickups(list.map((p) => (p.id === id ? updated : p)));
    return updated;
};

// ---------- Derived stats ----------
const isToday = (iso: string): boolean => {
    const d = new Date(iso);
    const n = new Date();
    return (
        d.getFullYear() === n.getFullYear() &&
        d.getMonth() === n.getMonth() &&
        d.getDate() === n.getDate()
    );
};

export interface ExecStats {
    todaysCount: number;
    pendingCount: number;
    completedCount: number;
    totalKg: number;
    totalEarn: number;
}

export const computeStats = (pickups: ExecPickup[]): ExecStats => {
    const todays = pickups.filter((p) => isToday(p.scheduledFor));
    const pending = todays.filter((p) => p.status !== "completed");
    const completed = todays.filter((p) => p.status === "completed");
    const totalKg = completed.reduce(
        (s, p) =>
            s + (p.items || []).reduce((x, i) => x + (i.weight || 0), 0),
        0
    );
    const totalEarn = completed.reduce(
        (s, p) => s + (p.payment?.amount || 0),
        0
    );
    return {
        todaysCount: todays.length,
        pendingCount: pending.length,
        completedCount: completed.length,
        totalKg: Number(totalKg.toFixed(1)),
        totalEarn,
    };
};

export interface PricedItem extends PickupItem {
    label: string;
    rate: number;
    subtotal: number;
}

export interface PricingResult {
    rows: PricedItem[];
    totalWeight: number;
    total: number;
}

export const computePricing = (items: PickupItem[]): PricingResult => {
    const rows: PricedItem[] = items.map((it) => {
        const cat = ITEM_CATEGORIES.find((c) => c.id === it.category);
        const rate = cat?.rate || 0;
        const subtotal = Math.round((it.weight || 0) * rate);
        return { ...it, label: cat?.label || it.category, rate, subtotal };
    });
    const totalWeight = rows.reduce((s, r) => s + (r.weight || 0), 0);
    const total = rows.reduce((s, r) => s + r.subtotal, 0);
    return { rows, totalWeight: Number(totalWeight.toFixed(2)), total };
};
