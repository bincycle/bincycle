import SectionReveal from "@/components/SectionReveal";

interface PolicySection {
  h: string;
  p: string;
}

const sections: PolicySection[] = [
  {
    h: "1. What we collect",
    p: "We collect only what we need to pick up your waste and bill you correctly: your name, contact details, pickup address(es), pickup history, payment metadata (handled by our payment partners) and any photos you choose to upload with a booking.",
  },
  {
    h: "2. How we use it",
    p: "Your data is used to schedule pickups, route partners, generate invoices, send essential service updates and improve the Bincycle service. We do not sell your data. Period.",
  },
  {
    h: "3. Who we share with",
    p: "We share the minimum necessary data with our pickup partners (just enough to find your door), payment processors (to take payment), and recycling facilities (anonymised weight data). All partners are bound by data-protection agreements.",
  },
  {
    h: "4. Cookies & analytics",
    p: "We use a small set of first-party cookies to keep you signed in and remember preferences. We also use privacy-respecting analytics to understand which pages help users most. You can clear these anytime from your browser.",
  },
  {
    h: "5. Your rights",
    p: "You can request a copy of your data, ask us to correct it, or ask us to delete it entirely. Write to privacy@bincycle.in and we'll respond within 14 days.",
  },
  {
    h: "6. Security",
    p: "Bincycle uses industry-standard encryption in transit and at rest. Production systems are access-controlled and audited. No system is perfect — but we treat your data like it's our own.",
  },
  {
    h: "7. Changes to this policy",
    p: "We may update this policy from time to time. Material changes will be announced via email and via a banner on bincycle.in.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <article
      data-testid="privacy-page"
      className="mx-auto max-w-3xl px-5 sm:px-8 pt-16 sm:pt-24 pb-24"
    >
      <SectionReveal>
        <p className="font-mono-label text-xs text-[#596155]">
          [ legal · last updated 12 Feb 2026 ]
        </p>
      </SectionReveal>
      <SectionReveal delay={0.05}>
        <h1 className="mt-5 font-display font-black tracking-tighter text-5xl sm:text-6xl text-[#121710]">
          Privacy Policy
        </h1>
      </SectionReveal>
      <SectionReveal delay={0.1}>
        <p className="mt-6 text-lg text-[#596155] leading-relaxed">
          This is the short, honest version. We collect as little personal data
          as we can get away with, we use it only to run Bincycle, and we never
          sell it.
        </p>
      </SectionReveal>

      <div className="mt-12 space-y-10">
        {sections.map((s, i) => (
          <SectionReveal key={s.h} delay={i * 0.03}>
            <h2 className="font-display text-2xl font-bold text-[#121710]">
              {s.h}
            </h2>
            <p className="mt-3 text-[#596155] leading-relaxed">{s.p}</p>
          </SectionReveal>
        ))}
      </div>

      <SectionReveal>
        <div className="mt-16 rounded-sm border border-[#D1CDBC] bg-white p-6">
          <p className="font-mono-label text-xs text-[#596155]">Questions?</p>
          <p className="mt-2 text-[#121710]">
            Email{" "}
            <a
              href="mailto:privacy@bincycle.in"
              data-testid="privacy-contact-link"
              className="text-[#C45B38] font-medium hover:underline underline-offset-4"
            >
              privacy@bincycle.in
            </a>{" "}
            and a real person will get back to you.
          </p>
        </div>
      </SectionReveal>
    </article>
  );
}
