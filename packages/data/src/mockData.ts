import {
    Address,
    TimeSlot,
    PricingPlan,
    Testimonial,
    Faq,
    ImpactStat,
    HowItWorksStep,
    MockUser,
} from "./types";

export const savedAddresses: Address[] = [
    {
        id: "addr_1",
        label: "Home",
        line1: "12, Hibiscus Lane, Indiranagar",
        city: "Bengaluru",
        pincode: "560038",
    },
    {
        id: "addr_2",
        label: "Office",
        line1: "Tower B, 4th Floor, Prestige Tech Park",
        city: "Bengaluru",
        pincode: "560103",
    },
    {
        id: "addr_3",
        label: "Mom's Place",
        line1: "Plot 22, Sector 14, DLF Phase III",
        city: "Gurugram",
        pincode: "122002",
    },
    {
        id: "addr_4",
        label: "Studio",
        line1: "B-301, Lotus Heights, Andheri West",
        city: "Mumbai",
        pincode: "400053",
    },
];

export const timeSlots: TimeSlot[] = [
    { id: "ts1", range: "07:00 — 09:00", label: "Early Morning" },
    { id: "ts2", range: "09:00 — 11:00", label: "Morning" },
    { id: "ts3", range: "11:00 — 13:00", label: "Late Morning" },
    { id: "ts4", range: "14:00 — 16:00", label: "Afternoon" },
    { id: "ts5", range: "16:00 — 18:00", label: "Evening" },
    { id: "ts6", range: "18:00 — 20:00", label: "Night" },
];

export const pricingPlans: PricingPlan[] = [
    {
        id: "one_time",
        name: "On-demand",
        price: "Starts at ₹49",
        cadence: "per pickup",
        tagline: "For occasional cleanouts and one-off hauls.",
        features: [
            "1 pickup, scheduled within 7 days",
            "Priced by weight (starts at ₹49)",
            "Mixed dry & wet segregation included",
            "Doorstep digital weighing & photo proof",
        ],
        ctaLabel: "Book a pickup",
        accent: false,
    },
    {
        id: "monthly_20kg",
        name: "Upto 20kg",
        price: "₹299",
        cadence: "per month",
        tagline: "Standard monthly subscription for small households.",
        features: [
            "4 pickups / month (weekly)",
            "Up to 20 kg weight limit per pickup",
            "Priority slot booking",
            "Recurring schedule, change anytime",
            "Free missed-pickup reschedule",
        ],
        ctaLabel: "Start 20kg plan",
        accent: false,
    },
    {
        id: "monthly_40kg",
        name: "Upto 40kg",
        price: "₹499",
        cadence: "per month",
        tagline: "The neighborhood favorite. Double the capacity.",
        features: [
            "8 pickups / month (twice weekly)",
            "Up to 40 kg weight limit per pickup",
            "Priority slot booking",
            "Recurring schedule, change anytime",
            "Free missed-pickup reschedule",
        ],
        ctaLabel: "Start 40kg plan",
        accent: true,
    },
    {
        id: "business",
        name: "Business & Communities",
        price: "Custom",
        cadence: "quote-based pricing",
        tagline: "Tailored waste management for offices, cafes, and large societies.",
        features: [
            "Daily or custom pickup frequencies",
            "No weight limits",
            "Custom waste-sorting stations & color-coded bins",
            "Dedicated account manager & route partner",
            "Monthly ESG & recycling impact audit",
            "E-waste, bulk, and hazardous waste solutions",
            "Zero-landfill compliance certification",
        ],
        ctaLabel: "Get a quote",
        accent: false,
    },
];

export const testimonials: Testimonial[] = [
    {
        id: "t1",
        name: "Aanya R.",
        city: "Bengaluru",
        body: "I used to dread Monday mornings. Now Bincycle just shows up. The driver's polite, the truck's electric, my street smells better.",
    },
    {
        id: "t2",
        name: "Karan M.",
        city: "Mumbai",
        body: "Switched our 18-flat society to Bincycle. Cost dropped, segregation improved, and we get an actual impact report each month.",
    },
    {
        id: "t3",
        name: "Sneha P.",
        city: "Gurugram",
        body: "The app is shockingly simple. Pick a date, a slot, an address — done. I rebooked in 11 seconds last Sunday.",
    },
];

export const faqs: Faq[] = [
    {
        q: "Which cities does Bincycle currently serve?",
        a: "We currently operate across select pin codes in Bengaluru, Mumbai, Gurugram, Pune and Hyderabad. Drop your pin on the home page and we'll tell you in real time if your block is live.",
    },
    {
        q: "What kind of waste do you pick up?",
        a: "Dry recyclables (paper, plastic, metal, glass), wet/organic kitchen waste, and household e-waste. We do not pick up hazardous chemicals, medical or construction debris through standard pickups — those need a special request.",
    },
    {
        q: "Do I need to segregate the waste before pickup?",
        a: "It helps a lot. We provide colour-coded bags on your first pickup, but mixed waste is also accepted — our facility segregates it before recycling.",
    },
    {
        q: "Can I reschedule or cancel a pickup?",
        a: "Yes. Anytime before the slot window opens, head to your dashboard and reschedule with one tap. Cancellations made under 1 hour from pickup carry a small partner fee.",
    },
    {
        q: "How do I pay?",
        a: "UPI, cards and netbanking are all supported. Monthly plans are auto-debited; on-demand pickups are paid per booking. No cash, no surprises.",
    },
    {
        q: "Is Bincycle actually better for the environment?",
        a: "We measure it. Every pickup is weighed and tagged. You'll see a monthly impact report showing kilograms diverted from landfills and CO₂ equivalent saved through recycling.",
    },
];

export const impactStats: ImpactStat[] = [
    { value: "12,400+", label: "Pickups completed" },
    { value: "318 t", label: "Diverted from landfill" },
    { value: "94%", label: "On-time arrival" },
    { value: "5 cities", label: "& expanding" },
];

export const howItWorks: HowItWorksStep[] = [
    {
        step: "01",
        title: "Pick a date & slot",
        body: "Open the app, choose any of the next 7 days and a 2-hour window that works for you.",
    },
    {
        step: "02",
        title: "We arrive at your door",
        body: "An electric Bincycle partner shows up in branded gear. Hand over your bags, that's it.",
    },
    {
        step: "03",
        title: "We weigh, sort, recycle",
        body: "Everything is weighed at the depot, sorted into 9 streams and routed to verified recyclers.",
    },
    {
        step: "04",
        title: "You see the impact",
        body: "Each month you get an honest report — kilos diverted, CO₂ saved, and what got a second life.",
    },
];

export const mockUser: MockUser = {
    name: "Aanya Rao",
    email: "aanya@bincycle.in",
    avatar: "https://ui.shadcn.com/avatars/01.png",
    plan: "Upto 40kg",
};
