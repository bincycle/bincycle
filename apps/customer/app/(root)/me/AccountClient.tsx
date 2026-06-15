"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Bell,
  ShieldCheck,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@workspace/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import ProfileTab from "./components/ProfileTab";
import AddressesTab from "./components/addresses-tab";
import NotificationsTab from "./components/notifications-tab";
import SecurityTab from "./components/security-tab";
import BillingTab from "./components/billing-tab";

type TabId =
  | "profile"
  | "addresses"
  | "notifications"
  | "security"
  | "billing";

interface Tab {
  id: TabId;
  label: string;
  description: string;
  icon: React.ElementType;
  Component: React.ComponentType<{ user: SupabaseUser }>;
}

const TABS: Tab[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Avatar, name, contact",
    icon: User,
    Component: ProfileTab,
  },
  {
    id: "addresses",
    label: "Addresses",
    description: "Saved pickup spots",
    icon: MapPin,
    Component: AddressesTab,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Email, SMS, reminders",
    icon: Bell,
    Component: NotificationsTab,
  },
  {
    id: "security",
    label: "Security",
    description: "Password, sessions, 2FA",
    icon: ShieldCheck,
    Component: SecurityTab,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plan, payments, invoices",
    icon: CreditCard,
    Component: BillingTab,
  },
];

const isValidTab = (id: string | null): id is TabId =>
  TABS.some((t) => t.id === id);

export default function AccountClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const initialTab = searchParams.get("tab");
  const [active, setActive] = useState<TabId>(
    isValidTab(initialTab) ? initialTab : "profile"
  );
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch authenticated user once on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  // Keep URL in sync without polluting history
  useEffect(() => {
    if (searchParams.get("tab") !== active) {
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", active);
      router.replace(`${pathname}?${next.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const ActiveComponent = TABS.find((t) => t.id === active)?.Component ?? ProfileTab;

  if (loading) {
    return (
      <div className="px-4 sm:px-8 lg:px-14 py-6 sm:py-10 lg:py-12">
        <div className="h-8 w-48 rounded-sm bg-[#EDE9DC] animate-pulse mb-4" />
        <div className="h-12 w-64 rounded-sm bg-[#EDE9DC] animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      data-testid="account-page"
      className="px-4 sm:px-8 lg:px-14 py-6 sm:py-10 lg:py-12 overflow-x-hidden"
    >
      <header className="mb-6 sm:mb-10">
        <p className="font-mono-label text-[10px] sm:text-xs text-[#596155]">
          [ dashboard · account ]
        </p>
        <h1 className="mt-2 sm:mt-3 font-display font-black tracking-tighter text-3xl sm:text-5xl text-[#121710]">
          Your account
        </h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#596155] max-w-2xl">
          Update profile details, manage addresses, tune notifications, review
          activity and tighten security — all in one place.
        </p>
      </header>

      <div className="grid gap-5 sm:gap-6 lg:gap-8 lg:grid-cols-12">
        {/* Settings nav */}
        <aside
          className="lg:col-span-3 min-w-0"
          data-testid="account-settings-nav"
        >
          {/* Mobile / tablet — horizontal pill bar */}
          <div className="lg:hidden -mx-4 sm:-mx-8 overflow-x-auto no-scrollbar">
            <div role="tablist" className="flex gap-2 pb-2 px-4 sm:px-8">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = t.id === active;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(t.id)}
                    data-testid={`account-tab-${t.id}-btn-mobile`}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-sm border px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-[#171A15] text-[#F7F5F0] border-[#171A15]"
                        : "border-[#D1CDBC] bg-white text-[#596155] hover:text-[#121710]"
                    }`}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop — vertical settings list */}
          <nav
            role="tablist"
            aria-label="Account settings"
            className="hidden lg:flex lg:flex-col lg:sticky lg:top-8 gap-1 rounded-sm border border-[#D1CDBC] bg-white p-2"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(t.id)}
                  data-testid={`account-tab-${t.id}-btn`}
                  className={`group flex items-center gap-3 rounded-sm px-3 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-[#171A15] text-[#F7F5F0]"
                      : "text-[#121710] hover:bg-[#EDE9DC]"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-sm ${
                      isActive
                        ? "bg-[#284226] text-[#F7F5F0]"
                        : "bg-[#EDE9DC] text-[#284226]"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p
                      className={`text-xs truncate ${
                        isActive ? "text-[#F7F5F0]/60" : "text-[#596155]"
                      }`}
                    >
                      {t.description}
                    </p>
                  </span>
                  <ChevronRight
                    size={14}
                    className={isActive ? "text-[#F7F5F0]/60" : "text-[#596155]"}
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab content */}
        <section
          className="lg:col-span-9 min-w-0 overflow-x-hidden"
          data-testid="account-tab-content"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <ActiveComponent user={user} />
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
