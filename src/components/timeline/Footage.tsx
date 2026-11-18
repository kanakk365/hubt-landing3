"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Silent footage over its first frame: nothing loads until it is first `live`; it plays while `live` and holds its
 * frame otherwise, and fades in over the still once it is actually playing.
 */
export function Footage({ src, live }: { src: string; live: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (live) video.play().catch(() => {});
    else video.pause();
  }, [live]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      onPlaying={() => setShown(true)}
      className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", shown ? "opacity-100" : "opacity-0")}
    />
  );
}
