import Link from "next/link";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import Logo from "@/components/Logo";

interface FooterLink {
  to: string;
  label: string;
}

interface FooterCol {
  title: string;
  links: FooterLink[];
}

const cols: FooterCol[] = [
  {
    title: "Product",
    links: [
      { to: "/pricing", label: "Pricing" },
      { to: "/dashboard/book-pickup", label: "Book a pickup" },
      { to: "/help", label: "Help center" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/help", label: "FAQs" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy-policy", label: "Privacy" },
      { to: "/terms-of-service", label: "Terms" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="border-t border-[#D1CDBC] bg-[#F7F5F0]"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm text-[#596155] leading-relaxed">
              On-demand waste pickup that actually shows up. Built for Indian
              streets, kitchens and apartment blocks.
            </p>
            <div className="mt-8 flex items-center gap-2">
              <a
                href="#"
                aria-label="Instagram"
                data-testid="footer-social-instagram"
                className="rounded-sm border border-[#D1CDBC] p-2.5 text-[#121710] transition-colors hover:bg-[#121710] hover:text-[#F7F5F0]"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                data-testid="footer-social-twitter"
                className="rounded-sm border border-[#D1CDBC] p-2.5 text-[#121710] transition-colors hover:bg-[#121710] hover:text-[#F7F5F0]"
              >
                <Twitter size={16} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                data-testid="footer-social-linkedin"
                className="rounded-sm border border-[#D1CDBC] p-2.5 text-[#121710] transition-colors hover:bg-[#121710] hover:text-[#F7F5F0]"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="font-mono-label text-xs text-[#596155]">
                  {c.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        href={l.to}
                        data-testid={`footer-link-${l.label
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="text-[#121710] hover:text-[#C45B38] transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[#D1CDBC] pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-[#596155]">
            © {new Date().getFullYear()} Bincycle Waste Pvt. Ltd. Built with
            care in India.
          </p>
          <p className="font-mono-label text-xs text-[#596155]">
            bincycle.in · v1.0
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
