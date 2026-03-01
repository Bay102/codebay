"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import codebayLogo from "@/assets/codebay-logo.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConnectForm } from "@/contexts/ConnectFormContext";
import { useAuth } from "@/contexts/AuthContext";

export function SiteHeader() {
  const { openConnectForm } = useConnectForm();
  const { session } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 lg:px-12 bg-background/95 backdrop-blur-md md:bg-background/80 md:backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            src={codebayLogo}
            alt="CodeBay"
            width={160}
            height={40}
            className="h-8 w-auto dark:invert md:h-10"
          />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open header menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/60 text-foreground transition-colors hover:bg-secondary/70"
            >
              <Menu className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link href="https://codingbay.blog">Blog</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="https://codingbay.community">Community</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={openConnectForm}>Inquire</DropdownMenuItem>
            {session && (
              <DropdownMenuItem asChild>
                <Link href="https://codingbay.community/dashboard">Dashboard</Link>
              </DropdownMenuItem>
            )}
            {(!session) && (
              <DropdownMenuItem asChild>
                <Link href="https://codingbay.community/join">Account</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
