"use client";
import { useState } from "react";
import Image from "next/image";
import { SiteFooter, type SiteFooterLinkItem } from "@codebay/ui";
import codebayLogo from "@/assets/codebay-logo.svg";
import { useConnectForm } from "@/contexts/ConnectFormContext";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import { blogUrl, communityUrl } from "@/lib/site-urls";

const Footer = () => {
  const { openConnectForm } = useConnectForm();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const links: SiteFooterLinkItem[] = [
    { type: "link", href: blogUrl, label: "Blog" },
    { type: "link", href: communityUrl, label: "Community" },
    { type: "button", label: "Privacy", onClick: () => setIsPrivacyOpen(true) },
    { type: "button", label: "Contact", onClick: openConnectForm }
  ];

  return (
    <>
      <SiteFooter
        legalName="CodeBay"
        links={links}
        logo={
          <Image
            src={codebayLogo}
            alt="CodeBay"
            width={96}
            height={24}
            className="h-4 w-auto dark:invert"
          />
        }
      />
      <PrivacyPolicyModal open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} />
    </>
  );
};

export default Footer;
