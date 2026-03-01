import { redirect } from "next/navigation";
import { blogUrl } from "@/lib/site-urls";

export default function BlogPage() {
  redirect(blogUrl);
}
