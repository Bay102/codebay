import type { Metadata } from "next";
import AdminView from "@/views/AdminView";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLeadsPage() {
  return <AdminView />;
}
