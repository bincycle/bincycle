"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Logo from "@/components/Logo";

const HERO_IMG =
    "https://static.prod-images.emergentagent.com/jobs/85afc4d7-2033-4a56-a1f2-66a9c918c165/images/47998dda7a2529325f75bee90bda1838bbc45ab787b576520136ca9ea7a216ca.png";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);

    return (
        <div className="min-h-screen bg-[#F7F5F0] text-[#121710]">
            <div className="grid min-h-screen lg:grid-cols-12">
                {/* LEFT — editorial panel */}
                <aside
                    data-testid="auth-side-panel"
                    className="relative hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between overflow-hidden bg-[#171A15] text-[#F7F5F0] p-10"
                >
                    <img
                        src={HERO_IMG}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
                    />
                    <div className="relative z-10">
                        <Logo inverse />
                    </div>
                    <div className="relative z-10 max-w-md">
                        <p className="font-mono-label text-xs text-[#F7F5F0]/60">
                            [ on-demand · pan-india · electric fleet ]
                        </p>
                        <h2 className="mt-5 font-display font-black tracking-tighter text-4xl xl:text-5xl leading-[0.95]">
                            Pickup,
                            <br />
                            <span className="italic font-medium text-[#C45B38]">
                                on your terms.
                            </span>
                        </h2>
                        <p className="mt-5 text-[#F7F5F0]/70 leading-relaxed">
                            Join 12,400+ Indian households that stopped chasing
                            the kachra-wala. Sign in to book, manage and track
                            your pickups.
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center justify-between text-xs text-[#F7F5F0]/50">
                        <span className="font-mono-label">bincycle.in</span>
                        <Link
                            href="/"
                            data-testid="auth-side-back-home"
                            className="hover:text-[#F7F5F0]"
                        >
                            ← back to site
                        </Link>
                    </div>
                </aside>

                {/* RIGHT — form panel */}
                <main className="lg:col-span-7 xl:col-span-6 flex flex-col">
                    <header className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-[#D1CDBC] lg:border-b-0">
                        <div className="lg:hidden">
                            <Logo />
                        </div>
                        <Link
                            href="/"
                            data-testid="auth-back-home"
                            className="ml-auto text-sm text-[#596155] hover:text-[#121710]"
                        >
                            ← back to site
                        </Link>
                    </header>
                    <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">
                        <div className="w-full max-w-md">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
