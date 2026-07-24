import type { Metadata } from "next";
import Image from "next/image";
import { PauseCircle } from "lucide-react";
import codebayLogo from "@/assets/codebay-logo.svg";
import TechBackground from "@/components/pages/home/TechBackground";

export const metadata: Metadata = {
  title: "Temporarily Unavailable",
  description:
    "CodeBay is not accepting new inquiries at the moment. Please check back soon.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PausedPage() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <TechBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <Image
          src={codebayLogo}
          alt="CodeBay"
          width={160}
          height={40}
          className="mb-10 h-8 w-auto dark:invert sm:h-10"
          priority
        />

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-background/70 shadow-sm backdrop-blur-sm">
          <PauseCircle className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>

        <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          We&apos;re taking a short break
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          CodeBay isn&apos;t accepting new inquiries right now. Thanks for your interest — we&apos;ll
          be back when we&apos;re ready to take on new work.
        </p>
      </div>
    </main>
  );
}
