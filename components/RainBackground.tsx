/**
 * components/RainBackground.tsx
 * Subtle atmospheric rain video backdrop restricted to the Hero area.
 * Fades seamlessly into solid #0B0D10 towards the bottom before task list.
 */
"use client";

import { useEffect, useState } from "react";
import { useRainEnabled } from "@/lib/rainPref";

export function RainBackground() {
  const [reduce, setReduce] = useState(false);
  const rainEnabled = useRainEnabled();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reduce || !rainEnabled) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "75svh",
        minHeight: "560px",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        src="/hujan-loop.mp4"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.7) contrast(1.1)",
          opacity: 0.5,
        }}
      />
      {/* Seamless gradient fade into #0B0D10 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(11, 13, 16, 0.2) 0%, rgba(11, 13, 16, 0.6) 60%, #0B0D10 100%)",
        }}
      />
    </div>
  );
}
