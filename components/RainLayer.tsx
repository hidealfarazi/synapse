/**
 * components/RainLayer.tsx
 * Hujan tipis untuk halaman SELAIN Hari Ini (Hari Ini sudah punya video hujan di hero).
 * Canvas satu lapis fixed di belakang konten: garis 1px miring tipis, opasitas rendah,
 * tanpa glow/bayangan. Hemat: jumlah tetes mengikuti luas layar, berhenti saat tab
 * tersembunyi, dan tidak dirender sama sekali bila prefers-reduced-motion atau toggle
 * "Atmosfer Hujan" mati.
 */
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readRainEnabled } from "@/lib/rainPref";

interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number; // px per detik
  alpha: number;
}

const WIND = 0.14; // kemiringan: px ke kanan per px turun
const COLOR = "143, 163, 191"; // --rn-accent
const MAX_ALPHA = 0.2;

function makeDrop(w: number, h: number, anywhere: boolean): Drop {
  return {
    x: Math.random() * (w + h * WIND) - h * WIND,
    y: anywhere ? Math.random() * h : -Math.random() * 60 - 20,
    len: 10 + Math.random() * 14,
    speed: 420 + Math.random() * 360,
    alpha: 0.07 + Math.random() * (MAX_ALPHA - 0.07),
  };
}

export function RainLayer() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onHome = pathname === "/";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || onHome) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let drops: Drop[] = [];
    let raf = 0;
    let last = 0;

    const allowed = () => readRainEnabled() && !motion.matches && !document.hidden;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Tipis: ~1 tetes per 17.000 px², dibatasi 28–64.
      const count = Math.max(28, Math.min(64, Math.round((width * height) / 17000)));
      drops = Array.from({ length: count }, () => makeDrop(width, height, true));
    };

    const frame = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (const d of drops) {
        d.y += d.speed * dt;
        d.x += d.speed * WIND * dt;
        if (d.y - d.len > height || d.x > width + 20) Object.assign(d, makeDrop(width, height, false));
        ctx.strokeStyle = `rgba(${COLOR}, ${d.alpha})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * WIND, d.y - d.len);
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, width, height);
    };
    const sync = () => {
      if (allowed()) {
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      } else if (raf) {
        stop();
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    resize();
    sync();
    window.addEventListener("resize", resize);
    window.addEventListener("rn_rain_toggle", sync);
    window.addEventListener("storage", sync);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("rn_rain_toggle", sync);
      window.removeEventListener("storage", sync);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [onHome]);

  if (onHome) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
