/**
 * app/pr/new/page.tsx — Form Tambah Tugas Baru (/pr/new)
 * Menggunakan Button dan Field/input beradius 12px sesuai aturan kontrol.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/lib/repo";
import { PageHead } from "@/components/PageHead";
import { Button } from "@/components/ui/Button";

const SUBJECT_OPTIONS = [
  "Pemrograman Web",
  "Basis Data",
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Pemrograman Berorientasi Objek",
];

export default function NewAssignmentPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 4);
    return d.toISOString().slice(0, 16);
  });
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul tugas tidak boleh kosong.");
      return;
    }
    setError("");
    setSaving(true);

    try {
      await createAssignment({
        title: title.trim(),
        subject,
        dueAt: new Date(dueDate),
        priority,
        description: description.trim() || undefined,
      });
      router.push("/pr");
    } catch {
      setError("Gagal menyimpan. Periksa koneksi lalu coba lagi.");
      setSaving(false);
    }
  };

  const inputContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono, monospace)",
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--rn-muted)",
  };

  const boxControlStyle: React.CSSProperties = {
    height: "52px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "var(--rn-text)",
    padding: "0 1rem",
    fontFamily: "var(--font-body, sans-serif)",
    fontSize: "1rem",
    outline: "none",
    width: "100%",
  };

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
        counter="02 / 04"
        section="PR"
        title="Tugas Baru"
        sub="Tambah penugasan sekolah baru"
      />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Judul Tugas */}
        <div style={inputContainerStyle}>
          <label htmlFor="pr-title" style={labelStyle}>
            Judul Tugas *
          </label>
          <input
            id="pr-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            placeholder="Contoh: Praktik API Route Next.js"
            style={{
              ...boxControlStyle,
              ...(error ? { borderColor: "var(--rn-alert)" } : {}),
            }}
          />
          {error && (
            <p
              role="alert"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
                color: "var(--rn-alert)",
                marginTop: "0.25rem",
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Mata Pelajaran */}
        <div style={inputContainerStyle}>
          <label htmlFor="pr-subject" style={labelStyle}>
            Mata Pelajaran
          </label>
          <select
            id="pr-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              ...boxControlStyle,
              background: "#0B0D10",
              cursor: "pointer",
            }}
          >
            {SUBJECT_OPTIONS.map((subj) => (
              <option key={subj} value={subj} style={{ background: "#0B0D10", color: "#F2F2EE" }}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        {/* Tenggat Waktu */}
        <div style={inputContainerStyle}>
          <label htmlFor="pr-due" style={labelStyle}>
            Tenggat Waktu
          </label>
          <input
            id="pr-due"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              ...boxControlStyle,
              colorScheme: "dark",
            }}
          />
        </div>

        {/* Prioritas */}
        <div style={inputContainerStyle}>
          <span style={labelStyle}>Prioritas</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {([1, 2, 3] as const).map((p) => {
              const labels: Record<1 | 2 | 3, string> = {
                1: "1 — Rendah",
                2: "2 — Sedang",
                3: "3 — Mendesak",
              };
              const isSelected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    minHeight: "44px",
                    borderRadius: "12px",
                    border: isSelected ? "1px solid var(--rn-accent)" : "1px solid rgba(255, 255, 255, 0.12)",
                    background: isSelected ? "rgba(143, 163, 191, 0.18)" : "rgba(255, 255, 255, 0.04)",
                    color: isSelected ? "var(--rn-text)" : "var(--rn-muted)",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.75rem",
                    fontWeight: isSelected ? 700 : 400,
                    cursor: "pointer",
                    transition: "all 200ms ease-out",
                  }}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catatan / Deskripsi */}
        <div style={inputContainerStyle}>
          <label htmlFor="pr-desc" style={labelStyle}>
            Catatan Tambahan
          </label>
          <input
            id="pr-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Petunjuk khusus dari guru atau ringkasan tugas"
            style={boxControlStyle}
          />
        </div>

        {/* Tombol Aksi */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <Button type="submit" variant="primary" style={{ flex: 1 }} disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan PR"}
          </Button>
          <Button href="/pr" variant="secondary" style={{ flex: 1 }}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
