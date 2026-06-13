import Link from "next/link";
import { Check } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import { pricingPlans } from "@workspace/data/mockData";

interface ComparisonRow {
  feature: string;
  values: string[];
}

const comparisons: ComparisonRow[] = [
  { feature: "Pickups per month", values: ["1 (on-demand)", "4", "8"] },
  {
    feature: "Bag/weight limit",
    values: ["Up to 25 kg", "Up to 40 kg / pickup", "Unlimited"],
  },
  { feature: "Priority slot booking", values: ["—", "Yes", "Yes"] },
  { feature: "Recurring schedule", values: ["—", "Yes", "Yes"] },
  {
    feature: "E-waste & bulky items",
    values: ["Add-on", "Add-on", "Included"],
  },
  { feature: "Monthly impact report", values: ["—", "—", "Yes"] },
  { feature: "Dedicated partner", values: ["—", "—", "Yes"] },
];

interface FaqItem {
  q: string;
  a: string;
}

const faq: FaqItem[] = [
  {
    q: "Are there any sign-up or setup fees?",
    a: "Nope. Pick a plan, get picked up. Cancel anytime.",
  },
  {
    q: "Can I switch plans mid-month?",
    a: "Yes. Pro-rated billing kicks in automatically.",
  },
  {
    q: "What if I'm out of town for a week?",
    a: "Pause your plan for up to 30 days a year without losing anything.",
  },
];

export default function PricingPage() {
  return (
    <div data-testid="pricing-page">
      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <SectionReveal>
          <p className="font-mono-label text-xs text-[#596155]">[ pricing ]</p>
        </SectionReveal>
        <SectionReveal delay={0.05}>
          <h1 className="mt-5 max-w-4xl font-display font-black tracking-tighter text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-[#121710]">
            Simple plans for{" "}
            <span className="italic font-medium text-[#284226]">real</span>{" "}
            kitchens.
          </h1>
        </SectionReveal>
        <SectionReveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg text-[#596155] leading-relaxed">
            No setup charges, no annual lock-ins, no per-bag surge pricing. Pick
            what fits your week — switch or cancel anytime.
          </p>
        </SectionReveal>
      </section>

      {/* PRICING CARDS */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {pricingPlans.map((plan, i) => (
            <SectionReveal
              key={plan.id}
              delay={i * 0.05}
              className={`relative flex flex-col rounded-sm border p-8 transition-all hover:-translate-y-1 ${
                plan.accent
                  ? "border-[#284226] bg-[#284226] text-[#F7F5F0] lg:scale-[1.03] z-10"
                  : "border-[#D1CDBC] bg-white"
              }`}
            >
              {plan.accent && (
                <span className="absolute -top-3 left-8 rounded-sm bg-[#C45B38] px-2.5 py-1 font-mono-label text-[10px] text-[#F7F5F0]">
                  Most popular
                </span>
              )}
              <p
                className={`font-mono-label text-xs ${
                  plan.accent ? "text-[#F7F5F0]/70" : "text-[#596155]"
                }`}
              >
                {plan.name}
              </p>
              <p className="mt-4 font-display text-5xl font-black tracking-tighter">
                {plan.price}
              </p>
              <p
                className={`text-sm ${
                  plan.accent ? "text-[#F7F5F0]/70" : "text-[#596155]"
                }`}
              >
                {plan.cadence}
              </p>
              <p
                className={`mt-4 text-sm leading-relaxed ${
                  plan.accent ? "text-[#F7F5F0]/80" : "text-[#596155]"
                }`}
              >
                {plan.tagline}
              </p>
              <ul className="mt-6 space-y-3 text-sm flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        plan.accent ? "text-[#C45B38]" : "text-[#284226]"
                      }`}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="https://customer.bincycle.in/book-pickup"
                data-testid={`pricing-cta-${plan.id}`}
                className={`mt-8 inline-flex items-center justify-center rounded-sm px-5 py-3.5 text-sm font-medium transition-colors ${
                  plan.accent
                    ? "bg-[#C45B38] text-[#F7F5F0] hover:bg-[#A64A2B]"
                    : "border border-[#121710] text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0]"
                }`}
              >
                {plan.ctaLabel}
              </Link>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* COMPARE TABLE */}
      <section className="border-y border-[#D1CDBC] bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
          <SectionReveal>
            <p className="font-mono-label text-xs text-[#596155]">
              [ side-by-side ]
            </p>
            <h2 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
              Compare what&apos;s included
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <div className="mt-12 overflow-x-auto rounded-sm border border-[#D1CDBC]">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F5F0]">
                  <tr>
                    <th className="text-left p-5 font-mono-label text-xs text-[#596155]">
                      Feature
                    </th>
                    {pricingPlans.map((p) => (
                      <th
                        key={p.id}
                        className="text-left p-5 font-display text-lg font-bold text-[#121710]"
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={i % 2 ? "bg-[#F7F5F0]/50" : "bg-white"}
                    >
                      <td className="p-5 text-[#596155]">{row.feature}</td>
                      {row.values.map((v, j) => (
                        <td key={j} className="p-5 text-[#121710]">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-5 sm:px-8 py-24">
        <SectionReveal>
          <p className="font-mono-label text-xs text-[#596155]">
            [ pricing questions ]
          </p>
          <h2 className="mt-4 font-display font-black tracking-tighter text-4xl text-[#121710]">
            Common questions
          </h2>
        </SectionReveal>
        <div className="mt-10 space-y-3">
          {faq.map((f, i) => (
            <SectionReveal
              key={f.q}
              delay={i * 0.05}
              className="rounded-sm border border-[#D1CDBC] bg-white p-6"
            >
              <p className="font-display text-lg font-bold text-[#121710]">
                {f.q}
              </p>
              <p className="mt-2 text-[#596155] leading-relaxed">{f.a}</p>
            </SectionReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
