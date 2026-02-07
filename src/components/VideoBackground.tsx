import { useEffect, useRef } from "react";

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
  overlayOpacity = 0.3 
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video plays when loaded
    const handleLoadedData = () => {
      video.play().catch((error) => {
        console.warn("Video autoplay failed:", error);
      });
    };

    video.addEventListener("loadeddata", handleLoadedData);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
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
