import type { Metadata } from "next";
import "@workspace/ui/globals.css";
import MarketingNav from "@/components/MarketingNav";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { Toaster } from "@workspace/ui/components/sonner";

export const metadata: Metadata = {
  title: "Bincycle – On-demand waste pickup",
  description:
    "On-demand waste pickup that actually shows up. Built for Indian streets, kitchens and apartment blocks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
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
        <div className="flex min-h-screen flex-col bg-[#F7F5F0] text-[#121710]">
          <MarketingNav />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
        </div>
      </body>
    </html>
  );
}
