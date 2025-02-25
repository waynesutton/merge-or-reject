import React, { useState } from "react";
import { Play, Pause } from "lucide-react";

const CodingCatGif = () => {
  const gifUrl = "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif";
  const staticFrame = "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy_s.gif";
  
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleGif = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative group">
      <div 
        style={{ width: "560px", height: "315px", cursor: "pointer" }} 
        onClick={toggleGif}
      >
        <img
          src={isPlaying ? gifUrl : staticFrame}
          alt="Cat Coding"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
          className="rounded-lg"
        />
      </div>
      <button
        onClick={toggleGif}
        className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default CodingCatGif;