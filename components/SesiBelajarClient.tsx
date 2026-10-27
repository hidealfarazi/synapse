/**
 * components/SesiBelajarClient.tsx
 * Sesi belajar 4 langkah satu per layar dengan indikator "1 / 4" sampai "4 / 4":
 * (a) Analogi dulu, (b) Istilah/Checkpoint dengan Checklist,
 * (c) Kuis 3 soal pilihan ganda (jawaban & penjelasan terbuka setelah dijawab),
 * (d) Refleksi satu kalimat (simpan & kembali ke /belajar).
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChecklistItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addChecklistItem, listChecklist, toggleChecklistItem, deleteChecklistItem } from "@/lib/repo";
import { Checklist } from "@/components/Checklist";
import { Button } from "@/components/ui/Button";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "Apa perbedaan utama antara Server Component dan Client Component di Next.js?",
    options: [
      "Server Component berjalan di browser, Client Component di server",
      "Server Component dirender di server tanpa kirim JS interaktif ke klien, Client Component mendungkung interaktivitas dan hook",
      "Tidak ada perbedaan, keduanya sama persis",
      "Client Component lebih cepat karena tidak perlu render HTML",
    ],
    correctIndex: 1,
    explanation: "Server Component merender markup di server dan mengurangi bundle JavaScript klien, sedangkan Client Component mendukung useState, useEffect, dan interaksi browser.",
  },
  {
    id: 2,
    question: "Kapan waktu yang tepat menggunakan direktif 'use client'?",
    options: [
      "Di setiap file komponen dalam direktori app/",
      "Hanya saat butuh hook (useState, useEffect) atau event handler (onClick)",
      "Saat mengambil data dari database SQL langsung",
      "Untuk menyembunyikan API key rahasia",
    ],
    correctIndex: 1,
    explanation: "'use client' memberitahu Next.js bahwa komponen ini memerlukan runtime browser dan interaktivitas.",
  },
  {
    id: 3,
    question: "Di mana lokasi penyimpanan kunci API yang aman agar tidak bocor ke klien?",
    options: [
      "Di dalam file komponen React (.tsx)",
      "Di dalam localStorage browser",
      "Di server route handler (app/api/) atau variabel lingkungan server (.env.local tanpa NEXT_PUBLIC_)",
      "Di dalam URL query parameters",
    ],
    correctIndex: 2,
    explanation: "Kunci rahasia dan API key pribadi hanya boleh diakses di server-side route handler.",
  },
];

export function SesiBelajarClient({ id }: { id: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 2 checklist state (terms)
  const [terms, setTerms] = useState<ChecklistItem[]>([]);
  const [termError, setTermError] = useState("");
  const [newTermTitle, setNewTermTitle] = useState("");

  // Step 3 quiz state: record selected answer index per question id
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  // Step 4 reflection state
  const [reflection, setReflection] = useState("");
  const [reflectionError, setReflectionError] = useState("");
  const [saved, setSaved] = useState(false);

  const refreshTerms = useCallback(async () => {
    setTerms(await listChecklist("material", id));
  }, [id]);

  useEffect(() => {
    let alive = true;
    listChecklist("material", id)
      .then((list) => {
        if (alive) setTerms(list);
      })
      .catch(() => {
        if (alive) setTerms([]);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  // Materi dengan id ini harus ada di akun yang sedang login; kalau tidak, repo menolak.
  const runTermAction = async (action: () => Promise<unknown>) => {
    try {
      setTermError("");
      await action();
      await refreshTerms();
    } catch {
      setTermError("Materi ini tidak ada di akunmu. Buat dulu di halaman Belajar.");
    }
  };

  const handleToggleTerm = (termId: string) => runTermAction(() => toggleChecklistItem(termId));
  const handleAddTerm = (title: string) => runTermAction(() => addChecklistItem("material", id, "term", title));
  const handleDeleteTerm = (termId: string) => runTermAction(() => deleteChecklistItem(termId));

  const handleAnswerSelect = (qId: number, optIndex: number) => {
    if (selectedAnswers[qId] !== undefined) return; // sudah dijawab
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) {
      setReflectionError("Mohon tuliskan refleksi satu kalimat terlebih dahulu.");
      return;
    }
    setReflectionError("");
    // Simpan sebagai checkpoint materi di repo
    try {
      await addChecklistItem("material", id, "term", `Refleksi: ${reflection.trim()}`);
    } catch {
      setReflectionError("Refleksi belum tersimpan: materi ini tidak ada di akunmu.");
      return;
    }
    setSaved(true);
    setTimeout(() => {
      router.push("/belajar");
    }, 800);
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
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          href="/belajar"
          aria-label="Kembali ke Belajar"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            color: "var(--rn-muted)",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          ← KEMBALI
        </Link>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            color: "var(--rn-accent)",
            fontWeight: 700,
          }}
        >
          SESI BELAJAR {id.toUpperCase()} · {step} / 4
        </span>
      </div>

      {saved ? (
        <div style={{ padding: "4rem 1rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1rem", color: "var(--rn-accent)", marginBottom: "0.5rem" }}>
            Sesi selesai & tersimpan.
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--rn-muted)" }}>Mengembalikan ke halaman Belajar...</p>
        </div>
      ) : (
        <>
          {/* STEP 1: Analogi Dulu */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.12em",
                    color: "var(--rn-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Langkah 01 / 04
                </span>
                <h1 style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", fontWeight: 800, lineHeight: 1.15, marginTop: "0.3rem" }}>
                  Pahami dengan Analogi
                </h1>
              </div>

              <div
                style={{
                  padding: "1.5rem 0",
                  borderTop: "1px solid rgba(168, 159, 140, 0.2)",
                  borderBottom: "1px solid rgba(168, 159, 140, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--rn-text)" }}>
                  Bayangkan sebuah restoran besar. <strong style={{ color: "var(--rn-accent)" }}>Server Component</strong> adalah dapur utama di belakang: tempat koki meracik bahan mentah menjadi hidangan matang yang siap saji tanpa membuat tamu pusing dengan resep rahasia.
                </p>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--rn-text)" }}>
                  Sementara <strong style={{ color: "var(--rn-accent)" }}>Client Component</strong> adalah pramusaji di meja tamu: mereka menerima pesanan langsung, mencatat perubahan menu secara interaktif, dan berinteraksi bolak-balik dengan tamu.
                </p>
              </div>

              <div>
                <Button
                  variant="primary"
                  onClick={() => setStep(2)}
                >
                  Lanjut ke Istilah →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Istilah & Checkpoint */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.12em",
                    color: "var(--rn-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Langkah 02 / 04
                </span>
                <h1 style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", fontWeight: 800, lineHeight: 1.15, marginTop: "0.3rem" }}>
                  Istilah & Checkpoint
                </h1>
              </div>

              <Checklist
                title="Daftar Istilah"
                kind="term"
                items={terms}
                onToggle={handleToggleTerm}
                onAdd={handleAddTerm}
                onDelete={handleDeleteTerm}
              />
              {termError && (
                <p role="alert" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6875rem", color: "var(--rn-alert)", letterSpacing: "0.04em" }}>
                  {termError}
                </p>
              )}

              <div style={{ display: "flex", gap: "1rem" }}>
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  ← Kembali
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setStep(3)}
                >
                  Lanjut Kuis →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Kuis 3 Soal Pilihan Ganda */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.12em",
                    color: "var(--rn-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Langkah 03 / 04
                </span>
                <h1 style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", fontWeight: 800, lineHeight: 1.15, marginTop: "0.3rem" }}>
                  Kuis Pemahaman
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--rn-muted)", marginTop: "0.4rem" }}>
                  Jawaban benar dan penjelasan akan terbuka setelah kamu memilih opsi.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                {SAMPLE_QUIZ.map((q, idx) => {
                  const answeredIndex = selectedAnswers[q.id];
                  const isAnswered = answeredIndex !== undefined;

                  return (
                    <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: "0.85rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(168, 159, 140, 0.2)" }}>
                      <p style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.4 }}>
                        {idx + 1}. {q.question}
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {q.options.map((opt, optIdx) => {
                          let optBg = "transparent";
                          let optBorder = "1px solid rgba(143, 163, 191, 0.2)";
                          let optColor = "var(--rn-text)";

                          if (isAnswered) {
                            if (optIdx === q.correctIndex) {
                              optBg = "rgba(126, 157, 132, 0.15)";
                              optBorder = "1px solid #7E9D84";
                            } else if (optIdx === answeredIndex) {
                              optBg = "rgba(217, 119, 107, 0.15)";
                              optBorder = "1px solid var(--rn-alert)";
                            }
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleAnswerSelect(q.id, optIdx)}
                              style={{
                                textAlign: "left",
                                padding: "0.75rem 1rem",
                                background: optBg,
                                border: optBorder,
                                color: optColor,
                                fontSize: "0.9rem",
                                lineHeight: 1.4,
                                cursor: isAnswered ? "default" : "pointer",
                                minHeight: 44,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div
                          style={{
                            padding: "0.85rem 1rem",
                            background: "rgba(143, 163, 191, 0.08)",
                            borderLeft: "2px solid var(--rn-accent)",
                            fontSize: "0.875rem",
                            lineHeight: 1.5,
                            color: "var(--rn-muted)",
                            marginTop: "0.5rem",
                          }}
                        >
                          <strong style={{ color: "var(--rn-text)" }}>Penjelasan:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <Button
                  variant="secondary"
                  onClick={() => setStep(2)}
                >
                  ← Kembali
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setStep(4)}
                >
                  Lanjut Refleksi →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Refleksi Satu Kalimat */}
          {step === 4 && (
            <form onSubmit={handleFinish} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.12em",
                    color: "var(--rn-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Langkah 04 / 04
                </span>
                <h1 style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", fontWeight: 800, lineHeight: 1.15, marginTop: "0.3rem" }}>
                  Refleksi Sesi
                </h1>
                <p style={{ fontSize: "0.9rem", color: "var(--rn-muted)", marginTop: "0.4rem" }}>
                  Tuliskan satu kalimat kesimpulan atau pemahaman penting yang kamu dapatkan hari ini.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="text"
                  value={reflection}
                  onChange={(e) => {
                    setReflection(e.target.value);
                    if (reflectionError) setReflectionError("");
                  }}
                  placeholder="Contoh: Saya paham kapan harus pakai Server vs Client Component..."
                  style={{
                    width: "100%",
                    height: "52px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: reflectionError
                      ? "1px solid var(--rn-alert)"
                      : "1px solid rgba(255, 255, 255, 0.12)",
                    color: "var(--rn-text)",
                    padding: "0 1rem",
                    fontFamily: "var(--font-body, sans-serif)",
                    fontSize: "1rem",
                    minHeight: 44,
                    outline: "none",
                  }}
                />
                {reflectionError && (
                  <p
                    role="alert"
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.75rem",
                      color: "var(--rn-alert)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {reflectionError}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <Button
                  variant="secondary"
                  onClick={() => setStep(3)}
                >
                  ← Kembali
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Selesai & Simpan ✓
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
