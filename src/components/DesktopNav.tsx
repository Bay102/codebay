import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare } from "lucide-react";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface DesktopNavProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  navLinks: { label: string; section: SectionType }[];
}

const DesktopNav = ({ activeSection, onSectionChange, navLinks }: DesktopNavProps) => {
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

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
    const updateAfterLayout = () => {
      requestAnimationFrame(() => updateIndicator());
    };

    updateAfterLayout();

    const timeoutId = setTimeout(() => updateIndicator(), 100);
    window.addEventListener("resize", updateIndicator);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  const handleNavClick = (section: SectionType) => {
    onSectionChange(section);
  };

  const setButtonRef = (section: SectionType) => (el: HTMLButtonElement | null) => {
    if (el) {
      buttonRefs.current.set(section, el);
      requestAnimationFrame(() => {
        if (activeSection === section) updateIndicator();
      });
    }
  };

  return (
    <nav className="hidden md:flex items-center justify-self-center">
      <div ref={navRef} className="liquid-glass-nav relative rounded-full px-2 py-2">
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
                ref={setButtonRef(link.section)}
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
          <li>
            <button
              ref={setButtonRef("home")}
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
                ref={setButtonRef(link.section)}
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
  );
};

export default DesktopNav;
