"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import codebayLogo from "@/assets/codebay-logo.svg";
import { useConnectForm } from "@/contexts/ConnectFormContext";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import { blogUrl, communityUrl } from "@/lib/site-urls";

const Footer = () => {
  const year = new Date().getFullYear();
  const { openConnectForm } = useConnectForm();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 px-6 py-2.5 backdrop-blur-md md:bg-background/80 md:backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-1.5">
        <nav className="flex items-center justify-center gap-4">
          <Link
            href={blogUrl}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Blog
          </Link>
          <Link
            href={communityUrl}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Community
          </Link>
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="cursor-pointer border-0 bg-transparent p-0 font-inherit text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={openConnectForm}
            className="cursor-pointer border-0 bg-transparent p-0 font-inherit text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </button>
        </nav>

        <div className="flex items-center justify-center gap-2">
          <Image
            src={codebayLogo}
            alt="CodeBay"
            width={96}
            height={24}
            className="h-4 w-auto dark:invert"
          />
          <span className="text-[10px] text-muted-foreground">
            &copy; {year} CodeBay. All rights reserved.
          </span>
        </div>
      </div>
      <PrivacyPolicyModal open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} />
    </footer>
  );
};

export default Footer;
