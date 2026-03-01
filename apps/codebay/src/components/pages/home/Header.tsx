import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
import codebayLogo from "@/assets/codebay-logo.svg";
import DesktopNav from "@/components/pages/home/DesktopNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConnectForm } from "@/contexts/ConnectFormContext";
import { useAuth } from "@/contexts/AuthContext";
import { blogUrl, communityUrl } from "@/lib/site-urls";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeaderProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

const Header = ({ activeSection, onSectionChange }: HeaderProps) => {
  const { openConnectForm } = useConnectForm();
  const [mobileIndicatorStyle, setMobileIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const navLinks: { label: string; section: SectionType }[] = [
    { label: "About", section: "about-us" },
    { label: "Solutions", section: "solutions" },
    { label: "Products", section: "products" },
    { label: "Resources", section: "resources" },
  ];

  const { session } = useAuth();

  const updateMobileIndicator = useCallback(() => {
    const activeButton = mobileButtonRefs.current.get(activeSection);
    const navContainer = mobileNavRef.current;

    if (activeButton && navContainer) {
      const navRect = navContainer.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setMobileIndicatorStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeSection]);

  useEffect(() => {
    const updateAfterLayout = () => {
      requestAnimationFrame(() => updateMobileIndicator());
    };

    updateAfterLayout();

    const timeoutId = setTimeout(() => updateMobileIndicator(), 100);
    window.addEventListener("resize", updateMobileIndicator);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateMobileIndicator);
    };
  }, [updateMobileIndicator]);

  const handleNavClick = (section: SectionType) => {
    onSectionChange(section);
  };

  return (
    <>
      {/* Top Header - Logo, section nav, hamburger in one row */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 lg:px-12 bg-background/95 backdrop-blur-md md:bg-background/80 md:backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between md:justify-normal">
          {/* Logo */}
          <button
            onClick={() => onSectionChange("home")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity justify-self-start"
          >
            <Image
              src={codebayLogo}
              alt="CodeBay"
              width={160}
              height={40}
              className="h-8 w-auto dark:invert md:h-10"
            />
          </button>

          <DesktopNav
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            navLinks={navLinks}
          />

          {/* Header Actions - Hamburger menu */}
          <div className="flex items-center justify-end gap-2 justify-self-end md:col-start-3">
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
                  <Link href={blogUrl}>Blog</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={communityUrl}>Community</Link>
                </DropdownMenuItem>
                {session && (
                  <DropdownMenuItem asChild>
                    <Link href={`${communityUrl}/dashboard`}>Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {(!session) && (
                  <DropdownMenuItem asChild>
                    <Link href={`${communityUrl}/join`}>Account</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={openConnectForm}>Inquire</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Fixed below header */}
      <nav className="fixed top-16 left-0 right-0 z-50 md:hidden">
        <div className="max-w-7xl mx-auto">
          <div ref={mobileNavRef} className="liquid-glass-nav relative px-2 py-1.5 md:rounded-full">
            {/* Sliding indicator */}
            <div
              className="liquid-indicator absolute top-1.5 bottom-1.5 rounded-full transition-all duration-500 ease-out"
              style={{
                left: `${mobileIndicatorStyle.left}px`,
                width: `${mobileIndicatorStyle.width}px`,
              }}
            />
            <ul className="flex items-center gap-1 relative z-10">
              {navLinks.slice(0, 2).map((link) => (
                <li key={link.section} className="flex-1">
                  <button
                    ref={(el) => {
                      if (el) {
                        mobileButtonRefs.current.set(link.section, el);
                        // Trigger update after ref is set
                        requestAnimationFrame(() => {
                          if (activeSection === link.section) {
                            updateMobileIndicator();
                          }
                        });
                      }
                    }}
                    onClick={() => handleNavClick(link.section)}
                    className={`w-full px-3 py-1.5 text-xs transition-all duration-300 rounded-full relative z-10 flex items-center justify-center text-center ${activeSection === link.section
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              {/* Home/AI Chat Icon Button - Positioned in the middle */}
              <li>
                <button
                  ref={(el) => {
                    if (el) {
                      mobileButtonRefs.current.set("home", el);
                      // Trigger update after ref is set
                      requestAnimationFrame(() => {
                        if (activeSection === "home") {
                          updateMobileIndicator();
                        }
                      });
                    }
                  }}
                  onClick={() => handleNavClick("home")}
                  className={`px-3 py-1.5 text-xs transition-all duration-300 rounded-full relative z-10 flex items-center justify-center ${activeSection === "home"
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  title="AI Chat"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </li>
              {navLinks.slice(2).map((link) => (
                <li key={link.section} className="flex-1">
                  <button
                    ref={(el) => {
                      if (el) {
                        mobileButtonRefs.current.set(link.section, el);
                        // Trigger update after ref is set
                        requestAnimationFrame(() => {
                          if (activeSection === link.section) {
                            updateMobileIndicator();
                          }
                        });
                      }
                    }}
                    onClick={() => handleNavClick(link.section)}
                    className={`w-full px-3 py-1.5 text-xs transition-all duration-300 rounded-full relative z-10 flex items-center justify-center text-center ${activeSection === link.section
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
