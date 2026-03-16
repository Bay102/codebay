import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { communityUrl } from "@/lib/site-urls";

export const dynamic = "force-dynamic";

type AuthorPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { username } = await params;

  return {
    title: "Author page has moved",
    description: "Author blog pages now live inside the CodingBay community app.",
    alternates: {
      canonical: `/blog/${username}`
    }
  };
}

export default async function LegacyAuthorRedirectPage({ params }: AuthorPageProps) {
  const { username } = await params;
  redirect(`${communityUrl}/blog/${encodeURIComponent(username)}`);
}
