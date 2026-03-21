import type { Metadata } from "next";
import { AboutPageView } from "@/components/pages/about/AboutPageView";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn what CodingBay Community is: discussions, creator blogs, profiles, and follow-based digests—one place to stay current on the tech you care about."
};

export default function AboutPage() {
  return <AboutPageView />;
}
