import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Settings, Sun, Moon, Monitor, Sparkles } from "lucide-react";
import Hero from "@/components/pages/home/Hero";
import { Button } from "@/components/ui/button";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HomeSectionControllerProps {
  activeSection: SectionType;
  direction: number;
}

const EFFECTS_STORAGE_KEY = "codebay.effects-enabled";

type ThemeOption = "light" | "dark" | "system";

const themeOptions: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const HomeSectionController = ({ activeSection, direction }: HomeSectionControllerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(EFFECTS_STORAGE_KEY) !== "false";
  });

  useEffect(() => {
    window.localStorage.setItem(EFFECTS_STORAGE_KEY, String(effectsEnabled));
    document.documentElement.dataset.devEffects = effectsEnabled ? "rich" : "lite";

    return () => {
      delete document.documentElement.dataset.devEffects;
    };
  }, [effectsEnabled]);

  return (
    <>
      <Hero activeSection={activeSection} direction={direction} />

      <div className="fixed right-4 bottom-3 z-[60] flex flex-col items-end gap-2">
        {isOpen && (
          <div className="flex animate-in slide-in-from-bottom-2 fade-in duration-200 flex-col gap-3 rounded-xl border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur-sm min-w-[180px]">
            {/* Theme selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                Theme
              </span>
              <div className="flex gap-1">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={theme === value ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTheme(value)}
                    className="flex-1 gap-1.5 text-xs"
                    title={label}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* Display options */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                Display
              </span>
              <Button
                type="button"
                variant={effectsEnabled ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setEffectsEnabled((prev) => !prev)}
                className="justify-start gap-2 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {effectsEnabled ? "Effects On" : "Effects Off"}
              </Button>
            </div>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-6 w-6 rounded-full bg-background/95 shadow-lg backdrop-blur-sm"
          aria-label={isOpen ? "Close settings" : "Open settings"}
          title={isOpen ? "Close settings" : "Open settings"}
        >
          <Settings className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
        </Button>
      </div>
    </>
  );
};

export default HomeSectionController;
