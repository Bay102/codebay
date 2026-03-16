import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { communityUrl } from "@/lib/site-urls";

export const metadata: Metadata = {
  title: "CodingBay Blog has moved",
  description: "The CodingBay blog now lives inside the community app."
};

export default function LegacyBlogHomeRedirectPage() {
  redirect(`${communityUrl}/blog`);
}
