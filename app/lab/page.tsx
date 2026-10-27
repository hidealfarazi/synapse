import Link from "next/link";

export default function LabIndexPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "monospace", background: "#0e0e0e", color: "#fff", minHeight: "100dvh" }}>
      <p style={{ marginBottom: "2rem", fontSize: "0.75rem", letterSpacing: "0.1em", opacity: 0.5 }}>
        DESIGN LAB / BELAJAR
      </p>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <li>
          <Link href="/lab/a" style={{ fontSize: "1rem" }}>
            A → Quiet Grotesk
          </Link>
        </li>
        <li>
          <Link href="/lab/b" style={{ fontSize: "1rem" }}>
            B → Ink &amp; Batik
          </Link>
        </li>
        <li>
          <Link href="/lab/c" style={{ fontSize: "1rem" }}>
            C → Hybrid
          </Link>
        </li>
      </ul>
    </main>
  );
}
