import { useEffect, useRef, useState, type CSSProperties } from "react";

interface VideoBackgroundProps {
  src: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  enabled?: boolean;
}

const VideoBackground = ({
  src,
  className = "",
  overlay = false,
  overlayOpacity,
  enabled = true
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (!enabled) {
        setShouldAutoplay(false);
        return;
      }

      const shouldReduceMotion = mediaQuery.matches;
      const nav = navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
        deviceMemory?: number;
      };
      const shouldSaveData = nav.connection?.saveData === true;
      const isSlowNetwork = ["slow-2g", "2g", "3g"].includes(nav.connection?.effectiveType ?? "");
      const hasLowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
      const hasLowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2;

      setShouldAutoplay(!shouldReduceMotion && !shouldSaveData && !isSlowNetwork && !hasLowMemory && !hasLowCpu);
    };

    onChange();
    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled) return;

    setShouldLoadVideo(false);
    videoRef.current?.pause();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !shouldAutoplay) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) {
      setShouldLoadVideo(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(wrapper);
    return () => {
      observer.disconnect();
    };
  }, [enabled, shouldAutoplay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!enabled || !video || !shouldLoadVideo || !shouldAutoplay) return;

    const attemptPlay = () => {
      video.play().catch(() => {
        setShouldAutoplay(false);
      });
    };

    if (video.readyState >= 2) {
      attemptPlay();
      return;
    }

    video.addEventListener("loadeddata", attemptPlay);
    return () => {
      video.removeEventListener("loadeddata", attemptPlay);
    };
  }, [enabled, shouldAutoplay, shouldLoadVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!enabled || !video || !shouldLoadVideo || !shouldAutoplay) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
        return;
      }

      video.play().catch(() => {
        setShouldAutoplay(false);
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, shouldAutoplay, shouldLoadVideo]);

  const showVideo = enabled && shouldLoadVideo && shouldAutoplay;
  const overlayStyle = overlayOpacity === undefined
    ? undefined
    : ({ "--video-overlay-opacity": overlayOpacity } as CSSProperties);

  return (
    <div
      ref={wrapperRef}
      className={`[grid-area:1/1] pointer-events-none relative overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="video-placeholder absolute inset-0" />
      )}
      {overlay && (
        <div
          style={overlayStyle}
          className="absolute inset-0 bg-background opacity-[var(--video-overlay-opacity)]"
        />
      )}
    </div>
  );
};

export default VideoBackground;
