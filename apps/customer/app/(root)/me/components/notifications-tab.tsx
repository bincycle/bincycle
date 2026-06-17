"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Switch } from "@workspace/ui/components/switch";
import { toast } from "sonner";
import { getNotifications, saveNotifications } from "@workspace/data/accountStorage";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationKey = "email" | "sms" | "reminders" | "marketing";

type NotificationPrefs = Record<NotificationKey, boolean>;

interface Row {
    key: NotificationKey;
    title: string;
    body: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROWS: Row[] = [
    {
        key: "email",
        title: "Email notifications",
        body: "Booking confirmations, receipts and the occasional service email.",
    },
    {
        key: "sms",
        title: "SMS notifications",
        body: "Pickup-day alerts, partner ETA and OTPs only.",
    },
    {
        key: "reminders",
        title: "Pickup reminders",
        body: "A gentle nudge the evening before so the bags don't miss the truck.",
    },
    {
        key: "marketing",
        title: "Marketing communications",
        body: "Tips, city expansion news, occasional promo codes. We keep it sparse.",
    },
];

// ─── NotificationsTab ─────────────────────────────────────────────────────────

export const NotificationsTab = () => {
    const [prefs, setPrefs] = useState<NotificationPrefs>(getNotifications);
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const mounted = useRef(false);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        saveNotifications(prefs);
        setSavedAt(new Date());
    }, [prefs]);

    const toggle = (key: NotificationKey) => {
        setPrefs((p) => ({ ...p, [key]: !p[key] }));
        toast.success("Preference saved.");
    };

    return (
        <div data-testid="account-tab-notifications">
            <header className="flex items-start justify-between gap-4 pb-6 mb-6 border-b border-[#D1CDBC]">
                <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#121710]">
                        Notifications
                    </h2>
                    <p className="mt-1 text-sm text-[#596155]">
                        Choose how (and how often) you'd like to hear from us.
                        Changes save automatically.
                    </p>
                </div>
                {savedAt && (
                    <span
                        data-testid="notifications-saved-indicator"
                        className="inline-flex items-center gap-1.5 rounded-sm border border-[#D1CDBC] bg-white px-2.5 py-1.5 font-mono-label text-[10px] text-[#596155]"
                    >
                        <Check size={12} className="text-[#284226]" />
                        Saved
                    </span>
                )}
            </header>

            <ul className="divide-y divide-[#D1CDBC] rounded-sm border border-[#D1CDBC] bg-white">
                {ROWS.map((r) => (
                    <li
                        key={r.key}
                        data-testid={`notifications-row-${r.key}`}
                        className="flex items-start justify-between gap-6 p-5 sm:p-6"
                    >
                        <div className="min-w-0">
                            <p className="font-display text-base font-bold tracking-tight text-[#121710]">
                                {r.title}
                            </p>
                            <p className="mt-1 text-sm text-[#596155]">
                                {r.body}
                            </p>
                        </div>
                        <Switch
                            checked={!!prefs[r.key]}
                            onCheckedChange={() => toggle(r.key)}
                            data-testid={`notifications-toggle-${r.key}`}
                            aria-label={r.title}
                            className="data-[state=checked]:bg-[#284226]"
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationsTab;
