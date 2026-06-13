"use client";

import { useMemo, useState } from "react";
import { Search, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Input } from "@workspace/ui/components/input";
import SectionReveal from "@/components/SectionReveal";
import { faqs } from "@workspace/data/mockData";

export default function HelpClient() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return faqs;
    const t = q.toLowerCase();
    return faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(t) || f.a.toLowerCase().includes(t)
    );
  }, [q]);

  return (
    <>
      {/* SEARCH */}
      <section className="mx-auto max-w-4xl px-5 sm:px-8 pt-16 sm:pt-24 pb-12 text-center">
        <SectionReveal>
          <p className="font-mono-label text-xs text-[#596155]">
            [ help center ]
          </p>
        </SectionReveal>
        <SectionReveal delay={0.05}>
          <h1 className="mt-5 font-display font-black tracking-tighter text-5xl sm:text-6xl text-[#121710]">
            How can we help?
          </h1>
        </SectionReveal>
        <SectionReveal delay={0.1}>
          <p className="mt-5 text-lg text-[#596155] leading-relaxed">
            Browse answers to common questions, or search below.
          </p>
        </SectionReveal>
        <SectionReveal delay={0.15}>
          <div className="mt-10 relative max-w-2xl mx-auto">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#596155]"
            />
            <Input
              data-testid="help-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for 'pickup', 'recycling', 'payment'..."
              className="h-14 pl-12 rounded-sm border-[#D1CDBC] bg-white text-base focus-visible:ring-[#284226]"
            />
          </div>
        </SectionReveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 sm:px-8 pb-24">
        {filtered.length === 0 ? (
          <SectionReveal>
            <div className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-10 text-center">
              <p className="font-display text-xl text-[#121710]">
                Nothing matched &ldquo;{q}&rdquo;
              </p>
              <p className="mt-2 text-sm text-[#596155]">
                Try different keywords, or reach out to us directly.
              </p>
            </div>
          </SectionReveal>
        ) : (
          <SectionReveal>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              data-testid="help-faq-accordion"
            >
              {filtered.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className="border-b border-[#D1CDBC]"
                >
                  <AccordionTrigger
                    data-testid={`help-faq-trigger-${i}`}
                    className="text-left font-display text-lg font-bold text-[#121710] hover:no-underline py-6"
                  >
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#596155] leading-relaxed text-base pb-6">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SectionReveal>
        )}
      </section>

      {/* CONTACT STRIP */}
      <section className="border-t border-[#D1CDBC] bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 grid gap-4 md:grid-cols-2">
          <SectionReveal className="rounded-sm border border-[#D1CDBC] p-8 hover:-translate-y-1 transition-transform">
            <Mail size={24} className="text-[#284226]" />
            <p className="mt-4 font-display text-2xl font-bold text-[#121710]">
              Write to us
            </p>
            <p className="mt-2 text-[#596155]">
              Best for billing, partnerships, anything non-urgent.
            </p>
            <a
              href="mailto:hello@bincycle.in"
              data-testid="help-email-link"
              className="mt-5 inline-flex text-sm font-medium text-[#C45B38] underline-offset-4 hover:underline"
            >
              hello@bincycle.in
            </a>
          </SectionReveal>
          <SectionReveal
            delay={0.05}
            className="rounded-sm border border-[#D1CDBC] p-8 hover:-translate-y-1 transition-transform"
          >
            <MessageSquare size={24} className="text-[#284226]" />
            <p className="mt-4 font-display text-2xl font-bold text-[#121710]">
              Talk to us
            </p>
            <p className="mt-2 text-[#596155]">
              Pickup issue or rescheduling? Our team is on chat 7am–9pm.
            </p>
            <Link
              href="/contact"
              data-testid="help-contact-link"
              className="mt-5 inline-flex text-sm font-medium text-[#C45B38] underline-offset-4 hover:underline"
            >
              Open contact page →
            </Link>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
