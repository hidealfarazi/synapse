/**
 * lib/mock/learning.ts — Data contoh untuk halaman Belajar (/belajar)
 */

export interface LearningFocus {
  id: string;
  title: string;
  reason: string;
  level: "Fondasi" | "Kompetensi" | "AI Engineering";
  estMinutes: number;
  sessionId: string;
  checkpoints: { id: string; title: string; done: boolean }[];
}

export interface SkillNode {
  id: string;
  title: string;
  tier: 1 | 2 | 3;
  tierName: "Fondasi" | "Kompetensi" | "AI Engineering";
  done: boolean;
  isActive?: boolean;
}

export const INITIAL_FOCUS: LearningFocus = {
  id: "fokus_today",
  title: "Server Components & Client Components di Next.js",
  reason: "Kunci utama arsitektur App Router agar performa optimal dan pemisahan logika yang benar.",
  level: "Kompetensi",
  estMinutes: 45,
  sessionId: "m1",
  checkpoints: [
    { id: "cp_1", title: "Pahami kapan pakai 'use client'", done: true },
    { id: "cp_2", title: "Passing data antar server dan klien", done: false },
    { id: "cp_3", title: "Hindari kebocoran kunci API di klien", done: false },
  ],
};

export const INITIAL_SKILL_NODES: SkillNode[] = [
  // Tier 1: Fondasi
  { id: "n_f1", title: "Computational thinking", tier: 1, tierName: "Fondasi", done: true },
  { id: "n_f2", title: "Critical thinking", tier: 1, tierName: "Fondasi", done: true },
  { id: "n_f3", title: "Spec-driven thinking", tier: 1, tierName: "Fondasi", done: true },
  { id: "n_f4", title: "Dasar pemrograman", tier: 1, tierName: "Fondasi", done: true },

  // Tier 2: Kompetensi
  { id: "n_c1", title: "System design", tier: 2, tierName: "Kompetensi", done: true },
  { id: "n_c2", title: "Optimasi dasar", tier: 2, tierName: "Kompetensi", done: false, isActive: true },
  { id: "n_c3", title: "Keamanan dan privasi", tier: 2, tierName: "Kompetensi", done: false },
  { id: "n_c4", title: "Value translator", tier: 2, tierName: "Kompetensi", done: false },
  { id: "n_c5", title: "Version control dan dokumentasi", tier: 2, tierName: "Kompetensi", done: false },

  // Tier 3: AI Engineering
  { id: "n_a1", title: "Model LLM dan API", tier: 3, tierName: "AI Engineering", done: false },
  { id: "n_a2", title: "Prompt engineering", tier: 3, tierName: "AI Engineering", done: false },
  { id: "n_a3", title: "RAG", tier: 3, tierName: "AI Engineering", done: false },
  { id: "n_a4", title: "Multimodal", tier: 3, tierName: "AI Engineering", done: false },
];

/**
 * Kerangka peta kesiapan 3 tingkat. Dipakai SEKALI per akun (BelajarClient) untuk membuat
 * node awal di akun itu — semua belum selesai, jadi bukan data/progres palsu.
 */
export const SKILL_ROADMAP: SkillNode[] = INITIAL_SKILL_NODES.map(({ id, title, tier, tierName }) => ({
  id,
  title,
  tier,
  tierName,
  done: false,
}));
