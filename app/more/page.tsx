import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { AccountPanel } from "@/components/AccountPanel";

export default function MorePage() {
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
        gap: "2rem",
      }}
    >
      <PageHead
        counter="04 / 04"
        section="LAINNYA"
        title="Lainnya"
        sub="Pengaturan & alat bantu"
      />

      <nav style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        <Link
          href="/belajar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem 0",
            borderBottom: "1px solid rgba(168, 159, 140, 0.2)",
            textDecoration: "none",
            color: "var(--rn-text)",
          }}
        >
          <span style={{ fontWeight: 700 }}>Materi Belajar</span>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.7rem",
              color: "var(--rn-muted)",
            }}
          >
            Daftar istilah & checkpoint →
          </span>
        </Link>
        <Link
          href="/arsip"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem 0",
            borderBottom: "1px solid rgba(168, 159, 140, 0.2)",
            textDecoration: "none",
            color: "var(--rn-text)",
          }}
        >
          <span style={{ fontWeight: 700 }}>Arsip</span>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.7rem",
              color: "var(--rn-muted)",
            }}
          >
            Tugas yang selesai →
          </span>
        </Link>
      </nav>

      <AccountPanel />
    </div>
  );
}
