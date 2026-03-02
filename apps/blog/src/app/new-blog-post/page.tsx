import type { Metadata } from "next";

import UserBlogCreation from "@/components/pages/blog/UserBlogCreation";

export const metadata: Metadata = {
  title: "New blog post",
  description: "Draft and publish new posts for the CodingBay blog."
};

export default function NewBlogPostPage() {
  return <UserBlogCreation />;
}

