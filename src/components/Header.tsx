import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import codebayLogo from "@/assets/codebay-logo.svg";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HeaderProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

const Header = ({ activeSection, onSectionChange }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

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

  useEffect(() => {
    updateIndicator();
    const handleResize = () => updateIndicator();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator]);

  const handleNavClick = (section: SectionType) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false);
  };

  return (
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
              {navLinks.map((link) => (
                <li key={link.section}>
                  <button
                    ref={(el) => {
                      if (el) buttonRefs.current.set(link.section, el);
                    }}
                    onClick={() => handleNavClick(link.section)}
                    className={`px-5 py-2 text-sm transition-all duration-300 rounded-full relative z-10 ${
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 liquid-glass-nav mt-2 mx-6 rounded-2xl p-6">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.section}
                onClick={() => handleNavClick(link.section)}
                className={`text-left py-2 transition-all duration-300 ${activeSection === link.section
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </button>
            ))}
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <button className="gradient-btn px-5 py-2.5 rounded-full text-sm font-medium text-primary-foreground flex-1">
                Get Started
              </button>
              <button className="icon-btn w-10 h-10 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
