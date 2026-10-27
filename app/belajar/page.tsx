/**
 * app/belajar/page.tsx — Materi belajar
 */
import { PageHead } from "@/components/PageHead";
import { BelajarClient } from "@/components/BelajarClient";

export default function BelajarPage() {
  return (
    <div
      style={{
        background: "transparent",
        color: "var(--rn-text)",
        minHeight: "100dvh",
        padding: "2.5rem 1.5rem 8.5rem",
        maxWidth: "36rem",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem",
      }}
    >
      <PageHead
        counter="03 / 04"
        section="BELAJAR"
        title="Belajar"
        sub="Peta kesiapan, fokus harian, & materi"
      />
      <BelajarClient />
    </div>
  );
}
