// Admin portal — mock data + localStorage-backed mutators.
// Frontend-only. Lives in its own keyspace `bincycle:admin:*`.
import { Session, LoginHistoryEntry, StatusMeta, StatusState } from "./types";

const KEYS = {
    auth: "bincycle:admin:auth",
    profile: "bincycle:admin:profile",
    pickups: "bincycle:admin:pickups",
    execs: "bincycle:admin:execs",
    customers: "bincycle:admin:customers",
    sessions: "bincycle:admin:sessions",
} as const;

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

// ===== Demo creds =====
export const ADMIN_DEMO = {
    email: "admin@bincycle.in",
    password: "admin123",
};

// ===== Status meta (admin sees the full 7-state space) =====
export type AdminStatusKey =
    | "scheduled"
    | "confirmed"
    | "assigned"
    | "in_progress"
    | "payment_pending"
    | "completed"
    | "cancelled";

export const ADMIN_STATUS: Record<AdminStatusKey, StatusMeta> = {
    scheduled: {
        label: "Scheduled",
        dot: "bg-[#284226]",
        chip: "bg-[#284226]/10 text-[#284226] border-[#284226]/30",
    },
    confirmed: {
        label: "Confirmed",
        dot: "bg-[#284226]",
        chip: "bg-[#284226]/15 text-[#284226] border-[#284226]/40",
    },
    assigned: {
        label: "Assigned",
        dot: "bg-[#284226]",
        chip: "bg-[#284226]/20 text-[#284226] border-[#284226]/50",
    },
    in_progress: {
        label: "In progress",
        dot: "bg-[#C45B38]",
        chip: "bg-[#C45B38]/10 text-[#C45B38] border-[#C45B38]/30",
    },
    payment_pending: {
        label: "Payment pending",
        dot: "bg-[#C45B38]",
        chip: "bg-[#C45B38]/20 text-[#C45B38] border-[#C45B38]/40",
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

export const STATUS_ORDER: AdminStatusKey[] = [
    "scheduled",
    "confirmed",
    "assigned",
    "in_progress",
    "payment_pending",
    "completed",
    "cancelled",
];

// ===== Auth =====
export interface AdminAuth {
    email: string;
    signedInAt: string;
}

export const getAdminAuth = (): AdminAuth | null => safeGet(KEYS.auth, null);
export const signInAdmin = (email: string): void => {
    safeSet(KEYS.auth, {
        email,
        signedInAt: new Date().toISOString(),
    });
};
export const signOutAdmin = (): void => {
    try {
        localStorage.removeItem(KEYS.auth);
    } catch {
        /* ignore */
    }
};

// ===== Admin profile =====
export interface AdminProfileNotifications {
    emailAlerts: boolean;
    smsAlerts: boolean;
    weeklyDigest: boolean;
    cancellationAlerts: boolean;
}

export interface AdminProfilePreferences {
    defaultLanding: string;
    rowsPerPage: number;
    density: string;
}

export interface AdminProfile {
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string;
    employeeId: string;
    timezone: string;
    joinedAt: string;
    notifications: AdminProfileNotifications;
    preferences: AdminProfilePreferences;
}

const seedAdminProfile: AdminProfile = {
    name: "Meera Shankar",
    role: "Operations Lead",
    email: "admin@bincycle.in",
    phone: "+91 99001 23456",
    avatar:
        "https://api.dicebear.com/9.x/initials/svg?seed=Meera%20Shankar&backgroundColor=171A15&textColor=F7F5F0",
    employeeId: "ADM-0007",
    timezone: "Asia/Kolkata",
    joinedAt: "2024-01-10T00:00:00.000Z",
    notifications: {
        emailAlerts: true,
        smsAlerts: false,
        weeklyDigest: true,
        cancellationAlerts: true,
    },
    preferences: {
        defaultLanding: "overview",
        rowsPerPage: 25,
        density: "comfortable",
    },
};
export const getAdminProfile = (): AdminProfile =>
    safeGet(KEYS.profile, seedAdminProfile);
export const saveAdminProfile = (p: AdminProfile): void =>
    safeSet(KEYS.profile, p);

// ===== Sessions =====
const seedSessions = (): Session[] => {
    const now = Date.now();
    const h = 1000 * 60 * 60;
    return [
        {
            id: "s_cur",
            current: true,
            device: "MacBook Pro",
            browser: "Chrome 128",
            platform: "macOS 14.5",
            location: "Bengaluru, IN",
            lastActiveAt: new Date(now).toISOString(),
        },
        {
            id: "s_ipad",
            current: false,
            device: "iPad Pro",
            browser: "Safari 17",
            platform: "iPadOS 17",
            location: "Bengaluru, IN",
            lastActiveAt: new Date(now - 8 * h).toISOString(),
        },
        {
            id: "s_office",
            current: false,
            device: "Ops Workstation",
            browser: "Edge 128",
            platform: "Windows 11",
            location: "Gurugram, IN",
            lastActiveAt: new Date(now - 3 * 24 * h).toISOString(),
        },
    ];
};
export const getAdminSessions = (): Session[] => {
    const stored = safeGet<Session[] | null>(KEYS.sessions, null);
    if (stored && Array.isArray(stored) && stored.length) return stored;
    const fresh = seedSessions();
    safeSet(KEYS.sessions, fresh);
    return fresh;
};
export const saveAdminSessions = (l: Session[]): void =>
    safeSet(KEYS.sessions, l);

export const adminLoginHistory: LoginHistoryEntry[] = (() => {
    const now = Date.now();
    const h = 1000 * 60 * 60;
    return [
        {
            id: "l1",
            at: new Date(now - 0.3 * h).toISOString(),
            device: "MacBook Pro",
            browser: "Chrome 128",
            location: "Bengaluru, IN",
            status: "success",
        },
        {
            id: "l2",
            at: new Date(now - 8 * h).toISOString(),
            device: "iPad Pro",
            browser: "Safari 17",
            location: "Bengaluru, IN",
            status: "success",
        },
        {
            id: "l3",
            at: new Date(now - 22 * h).toISOString(),
            device: "Unknown",
            browser: "Firefox 121",
            location: "Kolkata, IN",
            status: "failed",
        },
        {
            id: "l4",
            at: new Date(now - 3 * 24 * h).toISOString(),
            device: "Ops Workstation",
            browser: "Edge 128",
            location: "Gurugram, IN",
            status: "success",
        },
    ];
})();

// ===== Helpers =====
const daysAgo = (n: number): string => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d.toISOString();
};
const daysAhead = (n: number): string => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d.toISOString();
};
const hoursAgo = (n: number): string => {
    const d = new Date();
    d.setHours(d.getHours() - n);
    return d.toISOString();
};

// ===== Executives =====
export type ExecutiveStatus = "active" | "inactive";

export interface AdminExecutive {
    id: string;
    empId: string;
    name: string;
    email: string;
    phone: string;
    zone: string;
    vehicle: string;
    status: ExecutiveStatus;
    rating: number;
    joinedAt: string;
    totalPickups: number;
    completedPickups: number;
    earnings: number;
}

export interface CreateExecutiveInput {
    empId: string;
    name: string;
    email: string;
    phone: string;
    zone: string;
    vehicle?: string;
}

const seedExecutives: AdminExecutive[] = [
    {
        id: "exec_01",
        empId: "EXEC-0042",
        name: "Vikram Patel",
        email: "vikram@bincycle.in",
        phone: "+91 98765 12345",
        zone: "Bengaluru East",
        vehicle: "EV-T-018",
        status: "active",
        rating: 4.8,
        joinedAt: daysAgo(420),
        totalPickups: 312,
        completedPickups: 298,
        earnings: 18420,
    },
    {
        id: "exec_02",
        empId: "EXEC-0043",
        name: "Rajesh Kumar",
        email: "rajesh@bincycle.in",
        phone: "+91 98212 33445",
        zone: "Bengaluru South",
        vehicle: "EV-T-019",
        status: "active",
        rating: 4.6,
        joinedAt: daysAgo(380),
        totalPickups: 268,
        completedPickups: 251,
        earnings: 15890,
    },
    {
        id: "exec_03",
        empId: "EXEC-0051",
        name: "Anita Desai",
        email: "anita@bincycle.in",
        phone: "+91 98321 44556",
        zone: "Bengaluru North",
        vehicle: "EV-T-022",
        status: "active",
        rating: 4.9,
        joinedAt: daysAgo(310),
        totalPickups: 245,
        completedPickups: 240,
        earnings: 14760,
    },
    {
        id: "exec_04",
        empId: "EXEC-0058",
        name: "Sanjay Verma",
        email: "sanjay@bincycle.in",
        phone: "+91 98431 55667",
        zone: "Mumbai West",
        vehicle: "EV-T-031",
        status: "active",
        rating: 4.5,
        joinedAt: daysAgo(260),
        totalPickups: 198,
        completedPickups: 184,
        earnings: 11240,
    },
    {
        id: "exec_05",
        empId: "EXEC-0063",
        name: "Priya Joshi",
        email: "priya.j@bincycle.in",
        phone: "+91 98541 66778",
        zone: "Gurugram",
        vehicle: "EV-T-040",
        status: "active",
        rating: 4.7,
        joinedAt: daysAgo(190),
        totalPickups: 162,
        completedPickups: 155,
        earnings: 9320,
    },
    {
        id: "exec_06",
        empId: "EXEC-0071",
        name: "Mohammed Iqbal",
        email: "iqbal@bincycle.in",
        phone: "+91 98651 77889",
        zone: "Hyderabad",
        vehicle: "EV-T-048",
        status: "active",
        rating: 4.4,
        joinedAt: daysAgo(150),
        totalPickups: 124,
        completedPickups: 118,
        earnings: 7280,
    },
    {
        id: "exec_07",
        empId: "EXEC-0079",
        name: "Deepak Reddy",
        email: "deepak@bincycle.in",
        phone: "+91 98761 88990",
        zone: "Bengaluru East",
        vehicle: "EV-T-055",
        status: "inactive",
        rating: 4.2,
        joinedAt: daysAgo(110),
        totalPickups: 68,
        completedPickups: 61,
        earnings: 3920,
    },
    {
        id: "exec_08",
        empId: "EXEC-0085",
        name: "Sunita Rao",
        email: "sunita@bincycle.in",
        phone: "+91 98871 99001",
        zone: "Pune",
        vehicle: "EV-T-062",
        status: "active",
        rating: 4.7,
        joinedAt: daysAgo(80),
        totalPickups: 52,
        completedPickups: 49,
        earnings: 3160,
    },
];

export const loadExecutives = (): AdminExecutive[] => {
    const stored = safeGet<AdminExecutive[] | null>(KEYS.execs, null);
    if (stored && Array.isArray(stored) && stored.length) return stored;
    safeSet(KEYS.execs, seedExecutives);
    return seedExecutives;
};
export const saveExecutives = (l: AdminExecutive[]): void =>
    safeSet(KEYS.execs, l);
export const findExecutive = (id: string): AdminExecutive | null =>
    loadExecutives().find((e) => e.id === id) || null;

export const createExecutive = (
    input: CreateExecutiveInput
): AdminExecutive => {
    const list = loadExecutives();
    const id = `exec_${String(Date.now()).slice(-8)}`;
    const newOne: AdminExecutive = {
        id,
        empId: input.empId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        zone: input.zone,
        vehicle: input.vehicle || "—",
        status: "active",
        rating: 0,
        joinedAt: new Date().toISOString(),
        totalPickups: 0,
        completedPickups: 0,
        earnings: 0,
    };
    saveExecutives([newOne, ...list]);
    return newOne;
};
export const updateExecutive = (
    id: string,
    patch: Partial<AdminExecutive>
): AdminExecutive | undefined => {
    const list = loadExecutives();
    const next = list.map((e) => (e.id === id ? { ...e, ...patch } : e));
    saveExecutives(next);
    return next.find((e) => e.id === id);
};

// ===== Customers =====
export interface CustomerAddress {
    id: string;
    label: string;
    line1: string;
    city: string;
    pincode: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    joinedAt: string;
    avatar: string;
    plan: string;
    addresses: CustomerAddress[];
}

const seedCustomers: Customer[] = [
    {
        id: "cus_01",
        name: "Aanya Rao",
        email: "aanya@bincycle.in",
        phone: "+91 98201 11122",
        joinedAt: daysAgo(180),
        avatar: "https://ui.shadcn.com/avatars/01.png",
        plan: "Weekly",
        addresses: [
            {
                id: "a1",
                label: "Home",
                line1: "12, Hibiscus Lane, Indiranagar",
                city: "Bengaluru",
                pincode: "560038",
            },
            {
                id: "a2",
                label: "Office",
                line1: "Tower B, Prestige Tech Park",
                city: "Bengaluru",
                pincode: "560103",
            },
        ],
    },
    {
        id: "cus_02",
        name: "Karan Mehta",
        email: "karan.m@gmail.com",
        phone: "+91 98301 22233",
        joinedAt: daysAgo(220),
        avatar: "https://ui.shadcn.com/avatars/02.png",
        plan: "Household+",
        addresses: [
            {
                id: "a1",
                label: "Office",
                line1: "Tower B, Prestige Tech Park",
                city: "Bengaluru",
                pincode: "560103",
            },
        ],
    },
    {
        id: "cus_03",
        name: "Sneha Pillai",
        email: "sneha.p@yahoo.in",
        phone: "+91 98401 33344",
        joinedAt: daysAgo(140),
        avatar: "https://ui.shadcn.com/avatars/03.png",
        plan: "Weekly",
        addresses: [
            {
                id: "a1",
                label: "Studio",
                line1: "B-301, Lotus Heights, Andheri West",
                city: "Mumbai",
                pincode: "400053",
            },
        ],
    },
    {
        id: "cus_04",
        name: "Rohit Sharma",
        email: "rohit.s@outlook.com",
        phone: "+91 99001 55566",
        joinedAt: daysAgo(95),
        avatar: "https://ui.shadcn.com/avatars/04.png",
        plan: "On-demand",
        addresses: [
            {
                id: "a1",
                label: "Home",
                line1: "Flat 304, Brigade Meadows",
                city: "Bengaluru",
                pincode: "560082",
            },
        ],
    },
    {
        id: "cus_05",
        name: "Priya Iyer",
        email: "priya.iyer@gmail.com",
        phone: "+91 99201 66677",
        joinedAt: daysAgo(70),
        avatar: "https://ui.shadcn.com/avatars/05.png",
        plan: "Weekly",
        addresses: [
            {
                id: "a1",
                label: "PG",
                line1: "House 7, 4th Cross, Koramangala 5th Block",
                city: "Bengaluru",
                pincode: "560095",
            },
        ],
    },
    {
        id: "cus_06",
        name: "Arjun Nair",
        email: "arjun.nair@proton.me",
        phone: "+91 99311 77788",
        joinedAt: daysAgo(50),
        avatar: "https://ui.shadcn.com/avatars/06.png",
        plan: "On-demand",
        addresses: [
            {
                id: "a1",
                label: "Home",
                line1: "Plot 22, Sector 14, DLF Phase III",
                city: "Gurugram",
                pincode: "122002",
            },
        ],
    },
    {
        id: "cus_07",
        name: "Tanvi Shah",
        email: "tanvi.shah@gmail.com",
        phone: "+91 99411 88899",
        joinedAt: daysAgo(40),
        avatar: "https://ui.shadcn.com/avatars/01.png",
        plan: "Weekly",
        addresses: [
            {
                id: "a1",
                label: "Home",
                line1: "1404, Lodha World One",
                city: "Mumbai",
                pincode: "400011",
            },
        ],
    },
    {
        id: "cus_08",
        name: "Vikas Sinha",
        email: "vikas.sinha@hotmail.com",
        phone: "+91 99511 99900",
        joinedAt: daysAgo(28),
        avatar: "https://ui.shadcn.com/avatars/02.png",
        plan: "Household+",
        addresses: [
            {
                id: "a1",
                label: "Home",
                line1: "Villa 12, Jubilee Hills",
                city: "Hyderabad",
                pincode: "500033",
            },
        ],
    },
    {
        id: "cus_09",
        name: "Neha Gupta",
        email: "neha.g@gmail.com",
        phone: "+91 99611 12200",
        joinedAt: daysAgo(20),
        avatar: "https://ui.shadcn.com/avatars/03.png",
        plan: "Weekly",
        addresses: [
            {
                id: "a1",
                label: "Apartment",
                line1: "Tower A 1801, Park View Residency",
                city: "Pune",
                pincode: "411014",
            },
        ],
    },
    {
        id: "cus_10",
        name: "Ishaan Kapoor",
        email: "ishaan.k@gmail.com",
        phone: "+91 99711 23311",
        joinedAt: daysAgo(12),
        avatar: "https://ui.shadcn.com/avatars/04.png",
        plan: "On-demand",
        addresses: [
            {
                id: "a1",
                label: "Home",
                line1: "C-12, Greater Kailash II",
                city: "New Delhi",
                pincode: "110048",
            },
        ],
    },
    {
        id: "cus_11",
        name: "Riya Banerjee",
        email: "riya.b@gmail.com",
        phone: "+91 99811 34422",
        joinedAt: daysAgo(8),
        avatar: "https://ui.shadcn.com/avatars/05.png",
        plan: "Weekly",
        addresses: [
            {
                id: "a1",
                label: "Home",
                line1: "5/3 Salt Lake Sector V",
                city: "Kolkata",
                pincode: "700091",
            },
        ],
    },
    {
        id: "cus_12",
        name: "Aditya Menon",
        email: "aditya.m@outlook.com",
        phone: "+91 99911 45533",
        joinedAt: daysAgo(5),
        avatar: "https://ui.shadcn.com/avatars/06.png",
        plan: "On-demand",
        addresses: [
            {
                id: "a1",
                label: "Home",
                line1: "Flat 7, Marine Drive",
                city: "Kochi",
                pincode: "682011",
            },
        ],
    },
];

export const loadCustomers = (): Customer[] => {
    const stored = safeGet<Customer[] | null>(KEYS.customers, null);
    if (stored && Array.isArray(stored) && stored.length) return stored;
    safeSet(KEYS.customers, seedCustomers);
    return seedCustomers;
};
export const findCustomer = (id: string): Customer | null =>
    loadCustomers().find((c) => c.id === id) || null;

// ===== Pickups (admin global view) =====
const TIME_SLOTS = {
    s1: "07:00 — 09:00",
    s2: "09:00 — 11:00",
    s3: "11:00 — 13:00",
    s4: "14:00 — 16:00",
    s5: "16:00 — 18:00",
} as const;

export type AssignmentAction = "assigned" | "reassigned";

export interface AssignmentHistoryEntry {
    at: string;
    action: AssignmentAction;
    executiveId: string | null;
    previousExecutiveId?: string | null;
    actor: string;
}

export type PaymentMethodType = "upi" | "cash" | "card";

export interface AdminPickup {
    id: string;
    customerId: string;
    executiveId: string | null;
    date: string;
    slot: string;
    addressIdx: number;
    status: AdminStatusKey;
    notes: string;
    amount: number;
    couponCode: string | null;
    weightKg: number | null;
    images: string[];
    paymentMethod: PaymentMethodType | null;
    paymentAt: string | null;
    createdAt: string;
    assignmentHistory: AssignmentHistoryEntry[];
}

const seedPickups: AdminPickup[] = [
    // Today + future (scheduled / confirmed / assigned)
    {
        id: "BC-9101",
        customerId: "cus_01",
        executiveId: null,
        date: daysAhead(1),
        slot: TIME_SLOTS.s3,
        addressIdx: 0,
        status: "scheduled",
        notes: "Two bags + e-waste. Gate code 4521.",
        amount: 149,
        couponCode: null,
        weightKg: null,
        images: [],
        paymentMethod: null,
        paymentAt: null,
        createdAt: hoursAgo(6),
        assignmentHistory: [],
    },
    {
        id: "BC-9102",
        customerId: "cus_03",
        executiveId: null,
        date: daysAhead(2),
        slot: TIME_SLOTS.s4,
        addressIdx: 0,
        status: "scheduled",
        notes: "Old electronics + recyclables.",
        amount: 149,
        couponCode: null,
        weightKg: null,
        images: [],
        paymentMethod: null,
        paymentAt: null,
        createdAt: hoursAgo(8),
        assignmentHistory: [],
    },
    {
        id: "BC-9103",
        customerId: "cus_07",
        executiveId: "exec_04",
        date: daysAhead(1),
        slot: TIME_SLOTS.s5,
        addressIdx: 0,
        status: "confirmed",
        notes: "Bulky cardboard, post-Diwali.",
        amount: 199,
        couponCode: null,
        weightKg: null,
        images: [],
        paymentMethod: null,
        paymentAt: null,
        createdAt: hoursAgo(12),
        assignmentHistory: [
            {
                at: hoursAgo(11),
                action: "assigned",
                executiveId: "exec_04",
                actor: "auto-router",
            },
        ],
    },
    {
        id: "BC-9104",
        customerId: "cus_02",
        executiveId: "exec_01",
        date: daysAhead(0),
        slot: TIME_SLOTS.s4,
        addressIdx: 0,
        status: "assigned",
        notes: "Cardboard pickup only.",
        amount: 149,
        couponCode: "GREEN20",
        weightKg: null,
        images: [],
        paymentMethod: null,
        paymentAt: null,
        createdAt: hoursAgo(20),
        assignmentHistory: [
            {
                at: hoursAgo(19),
                action: "assigned",
                executiveId: "exec_01",
                actor: "Meera Shankar",
            },
        ],
    },
    {
        id: "BC-9105",
        customerId: "cus_05",
        executiveId: "exec_03",
        date: daysAhead(0),
        slot: TIME_SLOTS.s3,
        addressIdx: 0,
        status: "in_progress",
        notes: "Mom called — leave at neighbours if no one's home.",
        amount: 149,
        couponCode: null,
        weightKg: null,
        images: [],
        paymentMethod: null,
        paymentAt: null,
        createdAt: hoursAgo(28),
        assignmentHistory: [
            {
                at: hoursAgo(24),
                action: "assigned",
                executiveId: "exec_03",
                actor: "Meera Shankar",
            },
        ],
    },
    {
        id: "BC-9106",
        customerId: "cus_06",
        executiveId: "exec_05",
        date: daysAhead(0),
        slot: TIME_SLOTS.s2,
        addressIdx: 0,
        status: "payment_pending",
        notes: "Apartment building, gate to the right.",
        amount: 199,
        couponCode: null,
        weightKg: 8.4,
        images: [],
        paymentMethod: null,
        paymentAt: null,
        createdAt: hoursAgo(30),
        assignmentHistory: [
            {
                at: hoursAgo(28),
                action: "assigned",
                executiveId: "exec_05",
                actor: "auto-router",
            },
        ],
    },
    // Completed history
    {
        id: "BC-9087",
        customerId: "cus_01",
        executiveId: "exec_01",
        date: daysAgo(2),
        slot: TIME_SLOTS.s2,
        addressIdx: 0,
        status: "completed",
        notes: "Weekly haul.",
        amount: 149,
        couponCode: null,
        weightKg: 6.4,
        images: [],
        paymentMethod: "upi",
        paymentAt: daysAgo(2),
        createdAt: daysAgo(3),
        assignmentHistory: [
            {
                at: daysAgo(3),
                action: "assigned",
                executiveId: "exec_01",
                actor: "auto-router",
            },
        ],
    },
    {
        id: "BC-9078",
        customerId: "cus_04",
        executiveId: "exec_02",
        date: daysAgo(3),
        slot: TIME_SLOTS.s1,
        addressIdx: 0,
        status: "completed",
        notes: "",
        amount: 149,
        couponCode: "WELCOME50",
        weightKg: 4.2,
        images: [],
        paymentMethod: "card",
        paymentAt: daysAgo(3),
        createdAt: daysAgo(4),
        assignmentHistory: [
            {
                at: daysAgo(4),
                action: "assigned",
                executiveId: "exec_02",
                actor: "Meera Shankar",
            },
        ],
    },
    {
        id: "BC-9065",
        customerId: "cus_05",
        executiveId: "exec_03",
        date: daysAgo(4),
        slot: TIME_SLOTS.s3,
        addressIdx: 0,
        status: "completed",
        notes: "",
        amount: 149,
        couponCode: null,
        weightKg: 5.1,
        images: [],
        paymentMethod: "upi",
        paymentAt: daysAgo(4),
        createdAt: daysAgo(5),
        assignmentHistory: [
            {
                at: daysAgo(5),
                action: "assigned",
                executiveId: "exec_03",
                actor: "auto-router",
            },
        ],
    },
    {
        id: "BC-9052",
        customerId: "cus_08",
        executiveId: "exec_06",
        date: daysAgo(5),
        slot: TIME_SLOTS.s5,
        addressIdx: 0,
        status: "completed",
        notes: "Bulky e-waste",
        amount: 249,
        couponCode: null,
        weightKg: 12.6,
        images: [],
        paymentMethod: "cash",
        paymentAt: daysAgo(5),
        createdAt: daysAgo(6),
        assignmentHistory: [
            {
                at: daysAgo(6),
                action: "assigned",
                executiveId: "exec_06",
                actor: "Meera Shankar",
            },
        ],
    },
    {
        id: "BC-9041",
        customerId: "cus_02",
        executiveId: "exec_01",
        date: daysAgo(6),
        slot: TIME_SLOTS.s2,
        addressIdx: 0,
        status: "completed",
        notes: "Office cardboard",
        amount: 199,
        couponCode: null,
        weightKg: 14.2,
        images: [],
        paymentMethod: "upi",
        paymentAt: daysAgo(6),
        createdAt: daysAgo(7),
        assignmentHistory: [
            {
                at: daysAgo(7),
                action: "assigned",
                executiveId: "exec_01",
                actor: "auto-router",
            },
        ],
    },
    {
        id: "BC-9028",
        customerId: "cus_09",
        executiveId: "exec_08",
        date: daysAgo(7),
        slot: TIME_SLOTS.s3,
        addressIdx: 0,
        status: "completed",
        notes: "",
        amount: 149,
        couponCode: null,
        weightKg: 3.8,
        images: [],
        paymentMethod: "upi",
        paymentAt: daysAgo(7),
        createdAt: daysAgo(8),
        assignmentHistory: [
            {
                at: daysAgo(8),
                action: "assigned",
                executiveId: "exec_08",
                actor: "auto-router",
            },
        ],
    },
    {
        id: "BC-9015",
        customerId: "cus_03",
        executiveId: "exec_04",
        date: daysAgo(8),
        slot: TIME_SLOTS.s4,
        addressIdx: 0,
        status: "completed",
        notes: "",
        amount: 149,
        couponCode: null,
        weightKg: 4.6,
        images: [],
        paymentMethod: "card",
        paymentAt: daysAgo(8),
        createdAt: daysAgo(9),
        assignmentHistory: [
            {
                at: daysAgo(9),
                action: "assigned",
                executiveId: "exec_04",
                actor: "Meera Shankar",
            },
        ],
    },
    {
        id: "BC-8998",
        customerId: "cus_10",
        executiveId: "exec_05",
        date: daysAgo(9),
        slot: TIME_SLOTS.s2,
        addressIdx: 0,
        status: "completed",
        notes: "",
        amount: 149,
        couponCode: null,
        weightKg: 5.9,
        images: [],
        paymentMethod: "upi",
        paymentAt: daysAgo(9),
        createdAt: daysAgo(10),
        assignmentHistory: [],
    },
    {
        id: "BC-8980",
        customerId: "cus_11",
        executiveId: "exec_03",
        date: daysAgo(11),
        slot: TIME_SLOTS.s4,
        addressIdx: 0,
        status: "completed",
        notes: "",
        amount: 149,
        couponCode: null,
        weightKg: 4.0,
        images: [],
        paymentMethod: "upi",
        paymentAt: daysAgo(11),
        createdAt: daysAgo(12),
        assignmentHistory: [],
    },
    // Cancelled
    {
        id: "BC-9070",
        customerId: "cus_04",
        executiveId: null,
        date: daysAgo(2),
        slot: TIME_SLOTS.s5,
        addressIdx: 0,
        status: "cancelled",
        notes: "Customer rescheduled",
        amount: 149,
        couponCode: null,
        weightKg: null,
        images: [],
        paymentMethod: null,
        paymentAt: null,
        createdAt: daysAgo(3),
        assignmentHistory: [],
    },
];

export const loadPickups = (): AdminPickup[] => {
    const stored = safeGet<AdminPickup[] | null>(KEYS.pickups, null);
    if (stored && Array.isArray(stored) && stored.length) return stored;
    safeSet(KEYS.pickups, seedPickups);
    return seedPickups;
};
export const savePickups = (l: AdminPickup[]): void =>
    safeSet(KEYS.pickups, l);
export const findPickup = (id: string): AdminPickup | null =>
    loadPickups().find((p) => p.id === id) || null;

export const updatePickup = (
    id: string,
    patch: Partial<AdminPickup>
): AdminPickup | undefined => {
    const list = loadPickups();
    const next = list.map((p) => (p.id === id ? { ...p, ...patch } : p));
    savePickups(next);
    return next.find((p) => p.id === id);
};

export const assignExecutiveToPickup = (
    pickupId: string,
    executiveId: string,
    actorName: string
): AdminPickup | null => {
    const list = loadPickups();
    const target = list.find((p) => p.id === pickupId);
    if (!target) return null;
    const prev = target.executiveId;
    const historyEntry: AssignmentHistoryEntry = {
        at: new Date().toISOString(),
        action: prev ? "reassigned" : "assigned",
        executiveId,
        previousExecutiveId: prev || null,
        actor: actorName,
    };
    const updated: AdminPickup = {
        ...target,
        executiveId,
        status:
            target.status === "scheduled" || target.status === "confirmed"
                ? "assigned"
                : target.status,
        assignmentHistory: [...(target.assignmentHistory || []), historyEntry],
    };
    savePickups(list.map((p) => (p.id === pickupId ? updated : p)));
    return updated;
};

// ===== Hydration: enrich pickups with denormalized customer/executive =====
export interface EnrichedAdminPickup extends AdminPickup {
    customer: Customer | null;
    executive: AdminExecutive | null;
    address: CustomerAddress | null;
}

export const enrichPickup = (p: AdminPickup): EnrichedAdminPickup | null => {
    if (!p) return null;
    const customer = findCustomer(p.customerId);
    const executive = p.executiveId ? findExecutive(p.executiveId) : null;
    const address =
        customer?.addresses?.[p.addressIdx ?? 0] ||
        customer?.addresses?.[0] ||
        null;
    return { ...p, customer, executive, address };
};

export const loadEnrichedPickups = (): EnrichedAdminPickup[] =>
    loadPickups()
        .map(enrichPickup)
        .filter((p): p is EnrichedAdminPickup => p !== null)
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

// ===== Computed stats =====
const isToday = (iso: string): boolean => {
    const d = new Date(iso);
    const n = new Date();
    return (
        d.getFullYear() === n.getFullYear() &&
        d.getMonth() === n.getMonth() &&
        d.getDate() === n.getDate()
    );
};

export interface StatusDistributionEntry {
    key: AdminStatusKey;
    label: string;
    count: number;
}

export interface WeeklyTrendEntry {
    key: string;
    label: string;
    volume: number;
    revenue: number;
}

export interface AdminStats {
    totalPickups: number;
    pendingPickups: number;
    inProgressPickups: number;
    completedPickups: number;
    totalCustomers: number;
    totalExecutives: number;
    revenueCollected: number;
    todaysCollections: number;
    statusDistribution: StatusDistributionEntry[];
    weeklyTrend: WeeklyTrendEntry[];
}

export const computeAdminStats = (): AdminStats => {
    const pickups = loadPickups();
    const customers = loadCustomers();
    const execs = loadExecutives();
    const completed = pickups.filter((p) => p.status === "completed");
    const pending = pickups.filter(
        (p) =>
            p.status === "scheduled" ||
            p.status === "confirmed" ||
            p.status === "assigned"
    );
    const inProgress = pickups.filter(
        (p) => p.status === "in_progress" || p.status === "payment_pending"
    );
    const revenueCollected = completed.reduce(
        (s, p) => s + (p.amount || 0),
        0
    );
    const todaysCollections = completed
        .filter((p) => p.paymentAt && isToday(p.paymentAt))
        .reduce((s, p) => s + (p.amount || 0), 0);

    // Status distribution
    const dist: StatusDistributionEntry[] = STATUS_ORDER.map((k) => ({
        key: k,
        label: ADMIN_STATUS[k].label,
        count: pickups.filter((p) => p.status === k).length,
    }));

    // Last 7-day volume
    const days: WeeklyTrendEntry[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        const volume = pickups.filter(
            (p) => p.date.slice(0, 10) === key
        ).length;
        const revenue = pickups
            .filter(
                (p) => p.date.slice(0, 10) === key && p.status === "completed"
            )
            .reduce((s, p) => s + (p.amount || 0), 0);
        days.push({ key, label, volume, revenue });
    }

    return {
        totalPickups: pickups.length,
        pendingPickups: pending.length,
        inProgressPickups: inProgress.length,
        completedPickups: completed.length,
        totalCustomers: customers.length,
        totalExecutives: execs.filter((e) => e.status === "active").length,
        revenueCollected,
        todaysCollections,
        statusDistribution: dist,
        weeklyTrend: days,
    };
};

export interface CustomerStats {
    totalPickups: number;
    completedPickups: number;
    totalSpend: number;
    kgRecycled: number;
    lastActivity: string | null;
    couponsUsed: string[];
}

export const customerStats = (customerId: string): CustomerStats => {
    const all = loadPickups().filter((p) => p.customerId === customerId);
    const completed = all.filter((p) => p.status === "completed");
    const totalSpend = completed.reduce((s, p) => s + (p.amount || 0), 0);
    const kg = completed.reduce((s, p) => s + (p.weightKg || 0), 0);
    const lastActivity =
        [...all].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )[0]?.createdAt || null;
    const usedCoupons = [
        ...new Set(
            all
                .filter((p) => p.couponCode)
                .map((p) => p.couponCode as string)
        ),
    ];
    return {
        totalPickups: all.length,
        completedPickups: completed.length,
        totalSpend,
        kgRecycled: Number(kg.toFixed(1)),
        lastActivity,
        couponsUsed: usedCoupons,
    };
};

export interface ExecutiveStats {
    totalAssigned: number;
    active: number;
    completed: number;
    earnings: number;
    kgCollected: number;
    completionRate: number;
}

export const executiveStats = (executiveId: string): ExecutiveStats => {
    const all = loadPickups().filter((p) => p.executiveId === executiveId);
    const completed = all.filter((p) => p.status === "completed");
    const active = all.filter(
        (p) =>
            p.status === "assigned" ||
            p.status === "in_progress" ||
            p.status === "payment_pending"
    );
    const earnings = completed.reduce((s, p) => s + (p.amount || 0), 0);
    const kg = completed.reduce((s, p) => s + (p.weightKg || 0), 0);
    const completionRate =
        all.length === 0
            ? 0
            : Math.round((completed.length / all.length) * 100);
    return {
        totalAssigned: all.length,
        active: active.length,
        completed: completed.length,
        earnings,
        kgCollected: Number(kg.toFixed(1)),
        completionRate,
    };
};

// ===== Clear-all (admin sign-out) =====
export const clearAdminLocal = (): void => {
    [
        KEYS.auth,
        KEYS.profile,
        KEYS.sessions,
        // intentionally keep pickups/execs/customers so demo data survives
    ].forEach((k) => {
        try {
            localStorage.removeItem(k);
        } catch {
            /* ignore */
        }
    });
};

// ===== Pickup timeline (admin view) =====
export interface AdminTimelineStep {
    key: string;
    label: string;
    at: string | null;
    state: StatusState;
}

export const getAdminTimeline = (p: AdminPickup | null): AdminTimelineStep[] => {
    if (!p) return [];
    const steps: Omit<AdminTimelineStep, "state">[] = [
        {
            key: "scheduled",
            label: "Booking received",
            at: p.createdAt,
        },
        {
            key: "confirmed",
            label: "Booking confirmed",
            at: new Date(
                new Date(p.createdAt).getTime() + 5 * 60 * 1000
            ).toISOString(),
        },
        {
            key: "assigned",
            label: "Executive assigned",
            at: p.assignmentHistory?.[0]?.at || null,
        },
        {
            key: "in_progress",
            label: "Pickup in progress",
            at: null,
        },
        {
            key: "payment_pending",
            label: "Payment pending",
            at: null,
        },
        {
            key: "completed",
            label: "Completed",
            at: p.paymentAt,
        },
    ];

    if (p.status === "cancelled") {
        return [
            { ...steps[0]!, state: "done" },
            {
                key: "cancelled",
                label: "Cancelled",
                at: new Date(
                    new Date(p.createdAt).getTime() + 2 * 60 * 60 * 1000
                ).toISOString(),
                state: "cancelled",
            },
        ];
    }

    const idx = STATUS_ORDER.indexOf(p.status);
    return steps.map((s) => {
        const sidx = STATUS_ORDER.indexOf(s.key as AdminStatusKey);
        if (sidx < idx) return { ...s, state: "done" as const };
        if (sidx === idx) return { ...s, state: "current" as const };
        return { ...s, at: null, state: "upcoming" as const };
    });
};
