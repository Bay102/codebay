import { useEffect, useRef, useState } from "react";

interface VideoBackgroundProps {
  src: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

const VideoBackground = ({
  src,
  className = "",
  overlay = false,
  overlayOpacity = 0.5
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      const shouldReduceMotion = mediaQuery.matches;
      const shouldSaveData =
        "connection" in navigator &&
        (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
          ?.saveData === true;
      setShouldAutoplay(!shouldReduceMotion && !shouldSaveData);
    };

    onChange();
    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (!shouldAutoplay) return;

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
  }, [shouldAutoplay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo || !shouldAutoplay) return;

    const handleLoadedData = () => {
      video.play().catch(() => {
        setShouldAutoplay(false);
      });
    };

    video.addEventListener("loadeddata", handleLoadedData);
    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [shouldAutoplay, shouldLoadVideo]);

  const showVideo = shouldLoadVideo && shouldAutoplay;

  return (
    <div ref={wrapperRef} className={`[grid-area:1/1] relative overflow-hidden ${className}`}>
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
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="video-placeholder absolute inset-0" aria-hidden="true" />
      )}
      {overlay && (
        <div
          className="absolute inset-0 bg-background"
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default VideoBackground;
