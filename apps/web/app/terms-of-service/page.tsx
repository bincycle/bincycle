import SectionReveal from "@/components/SectionReveal";

interface PolicySection {
  h: string;
  p: string;
}

const sections: PolicySection[] = [
  {
    h: "1. Acceptance",
    p: "By using Bincycle (the app, the website, or any pickup booked through us), you agree to these Terms. If you don't, please don't use the service.",
  },
  {
    h: "2. The service",
    p: "Bincycle offers on-demand and subscription-based household and small-business waste pickup in select Indian cities. Pickups are performed by Bincycle staff or vetted partners.",
  },
  {
    h: "3. Your responsibilities",
    p: "You agree to provide accurate pickup details, segregate hazardous materials clearly, and not request pickups for items prohibited by law (medical, radioactive, explosive, construction debris over the stated limit, etc.).",
  },
  {
    h: "4. Payment",
    p: "On-demand pickups are charged per booking. Subscription plans are billed monthly in advance. Failed payments may pause your service. All amounts are inclusive of taxes unless stated.",
  },
  {
    h: "5. Cancellations & refunds",
    p: "You can reschedule or cancel any pickup before its slot window opens. Cancellations made under 1 hour from pickup may attract a small partner fee. Refunds for prepaid plans are pro-rated.",
  },
  {
    h: "6. Liability",
    p: "Bincycle is not liable for delays caused by weather, traffic, government restrictions, or other events beyond reasonable control. Our liability is capped at the amount paid for the affected pickup.",
  },
  {
    h: "7. Termination",
    p: "Bincycle reserves the right to refuse or terminate service for abuse, fraud, repeated mis-declaration of waste, or any conduct that endangers our partners.",
  },
  {
    h: "8. Changes",
    p: "We may update these Terms occasionally. Continued use after an update means you accept the revised Terms.",
  },
  {
    h: "9. Governing law",
    p: "These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.",
  },
];

export default function TermsOfServicePage() {
  return (
    <article
      data-testid="terms-page"
      className="mx-auto max-w-3xl px-5 sm:px-8 pt-16 sm:pt-24 pb-24"
    >
      <SectionReveal>
        <p className="font-mono-label text-xs text-[#596155]">
          [ legal · last updated 12 Feb 2026 ]
        </p>
      </SectionReveal>
      <SectionReveal delay={0.05}>
        <h1 className="mt-5 font-display font-black tracking-tighter text-5xl sm:text-6xl text-[#121710]">
          Terms of Service
        </h1>
      </SectionReveal>
      <SectionReveal delay={0.1}>
        <p className="mt-6 text-lg text-[#596155] leading-relaxed">
          The rules of using Bincycle. Written in plain English, with minimal
          lawyer salt.
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
          <p className="font-mono-label text-xs text-[#596155]">
            Legal questions?
          </p>
          <p className="mt-2 text-[#121710]">
            Email{" "}
            <a
              href="mailto:legal@bincycle.in"
              data-testid="terms-contact-link"
              className="text-[#C45B38] font-medium hover:underline underline-offset-4"
            >
              legal@bincycle.in
            </a>{" "}
            for clarifications or partnership terms.
          </p>
        </div>
      </SectionReveal>
    </article>
  );
}
