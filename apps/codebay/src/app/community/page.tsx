import { redirect } from "next/navigation";
import { communityUrl } from "@/lib/site-urls";

export default function CommunityLandingPage() {
  redirect(communityUrl);
}
