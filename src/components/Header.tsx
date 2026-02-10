import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import codebayLogo from "@/assets/codebay-logo.svg";
import DesktopNav from "@/components/DesktopNav";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeaderProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

const Header = ({ activeSection, onSectionChange }: HeaderProps) => {
  const [mobileIndicatorStyle, setMobileIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const mobileNavWrapperRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const navLinks: { label: string; section: SectionType }[] = [
    { label: "Solutions", section: "solutions" },
    { label: "Products", section: "products" },
    { label: "Resources", section: "resources" },
    { label: "About", section: "about-us" },
  ];

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

  const updateMobileNavOffset = useCallback(() => {
    const root = document.documentElement;

    if (window.innerWidth >= 768) {
      root.style.setProperty("--mobile-nav-offset", "0px");
      return;
    }

    const navHeight = mobileNavWrapperRef.current?.getBoundingClientRect().height ?? 0;
    // Add a small buffer so section content never touches the nav.
    root.style.setProperty("--mobile-nav-offset", `${Math.ceil(navHeight + 8)}px`);
  }, []);

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

  useEffect(() => {
    updateMobileNavOffset();

    window.addEventListener("resize", updateMobileNavOffset);
    window.addEventListener("orientationchange", updateMobileNavOffset);
    window.visualViewport?.addEventListener("resize", updateMobileNavOffset);
    window.visualViewport?.addEventListener("scroll", updateMobileNavOffset);

    return () => {
      window.removeEventListener("resize", updateMobileNavOffset);
      window.removeEventListener("orientationchange", updateMobileNavOffset);
      window.visualViewport?.removeEventListener("resize", updateMobileNavOffset);
      window.visualViewport?.removeEventListener("scroll", updateMobileNavOffset);
      document.documentElement.style.setProperty("--mobile-nav-offset", "0px");
    };
  }, [updateMobileNavOffset]);

  const handleNavClick = (section: SectionType) => {
    onSectionChange(section);
  };

  return (
    <>
      {/* Top Header - Logo only on mobile, full header on desktop */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12 bg-background/95 backdrop-blur-md md:bg-transparent md:backdrop-blur-none">
        <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Logo */}
          <button
            onClick={() => onSectionChange("home")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity justify-self-start"
          >
            <img
              src={codebayLogo}
              alt="CodeBay"
              className="h-8 md:h-10 w-auto invert"
            />
          </button>

          <DesktopNav
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            navLinks={navLinks}
          />

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2 justify-self-end">
            <button className="gradient-btn px-5 py-2.5 rounded-full text-sm font-medium text-primary-foreground">
              Get Started
            </button>
            <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Fixed at bottom */}
      <nav ref={mobileNavWrapperRef} className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-3">
        <div className="max-w-7xl mx-auto">
          <div ref={mobileNavRef} className="liquid-glass-nav relative rounded-full px-2 py-1.5">
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
