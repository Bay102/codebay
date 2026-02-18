import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";

type SectionType = "home" | "solutions" | "products" | "resources" | "about-us";

interface HomeHeroControllerProps {
  activeSection: SectionType;
  direction: number;
}

const DEV_VIDEO_BG_STORAGE_KEY = "codebay.dev.video-bg-enabled";
const DEV_EFFECTS_STORAGE_KEY = "codebay.dev.effects-enabled";
const IS_DEV = import.meta.env.DEV;

const HomeHeroController = ({ activeSection, direction }: HomeHeroControllerProps) => {
  const [videoEnabled, setVideoEnabled] = useState<boolean>(() => {
    if (!IS_DEV || typeof window === "undefined") return true;
    return window.localStorage.getItem(DEV_VIDEO_BG_STORAGE_KEY) !== "false";
  });
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    if (!IS_DEV || typeof window === "undefined") return true;
    return window.localStorage.getItem(DEV_EFFECTS_STORAGE_KEY) !== "false";
  });

  useEffect(() => {
    if (!IS_DEV) return;

    window.localStorage.setItem(DEV_VIDEO_BG_STORAGE_KEY, String(videoEnabled));
  }, [videoEnabled]);

  useEffect(() => {
    if (!IS_DEV) return;

    window.localStorage.setItem(DEV_EFFECTS_STORAGE_KEY, String(effectsEnabled));
    document.documentElement.dataset.devEffects = effectsEnabled ? "rich" : "lite";

    return () => {
      delete document.documentElement.dataset.devEffects;
    };
  }, [effectsEnabled]);

  return (
    <>
      <Hero activeSection={activeSection} direction={direction} videoEnabled={videoEnabled} />
      {IS_DEV && (
        <div className="fixed right-4 bottom-4 z-[60] flex flex-col gap-2">
          <Button
            type="button"
            variant={effectsEnabled ? "secondary" : "outline"}
            size="sm"
            onClick={() => setEffectsEnabled((prev) => !prev)}
            className="shadow-lg"
          >
            {effectsEnabled ? "Dev: Effects Rich" : "Dev: Effects Lite"}
          </Button>
          <Button
            type="button"
            variant={videoEnabled ? "secondary" : "outline"}
            size="sm"
            onClick={() => setVideoEnabled((prev) => !prev)}
            className="shadow-lg"
          >
            {videoEnabled ? "Dev: Video BG On" : "Dev: Video BG Off"}
          </Button>
        </div>
      )}
    </>
  );
};

export default HomeHeroController;
