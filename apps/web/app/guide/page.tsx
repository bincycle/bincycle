import type { Metadata } from "next";
import GuideClient from "./GuideClient";

export const metadata: Metadata = {
  title: "Pricing Guide – Bincycle",
  description:
    "On-demand waste pickup pricing guide by weight. Estimate your waste weight using our interactive tool and see our transparent rates.",
};

export default function GuidePage() {
  return <GuideClient />;
}