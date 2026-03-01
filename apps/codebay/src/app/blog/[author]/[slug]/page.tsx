import { redirect } from "next/navigation";

type BlogPostPageProps = {
  params: Promise<{
    author: string;
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { author, slug } = await params;
  redirect(`https://codingbay.blog/${author}/${slug}`);
}

