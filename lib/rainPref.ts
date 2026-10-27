/**
 * lib/rainPref.ts
 * Preferensi "Atmosfer Hujan" (toggle di menu Lainnya), dipakai bersama oleh video hero
 * dan lapisan hujan tipis. Disimpan di localStorage (rn_rain_enabled); BottomNav menyiarkan
 * event "rn_rain_toggle" saat berubah. useSyncExternalStore -> aman untuk SSR tanpa setState di effect.
 */
"use client";

import { useSyncExternalStore } from "react";

const KEY = "rn_rain_enabled";
const EVENT = "rn_rain_toggle";

export function readRainEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== "false";
  } catch {
    return true;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useRainEnabled(): boolean {
  return useSyncExternalStore(subscribe, readRainEnabled, () => true);
}
