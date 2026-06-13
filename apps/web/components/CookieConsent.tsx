"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const KEY = "bincycle:cookie-consent";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const suppressed =
    pathname.startsWith("/executive") || pathname.startsWith("/admin");

  useEffect(() => {
    if (suppressed) {
      setVisible(false);
      return;
    }
    try {
      const stored = localStorage.getItem(KEY);
      if (!stored) {
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, [suppressed]);

  const persist = (choice: "accepted" | "declined") => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ choice, at: new Date().toISOString() })
      );
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Cookie consent"
          data-testid="cookie-consent-banner"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:max-w-md"
        >
          <div className="relative rounded-sm border border-[#D1CDBC] bg-[#171A15] text-[#F7F5F0] p-5 sm:p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#284226] text-[#F7F5F0]">
                <Cookie size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold tracking-tight">
                  Cookies, but the good kind.
                </p>
                <p className="mt-1.5 text-sm text-[#F7F5F0]/70 leading-relaxed">
                  We use a small set of cookies to keep you signed in and
                  understand which pages help. We never sell your data. Read
                  our{" "}
                  <Link
                    href="/privacy-policy"
                    data-testid="cookie-consent-policy-link"
                    className="underline underline-offset-2 hover:text-[#F7F5F0]"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => persist("accepted")}
                    data-testid="cookie-consent-accept-btn"
                    className="rounded-sm bg-[#C45B38] px-4 py-2.5 text-xs font-medium text-[#F7F5F0] hover:bg-[#A64A2B] transition-colors"
                  >
                    Accept all
                  </button>
                  <button
                    type="button"
                    onClick={() => persist("declined")}
                    data-testid="cookie-consent-decline-btn"
                    className="rounded-sm border border-[#F7F5F0]/30 px-4 py-2.5 text-xs font-medium text-[#F7F5F0] hover:bg-[#F7F5F0]/10 transition-colors"
                  >
                    Essentials only
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => persist("declined")}
                aria-label="Dismiss cookie banner"
                data-testid="cookie-consent-dismiss-btn"
                className="text-[#F7F5F0]/50 hover:text-[#F7F5F0] -mr-1 -mt-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
