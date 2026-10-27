/**
 * app/page.tsx — Hari Ini (Today) page
 * Urutan baru (02-home-recommendation):
 * 1. Sapaan kecil (label mono)
 * 2. HERO REKOMENDASI (~75svh)
 * 3. Blok "Berikutnya" (tugas paling mendesak + hitung mundur hidup)
 * 4. Daftar tugas
 * 5. Strip mingguan
 */
import { getGreeting, formatDate } from "@/lib/mock";
import { RecommendationHero } from "@/components/RecommendationHero";
import { NextTaskBlock } from "@/components/NextTaskBlock";
import { AssignmentList } from "@/components/AssignmentList";
import { WeeklyStrip } from "@/components/WeeklyStrip";
import { RainBackground } from "@/components/RainBackground";

export default function HomePage() {
  const greeting = getGreeting();
  const now = new Date();
  const greetingText = `${greeting.toUpperCase()} · ${formatDate(now).toUpperCase()}`;

  return (
    <div
      style={{
        background: "transparent",
        color: "var(--rn-text)",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-body, sans-serif)",
        position: "relative",
      }}
    >
      <RainBackground />
      <main
        style={{
          flex: 1,
          padding: "2.5rem 1.5rem 8.5rem",
          maxWidth: "36rem",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Top bar: Counter 01 / 04 dan Sapaan Kecil (Label Mono) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              color: "var(--rn-muted)",
            }}
          >
            01 / 04
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6875rem",
              letterSpacing: "0.1em",
              color: "var(--rn-muted)",
              textTransform: "uppercase",
            }}
          >
            {greetingText}
          </span>
        </div>

        {/* 1. HERO REKOMENDASI (~75svh) */}
        <RecommendationHero />

        {/* 2. BLOK "BERIKUTNYA" (tugas paling mendesak + hitung mundur hidup jam:menit) */}
        <NextTaskBlock />

        {/* 3. DAFTAR TUGAS */}
        <AssignmentList />

        {/* 4. STRIP MINGGUAN */}
        <WeeklyStrip />
      </main>
    </div>
  );
}
