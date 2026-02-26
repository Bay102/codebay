import type { Metadata } from "next";
import AdminBlogView from "@/views/AdminBlogView";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  },
  title: "Admin Blog | CodeBay"
};

export default function AdminBlogPage() {
  return <AdminBlogView />;
}

