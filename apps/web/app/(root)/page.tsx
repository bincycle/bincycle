import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import Marquee from "@/components/Marquee";
import {
  howItWorks,
  impactStats,
  testimonials,
  pricingPlans,
} from "@workspace/data/mockData";

const HERO_IMG =
  "https://static.prod-images.emergentagent.com/jobs/85afc4d7-2033-4a56-a1f2-66a9c918c165/images/47998dda7a2529325f75bee90bda1838bbc45ab787b576520136ca9ea7a216ca.png";
const CIRCULAR_IMG =
  "https://static.prod-images.emergentagent.com/jobs/85afc4d7-2033-4a56-a1f2-66a9c918c165/images/50da556fcc7e838a92fee7c764dbcc17001186fd23d77a71fe0f32e49379fc6a.png";
const TEXTURE_IMG =
  "https://static.prod-images.emergentagent.com/jobs/85afc4d7-2033-4a56-a1f2-66a9c918c165/images/ce72d1ba64fbe7066480c12414ff18ecabe93fd1b2c921a71622de61f4c2dab1.png";

export default function HomePage() {
  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-12 sm:pt-20 pb-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <SectionReveal>
                <p className="font-mono-label text-xs text-[#596155]">
                  [ on-demand · pan-india · electric fleet ]
                </p>
              </SectionReveal>
              <SectionReveal delay={0.05}>
                <h1 className="mt-5 font-display font-black tracking-tighter text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-[#121710]">
                  Trash, picked up.
                  <br />
                  <span className="italic font-medium text-[#284226]">
                    Planet,
                  </span>{" "}
                  a little lighter.
                </h1>
              </SectionReveal>
              <SectionReveal delay={0.1}>
                <p className="mt-6 max-w-xl text-lg text-[#596155] leading-relaxed">
                  Bincycle is the on-demand pickup service your kitchen, balcony
                  and society have been waiting for. Pick a day, pick a slot,
                  we'll do the rest.
                </p>
              </SectionReveal>
              <SectionReveal delay={0.15}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link
                    href="https://customer.bincycle.in/book-pickup"
                    data-testid="hero-cta-book"
                    className="group inline-flex items-center gap-2 rounded-sm bg-[#284226] px-6 py-3.5 text-base font-medium text-[#F7F5F0] transition-colors hover:bg-[#1C2E1A]"
                  >
                    Book a pickup
                    <ArrowUpRight
                      size={18}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                  <Link
                    href="/pricing"
                    data-testid="hero-cta-pricing"
                    className="inline-flex items-center gap-2 rounded-sm border border-[#121710] px-6 py-3.5 text-base font-medium text-[#121710] transition-colors hover:bg-[#121710] hover:text-[#F7F5F0]"
                  >
                    See pricing
                  </Link>
                </div>
              </SectionReveal>
              <SectionReveal delay={0.2}>
                <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
                  {impactStats.slice(0, 3).map((s) => (
                    <div key={s.label}>
                      <p className="font-display text-3xl font-black text-[#121710]">
                        {s.value}
                      </p>
                      <p className="text-xs text-[#596155] mt-1 leading-snug">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionReveal>
            </div>

            <SectionReveal delay={0.1} className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-[#D1CDBC] bg-[#EDE9DC]">
                {/*
                 * Using <img> here instead of next/image because the src is an
                 * external URL from a third-party CDN not listed in next.config.
                 * Add the domain to `images.remotePatterns` in next.config.ts and
                 * swap to <Image> for automatic optimisation.
                 */}
                <img
                  src={HERO_IMG}
                  alt="Bincycle electric pickup truck"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-sm bg-[#F7F5F0]/95 backdrop-blur-md px-4 py-3 border border-[#D1CDBC]">
                  <div>
                    <p className="font-mono-label text-[10px] text-[#596155]">
                      Live route
                    </p>
                    <p className="text-sm font-semibold text-[#121710]">
                      BLR-East · 12 stops today
                    </p>
                  </div>
                  <span className="flex h-2 w-2 rounded-full bg-[#C45B38] animate-pulse" />
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee
        items={[
          "Plastic recycled",
          "Paper sorted",
          "Metal recovered",
          "Glass diverted",
          "E-waste handled",
          "Wet composted",
        ]}
      />

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-end mb-12">
          <SectionReveal className="lg:col-span-7">
            <p className="font-mono-label text-xs text-[#596155]">
              [ 04 simple steps ]
            </p>
            <h2 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-5xl lg:text-6xl text-[#121710]">
              How Bincycle works
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.1} className="lg:col-span-5">
            <p className="text-[#596155] leading-relaxed">
              From your kitchen counter to a verified recycler, in under 36
              hours. Here's the path your waste actually takes.
            </p>
          </SectionReveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {howItWorks.map((step, idx) => (
            <SectionReveal
              key={step.step}
              delay={idx * 0.05}
              className={`group relative overflow-hidden rounded-sm border border-[#D1CDBC] bg-white p-7 transition-transform hover:-translate-y-1 ${
                idx === 0
                  ? "lg:col-span-5 lg:row-span-2"
                  : "lg:col-span-3"
              }`}
            >
              <p className="font-mono-label text-xs text-[#C45B38]">
                {step.step}
              </p>
              <h3 className="mt-4 font-display text-2xl font-bold text-[#121710] tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-sm text-[#596155] leading-relaxed">
                {step.body}
              </p>
              {idx === 0 && (
                <img
                  src={CIRCULAR_IMG}
                  alt=""
                  className="mt-8 w-full rounded-sm"
                />
              )}
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="bg-white border-y border-[#D1CDBC]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
          <div className="grid gap-12 lg:grid-cols-12 items-end mb-12">
            <SectionReveal className="lg:col-span-7">
              <p className="font-mono-label text-xs text-[#596155]">
                [ honest pricing ]
              </p>
              <h2 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                Three ways to get started
              </h2>
            </SectionReveal>
            <SectionReveal delay={0.1} className="lg:col-span-5">
              <p className="text-[#596155] leading-relaxed">
                Cancel anytime. Switch plans anytime. No contracts, no setup
                fees, no surprise charges buried in the small print.
              </p>
            </SectionReveal>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <SectionReveal
                key={plan.id}
                className={`relative flex flex-col rounded-sm border p-7 transition-all hover:-translate-y-1 ${
                  plan.accent
                    ? "border-[#284226] bg-[#284226] text-[#F7F5F0] lg:scale-[1.02]"
                    : "border-[#D1CDBC] bg-[#F7F5F0]"
                }`}
              >
                {plan.accent && (
                  <span className="absolute -top-3 left-7 rounded-sm bg-[#C45B38] px-2.5 py-1 font-mono-label text-[10px] text-[#F7F5F0]">
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
                <ul className="mt-6 space-y-2 text-sm flex-1">
                  {plan.features.slice(0, 4).map((f) => (
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
                  href="/pricing"
                  data-testid={`home-pricing-cta-${plan.id}`}
                  className={`mt-7 inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-medium transition-colors ${
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
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <SectionReveal>
          <p className="font-mono-label text-xs text-[#596155]">
            [ from real streets ]
          </p>
          <h2 className="mt-4 max-w-3xl font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
            People who stopped chasing the kachra-wala.
          </h2>
        </SectionReveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <SectionReveal
              key={t.id}
              delay={i * 0.08}
              className="rounded-sm border border-[#D1CDBC] bg-white p-7"
            >
              <p className="font-display text-xl leading-snug text-[#121710]">
                &ldquo;{t.body}&rdquo;
              </p>
              <div className="mt-6 pt-6 border-t border-[#D1CDBC]">
                <p className="text-sm font-semibold text-[#121710]">{t.name}</p>
                <p className="text-xs text-[#596155]">{t.city}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* CTA DARK */}
      <section className="relative overflow-hidden bg-[#171A15] text-[#F7F5F0]">
        <img
          src={TEXTURE_IMG}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-screen"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-24 grid gap-10 lg:grid-cols-12 items-center">
          <SectionReveal className="lg:col-span-8">
            <p className="font-mono-label text-xs text-[#F7F5F0]/60">
              [ ready when you are ]
            </p>
            <h2 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-5xl lg:text-6xl">
              Your first pickup is{" "}
              <span className="italic font-medium text-[#C45B38]">free.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[#F7F5F0]/70 leading-relaxed">
              Try Bincycle on us. No card, no commitment. Just a cleaner kitchen
              counter by tomorrow.
            </p>
          </SectionReveal>
          <SectionReveal
            delay={0.1}
            className="lg:col-span-4 flex lg:justify-end"
          >
            <Link
              href="https://customer.bincycle.in/book-pickup"
              data-testid="cta-dark-book"
              className="group inline-flex items-center gap-2 rounded-sm bg-[#C45B38] px-7 py-4 text-base font-medium text-[#F7F5F0] hover:bg-[#A64A2B] transition-colors"
            >
              Book my first pickup
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
