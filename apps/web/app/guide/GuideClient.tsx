"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Scale, Plus, Minus, Info, Trash2, HelpCircle, Check, ShieldCheck, ChevronDown } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";

interface PricingTier {
  id: string;
  minWeight: number;
  maxWeight: number;
  label: string;
  price: number;
  bestFor: string;
  comparison: string;
}

const PRICING_TIERS: PricingTier[] = [
  { id: "tier-1", minWeight: 0, maxWeight: 10, label: "0-10 kg", price: 49, bestFor: "1-2 standard kitchen bags", comparison: "Perfect for single occupants or light weekly waste." },
  { id: "tier-2", minWeight: 10, maxWeight: 15, label: "10-15 kg", price: 69, bestFor: "2-3 bags + cardboard delivery boxes", comparison: "Great for typical couples or small apartments." },
  { id: "tier-3", minWeight: 15, maxWeight: 20, label: "15-20 kg", price: 99, bestFor: "3-4 bags + garden trimmings", comparison: "Ideal for average 3-4 person nuclear families." },
  { id: "tier-4", minWeight: 20, maxWeight: 25, label: "20-25 kg", price: 119, bestFor: "4-5 bags or small garage cleanup", comparison: "Standard weekly load for larger active households." },
  { id: "tier-5", minWeight: 25, maxWeight: 30, label: "25-30 kg", price: 149, bestFor: "5-6 bags + newspaper stack", comparison: "Heavy recycling + organic waste accumulation." },
  { id: "tier-6", minWeight: 30, maxWeight: 40, label: "30-40 kg", price: 199, bestFor: "Full balcony or medium garden cleanout", comparison: "Deep cleanup load or double-bin weekly collection." },
  { id: "tier-7", minWeight: 40, maxWeight: 50, label: "40-50 kg", price: 249, bestFor: "Office waste or small event cleanup", comparison: "Excellent for small businesses or post-party cleanups." },
  { id: "tier-8", minWeight: 50, maxWeight: 100, label: "50-100 kg", price: 499, bestFor: "Massive estate clearout or block pickup", comparison: "Bulk volume capacity for heavy residential or commercial needs." },
];

interface EstimatorItem {
  id: string;
  name: string;
  weight: number; // in kg
  icon: string;
  category: string;
}

const ESTIMATOR_ITEMS: EstimatorItem[] = [
  { id: "item-kitchen-wet", name: "Daily Kitchen Waste (x7 days)", weight: 10.5, icon: "🍉", category: "Organic" },
  { id: "item-newspaper", name: "Newspapers Stack (Monthly)", weight: 5.0, icon: "📰", category: "Paper" },
  { id: "item-glass-bottles", name: "Glass Bottles / Jars (x10)", weight: 4.5, icon: "🍾", category: "Glass" },
  { id: "item-ewaste", name: "Old Electronics & Cables", weight: 3.0, icon: "💻", category: "E-waste" },
  { id: "item-cardboard", name: "Cardboard Delivery Boxes (x5)", weight: 2.5, icon: "📦", category: "Paper" },
  { id: "item-books", name: "Old Textbooks / Magazines", weight: 6.0, icon: "📚", category: "Paper" },
  { id: "item-metal", name: "Metal Cans & Aerosols (x15)", weight: 1.5, icon: "🥫", category: "Metal" },
  { id: "item-pet-bottles", name: "Plastic Bottles (Big Bag)", weight: 1.2, icon: "🧴", category: "Plastic" },
];

interface FaqItem {
  q: string;
  a: string;
}

const FAQs: FaqItem[] = [
  {
    q: "How does the doorstep weighing work?",
    a: "Every Bincycle pickup partner carries a handheld, professionally calibrated digital hanging scale. Before your waste is loaded into our electric vehicle, we weigh it in front of you. The final price is calculated in real time, and you'll receive a digital receipt immediately via SMS/WhatsApp.",
  },
  {
    q: "What if my actual weight is different from my booking estimate?",
    a: "Don't worry about being exact! Our online booking is just a reservation. If your actual waste weighs more or less at the door, we adjust you to the correct bracket automatically. There are absolutely no penalties, overage fees, or surprises.",
  },
  {
    q: "Is there a minimum weight limit?",
    a: "No minimum limit! Even if you have just 2kg of waste, our base tier covers any amount up to 10kg for ₹49. It's built to keep sorting affordable and simple for single occupants and busy kitchens.",
  },
  {
    q: "Can I book a pickup for more than 100 kg?",
    a: "Absolutely. For societies, apartment blocks, commercial cafes, or massive home renovation dump runs exceeding 100kg, please tap our Contact page or WhatsApp support. We configure customized logistics and volume rates for bulk clients.",
  },
  {
    q: "How do you ensure scale accuracy?",
    a: "Our scales are certified and calibrated monthly. If you have any doubts, you are welcome to test our scale's accuracy on-the-spot using a standard household item of known weight (e.g., a sealed water bottle). Transparency is our core value.",
  },
];

export const GuideClient = () => {
  // Navigation / Tab state between manual slider and itemized estimator
  const [isUsingBin, setIsUsingBin] = useState<boolean>(false);

  // States
  const [sliderWeight, setSliderWeight] = useState<number>(20);
  const [binQuantities, setBinQuantities] = useState<Record<string, number>>({});
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({});

  // Compute total bin weight
  const binWeight = useMemo(() => {
    return Object.entries(binQuantities).reduce((acc, [itemId, qty]) => {
      const item = ESTIMATOR_ITEMS.find((i) => i.id === itemId);
      if (!item) return acc;
      return acc + item.weight * qty;
    }, 0);
  }, [binQuantities]);

  const activeWeight = isUsingBin ? binWeight : sliderWeight;

  // Find matching tier
  const activeTier = useMemo(() => {
    const w = activeWeight;
    if (w <= 10) return PRICING_TIERS[0];
    if (w <= 15) return PRICING_TIERS[1];
    if (w <= 20) return PRICING_TIERS[2];
    if (w <= 25) return PRICING_TIERS[3];
    if (w <= 30) return PRICING_TIERS[4];
    if (w <= 40) return PRICING_TIERS[5];
    if (w <= 50) return PRICING_TIERS[6];
    return PRICING_TIERS[7];
  }, [activeWeight]);

  // Adjust bin items
  const adjustBinQty = (itemId: string, amount: number) => {
    setIsUsingBin(true);
    setBinQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + amount);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = next;
      }
      return updated;
    });
  };

  const clearBin = () => {
    setBinQuantities({});
  };

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="grain min-h-screen bg-[#F7F5F0] text-[#121710] pb-24">
      {/* HEADER SECTION */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <SectionReveal>
          <p className="font-mono-label text-xs text-[#596155]">[ pricing calculator ]</p>
        </SectionReveal>
        <SectionReveal delay={0.05}>
          <h1 className="mt-5 max-w-4xl font-display font-black tracking-tighter text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-[#121710]">
            Know your weight.
            <br />
            Know your <span className="italic font-medium text-[#C45B38]">exact price.</span>
          </h1>
        </SectionReveal>
        <SectionReveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg text-[#596155] leading-relaxed">
            Indian homes discard waste in different cycles. Use our interactive estimator or slider below to simulate your waste load and find your transparent pricing bracket.
          </p>
        </SectionReveal>
      </section>

      {/* CALCULATOR INTERFACE */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT: CONTROLS */}
          <div className="lg:col-span-7 space-y-6">
            <SectionReveal className="bg-white border border-[#D1CDBC] rounded-sm p-6 sm:p-8">
              {/* TABS */}
              <div className="flex gap-2 p-1 bg-[#F7F5F0] border border-[#D1CDBC] rounded-sm mb-8">
                <button
                  onClick={() => setIsUsingBin(false)}
                  className={`flex-1 py-3 text-sm font-medium transition-all ${
                    !isUsingBin
                      ? "bg-[#284226] text-[#F7F5F0]"
                      : "text-[#596155] hover:text-[#121710]"
                  }`}
                >
                  Quick Weight Slider
                </button>
                <button
                  onClick={() => {
                    setIsUsingBin(true);
                    if (binWeight === 0) {
                      // Seed with one kitchen wet waste by default for illustration
                      setBinQuantities({ "item-kitchen-wet": 1 });
                    }
                  }}
                  className={`flex-1 py-3 text-sm font-medium transition-all ${
                    isUsingBin
                      ? "bg-[#284226] text-[#F7F5F0]"
                      : "text-[#596155] hover:text-[#121710]"
                  }`}
                >
                  Item-by-Item Estimator
                </button>
              </div>

              {!isUsingBin ? (
                /* SLIDER METHOD */
                <div className="space-y-8 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono-label text-[10px] text-[#596155]">drag to estimate</p>
                      <h3 className="text-xl font-bold font-display mt-1">Estimate by total load</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black font-display text-[#284226]">{sliderWeight}</span>
                      <span className="text-sm font-mono-label text-[#596155]">KG</span>
                    </div>
                  </div>

                  <div className="relative pt-6 pb-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={sliderWeight}
                      onChange={(e) => {
                        setIsUsingBin(false);
                        setSliderWeight(Number(e.target.value));
                      }}
                      className="w-full h-1 bg-[#D1CDBC] rounded-lg appearance-none cursor-pointer accent-[#284226]"
                    />
                    <div className="flex justify-between text-[10px] font-mono-label text-[#596155] mt-4">
                      <span>1 KG</span>
                      <span>10 KG</span>
                      <span>25 KG</span>
                      <span>50 KG</span>
                      <span>100 KG</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-[#F7F5F0] border border-[#D1CDBC] flex gap-3 items-start">
                    <Info size={16} className="text-[#284226] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#121710]">
                        Standard household reference:
                      </p>
                      <p className="text-xs text-[#596155] mt-1 leading-relaxed">
                        A typical family of four discards about 12-18 kg of segregated dry and organic waste weekly.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ITEM ESTIMATOR METHOD */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono-label text-[10px] text-[#596155]">select and add items</p>
                      <h3 className="text-xl font-bold font-display mt-1">Build a virtual trash bin</h3>
                    </div>
                    {binWeight > 0 && (
                      <button
                        onClick={clearBin}
                        className="flex items-center gap-1 text-xs text-[#C45B38] hover:text-[#A64A2B] font-medium transition-colors"
                      >
                        <Trash2 size={12} />
                        Clear Bin
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {ESTIMATOR_ITEMS.map((item) => {
                      const qty = binQuantities[item.id] || 0;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-sm border transition-all ${
                            qty > 0
                              ? "border-[#284226] bg-[#284226]/5"
                              : "border-[#D1CDBC] bg-white hover:border-[#121710]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl" role="img" aria-label={item.name}>
                              {item.icon}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-[#121710] leading-snug">
                                {item.name}
                              </p>
                              <p className="text-[10px] font-mono-label text-[#596155] mt-0.5">
                                ~{item.weight} kg · {item.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {qty > 0 ? (
                              <>
                                <button
                                  onClick={() => adjustBinQty(item.id, -1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full border border-[#D1CDBC] bg-white text-[#121710] hover:bg-[#EDE9DC] transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-4 text-center font-mono-label text-sm text-[#121710] font-bold">
                                  {qty}
                                </span>
                              </>
                            ) : null}
                            <button
                              onClick={() => adjustBinQty(item.id, 1)}
                              className={`w-7 h-7 flex items-center justify-center rounded-full border transition-all ${
                                qty > 0
                                  ? "border-[#284226] bg-[#284226] text-[#F7F5F0] hover:bg-[#1C2E1A]"
                                  : "border-[#D1CDBC] bg-white text-[#121710] hover:bg-[#EDE9DC]"
                              }`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-sm bg-[#EDE9DC] border border-[#D1CDBC]">
                    <div className="flex items-center gap-2 text-[#284226]">
                      <Scale size={16} />
                      <span className="text-xs font-mono-label font-bold uppercase tracking-wider">
                        Virtual Bin Weight
                      </span>
                    </div>
                    <p className="text-lg font-bold font-display">
                      ~{binWeight.toFixed(1)} kg
                    </p>
                  </div>
                </div>
              )}
            </SectionReveal>
          </div>

          {/* RIGHT: REAL-TIME BILLING RECEIPT */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <SectionReveal className="bg-[#171A15] text-[#F7F5F0] border border-[#284226] rounded-sm p-8 shadow-xl relative overflow-hidden">
              {/* Background texture overlay */}
              <div
                className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.5'/></svg>")`,
                }}
              />

              <div className="relative z-10 space-y-6">
                <div>
                  <span className="rounded-sm bg-[#C45B38] px-2 py-0.5 font-mono-label text-[9px] text-[#F7F5F0] tracking-wider">
                    {isUsingBin ? "itemized estimate" : "manual estimation"}
                  </span>
                  <p className="mt-4 text-xs font-mono-label text-[#F7F5F0]/60">ESTIMATED WEIGHT</p>
                  <p className="text-3xl font-display font-black tracking-tight mt-1">
                    ~{activeWeight.toFixed(1)} kg
                  </p>
                </div>

                <div className="border-t border-[#F7F5F0]/10 pt-6">
                  <p className="text-xs font-mono-label text-[#F7F5F0]/60">CORRESPONDING TIER</p>
                  <h4 className="text-xl font-bold font-display text-[#C45B38] mt-1">
                    {activeTier.label} Bracket
                  </h4>
                  <p className="text-xs text-[#F7F5F0]/70 mt-1 italic leading-relaxed">
                    &ldquo;{activeTier.bestFor}&rdquo;
                  </p>
                </div>

                <div className="border-t border-[#F7F5F0]/10 pt-6 flex justify-between items-end">
                  <div>
                    <p className="text-xs font-mono-label text-[#F7F5F0]/60">PICKUP RATE</p>
                    <p className="text-xs text-[#F7F5F0]/50 mt-1">
                      (Approx. ₹{(activeTier.price / (activeTier.maxWeight || 10)).toFixed(2)}/kg)
                    </p>
                  </div>
                  <p className="text-5xl font-display font-black tracking-tighter text-[#F7F5F0]">
                    ₹{activeTier.price}/-
                  </p>
                </div>

                <div className="border-t border-[#F7F5F0]/10 pt-6 space-y-3">
                  <div className="flex gap-2 items-center text-xs text-[#F7F5F0]/80">
                    <Check size={14} className="text-[#C45B38]" />
                    <span>In-person digital weighing at your door</span>
                  </div>
                  <div className="flex gap-2 items-center text-xs text-[#F7F5F0]/80">
                    <Check size={14} className="text-[#C45B38]" />
                    <span>100% Segregated green recycling channel</span>
                  </div>
                  <div className="flex gap-2 items-center text-xs text-[#F7F5F0]/80">
                    <Check size={14} className="text-[#C45B38]" />
                    <span>Zero carbon logistics via electric fleet</span>
                  </div>
                </div>

                <Link
                  href="https://customer.bincycle.in/book-pickup"
                  data-testid="calculator-cta-book"
                  className="w-full mt-8 inline-flex items-center justify-center gap-2 rounded-sm bg-[#C45B38] px-5 py-4 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B] transition-colors"
                >
                  Book this weight tier
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </SectionReveal>
          </div>

        </div>
      </section>

      {/* FULL PRICING BRACKET TABLE */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 mt-24">
        <SectionReveal>
          <p className="font-mono-label text-xs text-[#596155]">[ tier sheet ]</p>
          <h2 className="mt-4 font-display font-black tracking-tighter text-3xl sm:text-4xl text-[#121710]">
            Complete rate card by weight
          </h2>
          <p className="mt-2 text-sm text-[#596155] max-w-xl leading-relaxed">
            No flat fees. Below is the full official bracket distribution. The system automatically highlights the row corresponding to your simulated weight above.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="mt-8 overflow-x-auto rounded-sm border border-[#D1CDBC]">
            <table className="w-full text-sm">
              <thead className="bg-[#EDE9DC] border-b border-[#D1CDBC]">
                <tr>
                  <th className="text-left p-4 font-mono-label text-xs text-[#596155]">Weight Range</th>
                  <th className="text-left p-4 font-mono-label text-xs text-[#596155]">Rate (INR)</th>
                  <th className="text-left p-4 font-mono-label text-xs text-[#596155]">Common Reference</th>
                  <th className="text-left p-4 font-mono-label text-xs text-[#596155] hidden md:table-cell">Ideal For</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_TIERS.map((tier) => {
                  const isHighlighted = activeTier.id === tier.id;
                  return (
                    <tr
                      key={tier.id}
                      className={`border-b border-[#D1CDBC]/50 transition-all ${
                        isHighlighted
                          ? "bg-[#284226] text-[#F7F5F0] font-semibold"
                          : "bg-white hover:bg-[#F7F5F0]/50"
                      }`}
                    >
                      <td className="p-4 font-mono-label text-sm tracking-normal">
                        {tier.label}
                      </td>
                      <td className="p-4 font-display text-base font-black">
                        ₹{tier.price}/-
                      </td>
                      <td className={`p-4 text-xs ${isHighlighted ? "text-[#F7F5F0]/90" : "text-[#596155]"}`}>
                        {tier.bestFor}
                      </td>
                      <td className={`p-4 text-xs hidden md:table-cell ${isHighlighted ? "text-[#F7F5F0]/85" : "text-[#596155]"}`}>
                        {tier.comparison}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionReveal>
      </section>

      {/* WEIGHING POLICY / FAQS */}
      <section className="mx-auto max-w-4xl px-5 sm:px-8 mt-24">
        <SectionReveal>
          <div className="flex gap-2 items-center text-[#284226]">
            <ShieldCheck size={18} />
            <p className="font-mono-label text-xs text-[#596155]">[ doorstep weighing guarantee ]</p>
          </div>
          <h2 className="mt-4 font-display font-black tracking-tighter text-3xl sm:text-4xl text-[#121710]">
            Fair weight, transparent checks
          </h2>
          <p className="mt-2 text-[#596155] text-sm leading-relaxed">
            Waste management shouldn't involve guessing or hidden surcharges. Here is how we enforce our weighing process at your doorstep.
          </p>
        </SectionReveal>

        <div className="mt-8 space-y-3">
          {FAQs.map((faq, index) => {
            const isExpanded = !!expandedFaqs[index];
            return (
              <SectionReveal
                key={index}
                delay={index * 0.05}
                className="rounded-sm border border-[#D1CDBC] bg-white transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[#F7F5F0]/30 transition-colors"
                >
                  <p className="font-display text-base sm:text-lg font-bold text-[#121710]">
                    {faq.q}
                  </p>
                  <ChevronDown
                    size={18}
                    className={`text-[#596155] transition-transform duration-300 shrink-0 ml-4 ${
                      isExpanded ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-[300px] border-t border-[#D1CDBC]/45" : "max-h-0"
                  } overflow-hidden`}
                >
                  <p className="p-6 text-sm text-[#596155] leading-relaxed bg-[#F7F5F0]/20">
                    {faq.a}
                  </p>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </section>

      {/* DOCK BACK TO MAIN PRICING */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 mt-24">
        <SectionReveal className="bg-[#EDE9DC] border border-[#D1CDBC] rounded-sm p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-black text-2xl text-[#121710] tracking-tight">
              Looking for a fixed subscription?
            </h3>
            <p className="mt-2 text-sm text-[#596155] max-w-xl leading-relaxed">
              If you have recurrent daily trash pickups, save more by subscribing to our Pro or Max monthly plans with set weight thresholds.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-sm border border-[#121710] px-6 py-3.5 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors shrink-0"
          >
            Compare subscription plans
          </Link>
        </SectionReveal>
      </section>
    </div>
  );
};

export default GuideClient;
