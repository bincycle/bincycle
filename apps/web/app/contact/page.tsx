import { Mail, MapPin, Phone } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import ContactForm from "./ContactForm";

interface Office {
  city: string;
  addr: string;
}

const offices: Office[] = [
  {
    city: "Bengaluru — HQ",
    addr: "WeWork Galaxy, 43 Residency Rd, Bengaluru 560025",
  },
  // {
  //   city: "Mumbai",
  //   addr: "BKC Annex, Bandra-Kurla Complex, Mumbai 400051",
  // },
  // {
  //   city: "Gurugram",
  //   addr: "Two Horizon Centre, Sector 43, Gurugram 122002",
  // },
];

export default function ContactPage() {
  return (
    <div data-testid="contact-page">
      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <SectionReveal>
          <p className="font-mono-label text-xs text-[#596155]">[ contact ]</p>
        </SectionReveal>
        <SectionReveal delay={0.05}>
          <h1 className="mt-5 max-w-4xl font-display font-black tracking-tighter text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-[#121710]">
            Say hi. We{" "}
            <span className="italic font-medium text-[#284226]">actually</span>{" "}
            reply.
          </h1>
        </SectionReveal>
        <SectionReveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg text-[#596155] leading-relaxed">
            Whether it&apos;s a missed pickup, a press request, or you just want
            to bring Bincycle to your city — start here.
          </p>
        </SectionReveal>
      </section>

      {/* FORM + SIDEBAR */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24 grid gap-12 lg:grid-cols-12">
        {/*
         * ContactForm is a Client Component (useState + toast).
         * It sits as an "island" inside this Server Component page.
         * Everything else on this page (header, sidebar) is rendered on the server.
         */}
        <SectionReveal className="lg:col-span-7">
          <ContactForm />
        </SectionReveal>

        <SectionReveal delay={0.1} className="lg:col-span-5 space-y-8">
          <div>
            <p className="font-mono-label text-xs text-[#596155]">
              [ reach us directly ]
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-[#284226] mt-0.5" />
                <div>
                  <p className="text-sm text-[#596155]">Email</p>
                  <a
                    href="mailto:hello@bincycle.in"
                    data-testid="contact-email"
                    className="text-[#121710] font-medium hover:text-[#C45B38]"
                  >
                    hello@bincycle.in
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-[#284226] mt-0.5" />
                <div>
                  <p className="text-sm text-[#596155]">Support</p>
                  <a
                    href="tel:+918012345678"
                    data-testid="contact-phone"
                    className="text-[#121710] font-medium hover:text-[#C45B38]"
                  >
                    +91 80 1234 5678
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#D1CDBC]">
            <p className="font-mono-label text-xs text-[#596155]">
              [ offices ]
            </p>
            <ul className="mt-5 space-y-5">
              {offices.map((o) => (
                <li key={o.city} className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="text-[#284226] mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="font-display text-base font-bold text-[#121710]">
                      {o.city}
                    </p>
                    <p className="text-sm text-[#596155] leading-relaxed mt-1">
                      {o.addr}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </SectionReveal>
      </section>
    </div>
  );
}
