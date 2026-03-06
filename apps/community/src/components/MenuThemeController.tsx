"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ChevronDown, ChevronRight, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@codebay/ui";

export const PRIMARY_COLOR_STORAGE_KEY = "codebay-primary-color";

export type ThemeOption = "light" | "dark" | "system";

const themeOptions: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export type PrimaryColorId = "orange" | "blue" | "red" | "green" | "yellow" | "purple";

const primaryColors: { id: PrimaryColorId; label: string; hsl: string }[] = [
  { id: "orange", label: "Orange", hsl: "24 95% 53%" },
  { id: "blue", label: "Blue", hsl: "217 91% 60%" },
  { id: "red", label: "Red", hsl: "0 84% 60%" },
  { id: "green", label: "Green", hsl: "142 71% 45%" },
  { id: "yellow", label: "Yellow", hsl: "45 93% 47%" },
  { id: "purple", label: "Purple", hsl: "262 83% 58%" },
];

function setPrimaryColorOnDocument(colorId: PrimaryColorId | null) {
  const root = document.documentElement;
  if (colorId) {
    root.setAttribute("data-primary", colorId);
  } else {
    root.removeAttribute("data-primary");
  }
}

function getStoredPrimaryColor(): PrimaryColorId | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PRIMARY_COLOR_STORAGE_KEY);
  if (raw && primaryColors.some((c) => c.id === raw)) return raw as PrimaryColorId;
  return null;
}

export function MenuThemeController() {
  const { theme, setTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [primaryColor, setPrimaryColorState] = useState<PrimaryColorId | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredPrimaryColor();
    setPrimaryColorState(stored);
    setPrimaryColorOnDocument(stored);
  }, []);

  const setPrimaryColor = (colorId: PrimaryColorId | null) => {
    setPrimaryColorState(colorId);
    if (typeof window !== "undefined") {
      if (colorId) {
        window.localStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, colorId);
      } else {
        window.localStorage.removeItem(PRIMARY_COLOR_STORAGE_KEY);
      }
    }
    setPrimaryColorOnDocument(colorId);
  };

  if (!mounted) {
    return (
      <div>
        <div className="h-10 animate-pulse rounded-md bg-muted/60" />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
        aria-expanded={expanded}
      >
        <span>Theme</span>
        <span className="flex shrink-0 text-muted-foreground transition-transform duration-200 ease-out" aria-hidden>
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      </button>
      <div
        className={
          "grid transition-[grid-template-rows] duration-200 ease-out " +
          (expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
        }
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 pl-2 pt-0.5 pb-1">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Appearance
              </span>
              <div className="flex gap-1">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={theme === value ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTheme(value)}
                    className="flex-1 gap-1 text-xs"
                    title={label}
                    aria-pressed={theme === value}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Primary color
              </span>
              <div className="flex flex-wrap gap-1.5">
                {primaryColors.map(({ id, label, hsl }) => {
                  const isActive = primaryColor === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPrimaryColor(isActive ? null : id)}
                      title={label}
                      aria-label={`Primary color: ${label}${isActive ? " (selected)" : ""}`}
                      aria-pressed={isActive}
                      className={
                        "h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
                        (isActive
                          ? "border-foreground/80 ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
                          : "border-border/80 hover:border-foreground/50")
                      }
                      style={{ backgroundColor: `hsl(${hsl})` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
