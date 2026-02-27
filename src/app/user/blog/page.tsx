import type { Metadata } from "next";
import UserBlogCreation from "@/views/UserBlogCreation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  },
  title: "Your Blog Posts | CodeBay"
};

export default function UserBlogPage() {
  return <UserBlogCreation />;
}

