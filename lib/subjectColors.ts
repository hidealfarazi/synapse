/**
 * lib/subjectColors.ts — 5 warna redup untuk identitas mapel.
 * Palet gelap, hanya garis vertikal 2px di depan label mapel.
 */
export const SUBJECT_PALETTE: Record<string, string> = {
  // 1. Biru-abu
  "Pemrograman Web": "#8FA3BF",
  // 2. Hijau pudar
  "Basis Data": "#7E9D84",
  // 3. Ungu pudar
  Matematika: "#9B86B3",
  // 4. Amber redup
  PKK: "#C9A24B",
  // 5. Rose pudar
  "Bahasa Indonesia": "#B86B6B",
};

export const FALLBACK_ROSE = "#B86B6B";

export function subjectColor(name: string): string {
  return SUBJECT_PALETTE[name] ?? FALLBACK_ROSE;
}

