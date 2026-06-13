// Shared domain types used by mockData, accountStorage, bookingPersistence,
// mockPickups, executiveMock and adminMock.

export interface Address {
    id: string;
    label: string;
    line1: string;
    city: string;
    pincode: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
}

export interface TimeSlot {
    id: string;
    range: string;
    label: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    cadence: string;
    tagline: string;
    features: string[];
    ctaLabel: string;
    accent: boolean;
}

export interface Testimonial {
    id: string;
    name: string;
    city: string;
    body: string;
}

export interface Faq {
    q: string;
    a: string;
}

export interface ImpactStat {
    value: string;
    label: string;
}

export interface HowItWorksStep {
    step: string;
    title: string;
    body: string;
}

export interface MockUser {
    name: string;
    email: string;
    avatar: string;
    plan: string;
}

export interface Session {
    id: string;
    current: boolean;
    device: string;
    browser: string;
    platform: string;
    location: string;
    lastActiveAt: string;
}

export type LoginStatus = "success" | "failed";

export interface LoginHistoryEntry {
    id: string;
    at: string;
    device: string;
    browser: string;
    location: string;
    status: LoginStatus;
}

export type StatusState = "done" | "current" | "upcoming" | "cancelled";

export interface TimelineStep {
    key: string;
    label: string;
    description?: string;
    at: string | null;
    state: StatusState;
}

export interface StatusMeta {
    label: string;
    dot: string;
    chip: string;
}
