import { redirect } from "next/navigation";
import { communityUrl } from "@/lib/site-urls";

export default async function CommunityDashboardPage() {
  redirect(`${communityUrl}/dashboard`);
}
