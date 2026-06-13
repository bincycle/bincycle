import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import { impactStats } from "@workspace/data/mockData";

const TEXTURE_IMG =
  "https://static.prod-images.emergentagent.com/jobs/85afc4d7-2033-4a56-a1f2-66a9c918c165/images/ce72d1ba64fbe7066480c12414ff18ecabe93fd1b2c921a71622de61f4c2dab1.png";
const BINS_IMG =
  "https://images.pexels.com/photos/34406294/pexels-photo-34406294.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

const team: TeamMember[] = [
  {
    name: "Sudhanshu N",
    role: "Co-founder & CEO",
    bio: "Ex-product at a logistics unicorn. Quit when her own building's waste ended up in a lake.",
  },
  {
    name: "Varshith R",
    role: "Co-founder & COO",
    bio: "Spent 9 years building urban delivery routes. Now routing the other direction.",
  },
  // {
    // name: "Sneha Pillai",
    // role: "Head of Recycling",
    // bio: "Materials scientist who'd rather see things reborn than buried.",
  // },
];

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <SectionReveal>
          <p className="font-mono-label text-xs text-[#596155]">
            [ about bincycle ]
          </p>
        </SectionReveal>
        <SectionReveal delay={0.05}>
          <h1 className="mt-5 max-w-4xl font-display font-black tracking-tighter text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-[#121710]">
            We started Bincycle
            <br />
            because the
            <span className="italic font-medium text-[#C45B38]"> old way</span>{" "}
            was breaking.
          </h1>
        </SectionReveal>
        <SectionReveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-lg text-[#596155] leading-relaxed">
            India generates over 62 million tonnes of waste a year. Most of it
            ends up in landfills, in rivers, or on fire. We're trying — block by
            block, kitchen by kitchen — to bend that arrow back.
          </p>
        </SectionReveal>
      </section>

      {/* IMAGE + STORY */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-center">
          <SectionReveal className="lg:col-span-6">
            <img
              src={BINS_IMG}
              alt="Colourful recycling bins"
              className="aspect-[4/5] w-full rounded-sm object-cover border border-[#D1CDBC]"
            />
          </SectionReveal>
          <div className="lg:col-span-6 space-y-8">
            <SectionReveal>
              <p className="font-mono-label text-xs text-[#596155]">
                [ our story ]
              </p>
              <h2 className="mt-4 font-display font-black tracking-tighter text-3xl sm:text-4xl text-[#121710]">
                Built by people tired of chasing pickup vans.
              </h2>
            </SectionReveal>
            <SectionReveal delay={0.05}>
              <p className="text-[#596155] leading-relaxed">
                Bincycle began as a Sunday-morning WhatsApp group in a Bengaluru
                apartment. Our garbage collector kept missing days. We built a
                small scheduler. Other buildings asked for access. Three months
                later, we had 4 pickup partners and a real product on our hands.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <p className="text-[#596155] leading-relaxed">
                Today, Bincycle runs in five cities with a small fleet of
                electric pickup vehicles, dozens of trained partners, and a
                single, stubborn belief: a city that respects its waste, respects
                itself.
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="border-y border-[#D1CDBC] bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
          <SectionReveal>
            <p className="font-mono-label text-xs text-[#596155]">
              [ measured impact, not vibes ]
            </p>
            <h2 className="mt-4 max-w-3xl font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
              Every kilo gets a barcode.
            </h2>
          </SectionReveal>
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#D1CDBC] border border-[#D1CDBC] rounded-sm overflow-hidden">
            {impactStats.map((s) => (
              <div key={s.label} className="bg-white p-8 sm:p-10">
                <p className="font-display text-5xl sm:text-6xl font-black tracking-tighter text-[#284226]">
                  {s.value}
                </p>
                <p className="mt-3 text-sm text-[#596155]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <SectionReveal>
          <p className="font-mono-label text-xs text-[#596155]">[ team ]</p>
          <h2 className="mt-4 max-w-3xl font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
            Small team. Big route map.
          </h2>
        </SectionReveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {team.map((m, i) => (
            <SectionReveal
              key={m.name}
              delay={i * 0.05}
              className="rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-7"
            >
              <div
                className="aspect-square w-full rounded-sm mb-5"
                style={{
                  backgroundImage: `url(${TEXTURE_IMG})`,
                  backgroundSize: "cover",
                }}
              />
              <p className="font-display text-2xl font-bold tracking-tight text-[#121710]">
                {m.name}
              </p>
              <p className="font-mono-label text-xs text-[#C45B38] mt-1">
                {m.role}
              </p>
              {/* <p className="mt-4 text-sm text-[#596155] leading-relaxed">
                {m.bio}
              </p> */}
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#171A15] text-[#F7F5F0]">
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 grid gap-8 lg:grid-cols-12 items-center">
          <SectionReveal className="lg:col-span-8">
            <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl">
              Want to bring Bincycle to your block?
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.1} className="lg:col-span-4 flex lg:justify-end">
            <Link
              href="/contact"
              data-testid="about-cta-contact"
              className="group inline-flex items-center gap-2 rounded-sm bg-[#C45B38] px-6 py-3.5 text-base font-medium text-[#F7F5F0] hover:bg-[#A64A2B]"
            >
              Get in touch
              <ArrowUpRight size={18} />
            </Link>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
