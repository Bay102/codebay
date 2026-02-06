import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = ["Solutions", "Products", "Resources", "About Us"];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <span className="text-foreground font-display font-semibold text-xl">
            Nexora
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <div className="glass-nav rounded-full px-2 py-2">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(" ", "-")}`}
                    className="px-5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50"
                  >
                    {link}
                  </a>
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
        <div className="md:hidden absolute top-full left-0 right-0 glass-nav mt-2 mx-6 rounded-2xl p-6">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(" ", "-")}`}
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
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
