/**
 * lib/mock/recommendation.ts
 * Data contoh (mock) untuk Hero Rekomendasi di Hari Ini.
 * Memakai tipe Recommendation dari "@/lib/ai/types" (import saja, jangan diubah).
 */
import type { Recommendation } from "@/lib/ai/types";

export const INITIAL_MOCK_RECOMMENDATION: Recommendation = {
  topic: "Server Actions & Mutasi Form\nOptimasi Pola Data di App Router",
  reason: "Pola arsitektur App Router kini mengutamakan Server Actions untuk mutasi data yang typesafe langsung dari server tanpa membuat endpoint API manual.",
  tier: "kompetensi",
  minutes: 45,
  radarItemId: "rec_sa",
  alternatives: [
    {
      topic: "Streaming SSR & Suspense\nPemecahan Komponen Non-Blocking",
      tier: "kompetensi",
      minutes: 35,
    },
    {
      topic: "Vector Indexing & RAG\nArsitektur Konteks AI Personal",
      tier: "ai",
      minutes: 50,
    },
    {
      topic: "Desain Skema Normalisasi\nRelasi Kunci & Integritas Data",
      tier: "fondasi",
      minutes: 40,
    },
  ],
  generatedAt: new Date().toISOString(),
  signalSource: {
    title: "Next.js Engineering Highlights (Mock Signal)",
    url: "https://nextjs.org/blog",
  },
};

export function getMockRecommendation(): Recommendation {
  return {
    ...INITIAL_MOCK_RECOMMENDATION,
    generatedAt: new Date().toISOString(),
  };
}
