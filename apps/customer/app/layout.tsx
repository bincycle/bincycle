import type { Metadata } from "next";

import { Toaster } from "@workspace/ui/components/sonner";
import CookieConsent from "@/components/CookieConsent";

import "@workspace/ui/globals.css"

export const metadata: Metadata = {
    title: "Bincycle – On-demand waste pickup",
    description: "On-demand waste pickup that actually shows up. Built for Indian streets, kitchens and apartment blocks.",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: "#171A15",
                            color: "#F7F5F0",
                            border: "1px solid #284226",
                            borderRadius: "4px",
                        },
                    }}
                />
                {children}
                <CookieConsent />
            </body>
        </html>
    )
}
