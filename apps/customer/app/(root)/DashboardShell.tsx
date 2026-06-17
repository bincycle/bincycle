"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Home as HomeIcon,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  LifeBuoy,
  LogOut,
  User,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { mockUser } from "@workspace/data/mockData";
import LogoutDialog from "@/components/LogoutDialog";
import { getProfile } from "@workspace/data/accountStorage";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  {
    href: "/overview",
    label: "Overview",
    icon: LayoutDashboard,
    exact: false,
  },
  {
    href: "/book-pickup",
    label: "Book Pickup",
    icon: Calendar,
    exact: true,
  },
  {
    href: "/pickups",
    label: "My Pickups",
    icon: Package,
    exact: false,
  },
  { href: "/me", label: "Profile", icon: User, exact: false },
  { href: "#", label: "Invoices", icon: Receipt, disabled: true },
  { href: "#", label: "Settings", icon: Settings, disabled: true },
];

export function DashboardSidebar({
  onSignOut,
}: {
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const profile = getProfile();
  const initials = (profile.name || "U")
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside
      data-testid="dashboard-sidebar"
      className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-[#D1CDBC] lg:min-h-screen lg:sticky lg:top-0"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#D1CDBC]">
        <Logo />
      </div>

      <nav className="flex-1 px-4 py-6">
        <p className="font-mono-label text-[10px] text-[#596155] px-3 mb-3">
          Workspace
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const testId = `sidebar-link-${item.label
              .toLowerCase()
              .replace(/\s+/g, "-")}`;
            if (item.disabled) {
              return (
                <li key={item.label}>
                  <span
                    data-testid={testId}
                    className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-[#596155]/60 cursor-not-allowed"
                  >
                    <Icon size={16} />
                    {item.label}
                    <span className="ml-auto font-mono-label text-[9px] text-[#596155]/60">
                      soon
                    </span>
                  </span>
                </li>
              );
            }
            const active = isActive(item);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  data-testid={testId}
                  className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-[#284226] text-[#F7F5F0]"
                      : "text-[#121710] hover:bg-[#EDE9DC]"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="font-mono-label text-[10px] text-[#596155] px-3 mt-8 mb-3">
          Support
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              href="/help"
              data-testid="sidebar-link-help"
              className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-[#121710] hover:bg-[#EDE9DC]"
            >
              <LifeBuoy size={16} /> Help center
            </Link>
          </li>
          <li>
            <Link
              href="/"
              data-testid="sidebar-link-home"
              className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-[#121710] hover:bg-[#EDE9DC]"
            >
              <HomeIcon size={16} /> Back to site
            </Link>
          </li>
        </ul>
      </nav>

      <div className="m-4 rounded-sm border border-[#D1CDBC] bg-white p-3 flex items-center gap-3">
        <Link
          href="/me"
          data-testid="sidebar-profile-link"
          className="flex items-center gap-3 min-w-0 flex-1 rounded-sm"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-semibold truncate text-[#121710]"
              data-testid="sidebar-user-name"
            >
              {profile.name}
            </p>
            <p className="text-xs text-[#596155] truncate">
              {mockUser.plan} plan
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          data-testid="sidebar-signout"
          className="rounded-sm p-2 text-[#596155] hover:text-[#C45B38]"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

export function DashboardTopbar({ onSignOut }: { onSignOut: () => void }) {
  const profile = getProfile();
  const initials = (profile.name || "U")
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      data-testid="dashboard-topbar"
      className="flex lg:hidden items-center justify-between border-b border-[#D1CDBC] bg-[#F7F5F0] px-5 py-4 sticky top-0 z-40 backdrop-blur-xl"
    >
      <Logo />
      <div className="flex items-center gap-3">
        <Link
          href="/me"
          data-testid="topbar-profile-link"
          aria-label="Account"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          data-testid="topbar-signout"
          className="rounded-sm p-2 text-[#596155] hover:text-[#C45B38]"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

// ─── Shell component (manages logout dialog state) ────────────────────────────
// Import this in app/dashboard/layout.tsx and render {children} inside it.

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#121710]">
      <div className="mx-auto flex max-w-[1480px] flex-col lg:flex-row">
        <DashboardSidebar onSignOut={() => setLogoutOpen(true)} />
        <DashboardTopbar onSignOut={() => setLogoutOpen(true)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  );
}

export default DashboardShell;
