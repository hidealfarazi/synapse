/**
 * components/RainLayer.tsx
 * Video latar untuk halaman SELAIN Hari Ini (Hari Ini punya video hujan di hero):
 *  - /login  -> /video/login.mp4  (hujan di air)
 *  - lainnya -> /video/pages.mp4  (partikel gelap, lebih redup)
 * Fixed, menutup layar penuh (object-fit: cover) sehingga responsif di HP, tablet, desktop.
 * Tidak diputar bila prefers-reduced-motion, hemat data (saveData), atau toggle
 * "Atmosfer Hujan" mati; poster statis tetap tampil kecuali toggle mati.
 */
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRainEnabled } from "@/lib/rainPref";

const SOURCES = {
  login: { src: "/video/login.mp4", poster: "/video/login.jpg", opacity: 0.6, veil: 0.35 },
  pages: { src: "/video/pages.mp4", poster: "/video/pages.jpg", opacity: 0.42, veil: 0.3 },
} as const;

export function RainLayer() {
  const pathname = usePathname();
  const enabled = useRainEnabled();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const kind = pathname === "/login" ? "login" : "pages";
  const cfg = SOURCES[kind];
  const onHome = pathname === "/";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || onHome || !enabled) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;

    const sync = () => {
      const allowed = !motion.matches && !conn?.saveData && !document.hidden;
      if (allowed) video.play().catch(() => undefined);
      else video.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [onHome, enabled, kind]);

  if (onHome || !enabled) return null;

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <video
        key={kind}
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={cfg.poster}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: cfg.opacity }}
      >
        <source src={cfg.src} type="video/mp4" />
      </video>
      {/* Selubung gelap + vignette agar teks tetap terbaca di layar manapun */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, rgba(11,13,16,${cfg.veil}) 0%, rgba(11,13,16,${cfg.veil + 0.25}) 70%, #0B0D10 100%)`,
        }}
      />
    </div>
  );
}
