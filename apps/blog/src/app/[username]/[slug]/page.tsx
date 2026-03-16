import type { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";
import { communityUrl } from "@/lib/site-urls";

export const dynamic = "force-dynamic";

type BlogPostPageParams = {
  username: string;
  slug: string;
};

type BlogPostPageProps = {
  params: Promise<BlogPostPageParams>;
};

export async function generateMetadata(
  { params }: BlogPostPageProps,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { username, slug } = await params;

  return {
    title: "Blog post has moved",
    description: "Blog posts now live inside the CodingBay community app.",
    alternates: {
      canonical: `/blog/${username}/${slug}`
    }
  };
}

export default async function LegacyBlogPostRedirectPage({ params }: BlogPostPageProps) {
  const { username, slug } = await params;
  redirect(`${communityUrl}/blog/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`);
}
