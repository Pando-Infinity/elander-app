"use client";

import React, { useRef, useState } from "react";
import { SoundOffIcon, SoundOnIcon } from "@/components/icons";

const Introduction = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  return (
    <div className="h-[94px] sm:h-[336px] relative">
      <video
        ref={videoRef}
        autoPlay
        loop
        playsInline
        muted
        className="h-full w-full object-cover"
      >
        <source src="/videos/intro-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <button
        onClick={toggleSound}
        className="cursor-pointer absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/40 p-1.5 rounded-full"
      >
        {!isMuted ? (
          <SoundOnIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
        ) : (
          <SoundOffIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
        )}
      </button>
    </div>
  );
};

export default Introduction;
