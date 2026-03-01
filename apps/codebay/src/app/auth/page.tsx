import { redirect } from "next/navigation";
import { communityUrl } from "@/lib/site-urls";

export default function AuthPage() {
  redirect(`${communityUrl}/join`);
}
