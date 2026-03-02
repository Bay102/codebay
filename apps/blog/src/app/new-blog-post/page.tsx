import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { communityUrl } from "@/lib/site-urls";

export const metadata: Metadata = {
  title: "New blog post",
  description: "Blog authoring now happens in the community dashboard."
};

export default function NewBlogPostPage() {
  redirect(`${communityUrl}/dashboard/blog/new`);
}

