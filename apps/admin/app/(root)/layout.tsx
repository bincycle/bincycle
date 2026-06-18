"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Truck,
    Users,
    UserCog,
    User,
    LogOut,
    Menu,
    Shield,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@workspace/ui/components/sheet";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@workspace/ui/components/avatar";
import AdminLogoutDialog from "@/components/AdminLogoutDialog";
import { getAdminAuth, getAdminProfile } from "@workspace/data/adminMock";

const NAV = [
    { to: "/admin/overview", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/pickups", label: "Pickups", icon: Truck },
    { to: "/admin/executives", label: "Executives", icon: UserCog },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/me", label: "Profile", icon: User },
];

const AdminBrand = () => (
    <Link
        href="/admin/overview"
        data-testid="admin-brand"
        className="flex items-center gap-2.5"
    >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[#C45B38] text-[#F7F5F0]">
            <Shield size={14} />
        </span>
        <span className="font-display text-lg font-black tracking-tight text-[#F7F5F0]">
            bincycle
            <span className="text-[#C45B38]">.</span>{" "}
            <span className="font-mono-label text-[9px] text-[#F7F5F0]/50 ml-0.5 align-middle">
                CONSOLE
            </span>
        </span>
    </Link>
);

interface Profile {
    name?: string;
    role?: string;
    avatar?: string;
}

interface SidebarNavProps {
    profile: Profile;
    pathname: string;
    onSignOut: () => void;
    onNavigate?: () => void;
}

const SidebarNav = ({
    profile,
    pathname,
    onSignOut,
    onNavigate,
}: SidebarNavProps) => (
    <div className="flex h-full flex-col">
        <div className="px-5 py-5 border-b border-[#F7F5F0]/10">
            <AdminBrand />
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <p className="font-mono-label text-[10px] text-[#F7F5F0]/40 px-3 mb-2">
                Operations
            </p>
            <ul className="space-y-1">
                {NAV.map((it) => {
                    const Icon = it.icon;
                    const isActive = pathname === it.to;
                    return (
                        <li key={it.label}>
                            <Link
                                href={it.to}
                                onClick={onNavigate}
                                data-testid={`admin-nav-${it.label.toLowerCase()}`}
                                className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                                    isActive
                                        ? "bg-[#C45B38] text-[#F7F5F0]"
                                        : "text-[#F7F5F0]/70 hover:bg-[#F7F5F0]/5 hover:text-[#F7F5F0]"
                                }`}
                            >
                                <Icon size={15} />
                                {it.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
        <div className="m-3 rounded-sm border border-[#F7F5F0]/10 bg-[#F7F5F0]/5 p-3 flex items-center gap-3">
            <Link
                href="/admin/me"
                onClick={onNavigate}
                data-testid="admin-sidebar-profile"
                className="flex items-center gap-3 min-w-0 flex-1"
            >
                <Avatar className="h-9 w-9">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>{profile.name?.[0] || "A"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p
                        className="text-sm font-semibold text-[#F7F5F0] truncate"
                        data-testid="admin-sidebar-user"
                    >
                        {profile.name}
                    </p>
                    <p className="font-mono-label text-[9px] text-[#F7F5F0]/40 truncate">
                        {profile.role}
                    </p>
                </div>
            </Link>
            <button
                type="button"
                onClick={onSignOut}
                data-testid="admin-sidebar-signout"
                aria-label="Sign out"
                className="rounded-sm p-2 text-[#F7F5F0]/60 hover:text-[#C45B38]"
            >
                <LogOut size={14} />
            </button>
        </div>
    </div>
);

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [auth, setAuth] = useState(() => getAdminAuth());
    const [profile, setProfile] = useState<Profile>(() => getAdminProfile());
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        setAuth(getAdminAuth());
        setProfile(getAdminProfile());
        setSheetOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!auth) router.replace("/admin/login");
    }, [auth, router]);

    if (!auth) return null;

    return (
        <div className="min-h-screen bg-[#F7F5F0] text-[#121710]">
            <div className="flex min-h-screen">
                {/* Desktop sidebar */}
                <aside
                    data-testid="admin-sidebar"
                    className="hidden lg:flex lg:w-64 lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-[#171A15] border-r border-[#F7F5F0]/10"
                >
                    <SidebarNav
                        profile={profile}
                        pathname={pathname}
                        onSignOut={() => setLogoutOpen(true)}
                    />
                </aside>

                {/* Mobile / tablet topbar */}
                <header
                    data-testid="admin-topbar"
                    className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-[#F7F5F0]/10 bg-[#171A15] px-4 py-3"
                >
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                data-testid="admin-mobile-menu"
                                aria-label="Open menu"
                                className="rounded-sm p-2 text-[#F7F5F0] hover:bg-[#F7F5F0]/10"
                            >
                                <Menu size={18} />
                            </button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="w-72 p-0 bg-[#171A15] border-[#F7F5F0]/10"
                        >
                            <SheetTitle className="sr-only">
                                Admin navigation
                            </SheetTitle>
                            <SidebarNav
                                profile={profile}
                                pathname={pathname}
                                onSignOut={() => {
                                    setSheetOpen(false);
                                    setTimeout(() => setLogoutOpen(true), 160);
                                }}
                                onNavigate={() => setSheetOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>
                    <AdminBrand />
                    <Link
                        href="/admin/me"
                        data-testid="admin-topbar-profile"
                        aria-label="Profile"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.avatar} />
                            <AvatarFallback>
                                {profile.name?.[0] || "A"}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </header>

                <main className="flex-1 min-w-0 pt-14 lg:pt-0">
                    {children}
                </main>
            </div>
            <AdminLogoutDialog
                open={logoutOpen}
                onOpenChange={setLogoutOpen}
            />
        </div>
    );
};

export default AdminLayout;
