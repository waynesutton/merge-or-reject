import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

const CodingCatGif = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleGif = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="relative group">
      <div style={{ width: "1120px", height: "630px", cursor: "pointer" }} onClick={toggleGif}>
        <video
          ref={videoRef}
          autoPlay={isPlaying}
          loop
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
          className="rounded-lg">
          <source
            src="https://playmerge.ai/mergedemovideo.mp4mergedemovideo.webm"
            type="video/webm"
          />
          <source src="https://playmerge.ai/mergedemovideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <button
        onClick={toggleGif}
        className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100">
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default CodingCatGif;
