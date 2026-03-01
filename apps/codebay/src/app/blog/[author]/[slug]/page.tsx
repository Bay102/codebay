import { redirect } from "next/navigation";
import { blogUrl } from "@/lib/site-urls";

type BlogPostPageProps = {
  params: Promise<{
    author: string;
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { author, slug } = await params;
  redirect(`${blogUrl}/${author}/${slug}`);
}

