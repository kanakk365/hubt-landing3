"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches. The server and the first client render use
 * `fallback`, so the markup hydrates cleanly before the real value arrives.
 */
export function useMedia(query: string, fallback = true) {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => fallback
  );
}
