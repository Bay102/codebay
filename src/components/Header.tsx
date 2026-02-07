import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import codebayLogo from "@/assets/codebay-logo.svg";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeaderProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

const Header = ({ activeSection, onSectionChange }: HeaderProps) => {
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [mobileIndicatorStyle, setMobileIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const mobileButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const navLinks: { label: string; section: SectionType }[] = [
    { label: "Solutions", section: "solutions" },
    { label: "Products", section: "products" },
    { label: "Resources", section: "resources" },
    { label: "About Us", section: "about-us" },
  ];

  const updateIndicator = useCallback(() => {
    const activeButton = buttonRefs.current.get(activeSection);
    const navContainer = navRef.current;
    
    if (activeButton && navContainer) {
      const navRect = navContainer.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setIndicatorStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeSection]);

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
    // Use requestAnimationFrame to ensure DOM is fully laid out before calculating positions
    const updateAfterLayout = () => {
      requestAnimationFrame(() => {
        updateIndicator();
        updateMobileIndicator();
      });
    };
    
    // Initial update after layout
    updateAfterLayout();
    
    // Also update after a short delay to catch any late layout changes
    const timeoutId = setTimeout(() => {
      updateIndicator();
      updateMobileIndicator();
    }, 100);
    
    const handleResize = () => {
      updateIndicator();
      updateMobileIndicator();
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateIndicator, updateMobileIndicator]);

  const handleNavClick = (section: SectionType) => {
    onSectionChange(section);
  };

  return (
    <>
      {/* Top Header - Logo only on mobile, full header on desktop */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onSectionChange("home")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={codebayLogo}
              alt="CodeBay"
              className="h-8 md:h-10 w-auto invert"
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <div ref={navRef} className="liquid-glass-nav relative rounded-full px-2 py-2">
              {/* Sliding indicator */}
              <div
                className="liquid-indicator absolute top-2 bottom-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                }}
              />
              <ul className="flex items-center gap-1 relative z-10">
                {navLinks.slice(0, 2).map((link) => (
                  <li key={link.section}>
                    <button
                      ref={(el) => {
                        if (el) {
                          buttonRefs.current.set(link.section, el);
                          // Trigger update after ref is set
                          requestAnimationFrame(() => {
                            if (activeSection === link.section) {
                              updateIndicator();
                            }
                          });
                        }
                      }}
                      onClick={() => handleNavClick(link.section)}
                      className={`px-5 py-2 text-sm transition-all duration-300 rounded-full relative z-10 flex items-center justify-center text-center ${
                        activeSection === link.section
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
                        buttonRefs.current.set("home", el);
                        // Trigger update after ref is set
                        requestAnimationFrame(() => {
                          if (activeSection === "home") {
                            updateIndicator();
                          }
                        });
                      }
                    }}
                    onClick={() => handleNavClick("home")}
                    className={`px-3 py-2 text-sm transition-all duration-300 rounded-full relative z-10 flex items-center justify-center ${
                      activeSection === "home"
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="AI Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </li>
                {navLinks.slice(2).map((link) => (
                  <li key={link.section}>
                    <button
                      ref={(el) => {
                        if (el) {
                          buttonRefs.current.set(link.section, el);
                          // Trigger update after ref is set
                          requestAnimationFrame(() => {
                            if (activeSection === link.section) {
                              updateIndicator();
                            }
                          });
                        }
                      }}
                      onClick={() => handleNavClick(link.section)}
                      className={`px-5 py-2 text-sm transition-all duration-300 rounded-full relative z-10 flex items-center justify-center text-center ${
                        activeSection === link.section
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
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          <div ref={mobileNavRef} className="liquid-glass-nav relative rounded-full px-2 py-2">
            {/* Sliding indicator */}
            <div
              className="liquid-indicator absolute top-2 bottom-2 rounded-full transition-all duration-500 ease-out"
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
                    className={`w-full px-3 py-2 text-xs transition-all duration-300 rounded-full relative z-10 flex items-center justify-center text-center ${
                      activeSection === link.section
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
                  className={`px-3 py-2 text-xs transition-all duration-300 rounded-full relative z-10 flex items-center justify-center ${
                    activeSection === "home"
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="AI Chat"
                >
                  <MessageSquare className="w-4 h-4" />
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
                    className={`w-full px-3 py-2 text-xs transition-all duration-300 rounded-full relative z-10 flex items-center justify-center text-center ${
                      activeSection === link.section
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
