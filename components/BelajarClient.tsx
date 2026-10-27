/**
 * components/BelajarClient.tsx
 * Halaman /belajar: 4 bagian (Fokus hari ini, Jalurmu 3 tier vertikal, Minta sendiri, Materiku).
 * Borderless, CometDial, Checklist, real state via lib/repo.ts.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getTodayLearningFocus,
  refreshLearningFocus,
  toggleFocusCheckpoint,
  listSkillNodes,
  saveSkillNode,
  toggleSkillNode,
  listMaterials,
  createMaterial,
  listChecklist,
  toggleChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
} from "@/lib/repo";
import type { ChecklistItem, Material } from "@/lib/types";
import { SKILL_ROADMAP, type LearningFocus, type SkillNode } from "@/lib/mock/learning";
import { CometDial } from "@/components/CometDial";
import { Checklist } from "@/components/Checklist";
import { SpringCheck } from "@/components/SpringCheck";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";

interface LoadedBelajar {
  focus: LearningFocus | null;
  nodes: SkillNode[];
  materials: Material[];
  termsById: Record<string, ChecklistItem[]>;
}

// Satu pemuatan lengkap data halaman Belajar milik akun yang sedang login.
async function fetchBelajar(): Promise<LoadedBelajar> {
  const [focus, existing, materials] = await Promise.all([getTodayLearningFocus(), listSkillNodes(), listMaterials()]);
  // Peta kesiapan: kerangka 3 tingkat dibuat sekali per akun (semua belum selesai).
  const nodes = existing.length > 0 ? existing : await Promise.all(SKILL_ROADMAP.map((node) => saveSkillNode(node)));
  const entries = await Promise.all(materials.map(async (m) => [m.id, await listChecklist("material", m.id)] as const));
  return { focus: focus ?? null, nodes, materials, termsById: Object.fromEntries(entries) };
}

export function BelajarClient() {
  // focus: undefined = memuat, null = akun belum punya fokus hari ini
  const [focus, setFocus] = useState<LearningFocus | null | undefined>(undefined);
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [termsById, setTermsById] = useState<Record<string, ChecklistItem[]>>({});
  const [newMatTitle, setNewMatTitle] = useState("");
  const [matError, setMatError] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [promptNotice, setPromptNotice] = useState<string | null>(null);
  const [expandedMatId, setExpandedMatId] = useState<string | null>(null);

  const apply = useCallback((d: LoadedBelajar) => {
    setFocus(d.focus);
    setNodes(d.nodes);
    setMaterials(d.materials);
    setTermsById(d.termsById);
  }, []);

  const refresh = useCallback(async () => {
    apply(await fetchBelajar());
  }, [apply]);

  useEffect(() => {
    let alive = true;
    fetchBelajar()
      .then((d) => {
        if (alive) apply(d);
      })
      .catch(() => {
        if (alive) setFocus(null);
      });
    return () => {
      alive = false;
    };
  }, [apply]);

  const handleRefreshFocus = async () => {
    const updated = await refreshLearningFocus();
    setFocus(updated ? { ...updated } : null);
  };

  const handleToggleCheckpoint = async (cpId: string) => {
    const updated = await toggleFocusCheckpoint(cpId);
    setFocus(updated ? { ...updated } : null);
  };

  const handleToggleNode = async (nodeId: string) => {
    const updated = await toggleSkillNode(nodeId);
    setNodes([...updated]);
  };

  const handleCreateMaterialFromField = async (value: string) => {
    if (!value.trim()) {
      setMatError("Judul materi tidak boleh kosong");
      return;
    }
    setMatError("");
    await createMaterial(value.trim());
    setNewMatTitle("");
    await refresh();
  };

  const handlePromptSubmitFromField = (value: string) => {
    if (!value.trim()) return;
    const modePrefix = activeChip ? `[${activeChip}] ` : "";
    const fullMessage = `${modePrefix}${value.trim()}`;
    setPromptNotice(`Permintaan dikirim: "${fullMessage}"`);
    setCustomPrompt("");
  };

  const handleToggleChip = (text: string) => {
    setActiveChip((prev) => (prev === text ? null : text));
  };

  // Group nodes by tier
  const tiers = [
    { tier: 1, name: "Tier 1 — Fondasi", nodes: nodes.filter((n) => n.tier === 1) },
    { tier: 2, name: "Tier 2 — Kompetensi", nodes: nodes.filter((n) => n.tier === 2) },
    { tier: 3, name: "Tier 3 — AI Engineering", nodes: nodes.filter((n) => n.tier === 3) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      {/* 01 FOKUS HARI INI */}
      {focus === undefined ? null : focus === null ? (
        <section aria-label="Fokus hari ini">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid rgba(143, 163, 191, 0.15)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                color: "var(--rn-accent)",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              01 — Fokus Hari Ini
            </span>
          </div>
          <p style={{ color: "var(--rn-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Belum ada fokus belajar untuk hari ini. Pilih satu materi di bagian Materiku di bawah untuk mulai.
          </p>
        </section>
      ) : (
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid rgba(143, 163, 191, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                color: "var(--rn-accent)",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              01 — Fokus Hari Ini
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.625rem",
                padding: "0.15rem 0.4rem",
                background: "rgba(143, 163, 191, 0.12)",
                color: "var(--rn-accent)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {focus.level}
            </span>
          </div>

          <Button
            variant="secondary"
            onClick={handleRefreshFocus}
            style={{
              minHeight: "36px",
              height: "36px",
              padding: "0 0.85rem",
              fontSize: "0.6875rem",
            }}
          >
            Perbarui
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h2
            style={{
              fontSize: "clamp(1.35rem, 5vw, 1.85rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "var(--rn-text)",
            }}
          >
            {focus.title}
          </h2>
          <p
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              color: "var(--rn-muted)",
            }}
          >
            {focus.reason}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6875rem",
              color: "var(--rn-muted)",
              marginBottom: "1rem",
            }}
          >
            <span>Estimasi: {focus.estMinutes} menit</span>
            <span>·</span>
            <span>{focus.checkpoints.filter((c) => c.done).length}/{focus.checkpoints.length} selesai</span>
          </div>

          {/* Checkpoints checklist */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: "1.25rem" }}>
            {focus.checkpoints.map((cp) => (
              <div
                key={cp.id}
                style={{
                  borderBottom: "1px solid rgba(168, 159, 140, 0.12)",
                }}
              >
                <SpringCheck
                  label={cp.title}
                  checked={cp.done}
                  onChange={() => handleToggleCheckpoint(cp.id)}
                  ariaLabel={`Centang ${cp.title}`}
                />
              </div>
            ))}
          </div>

          <div>
            <Button
              variant="primary"
              href={`/belajar/sesi/${focus.sessionId}`}
            >
              Mulai Sesi →
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* 02 JALURMU (Peta vertikal 3 tingkat tanpa kartu) */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "1.25rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid rgba(143, 163, 191, 0.15)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              color: "var(--rn-accent)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            02 — Jalurmu (Peta Kesiapan)
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6875rem",
              color: "var(--rn-muted)",
            }}
          >
            {nodes.filter((n) => n.done).length} / {nodes.length} selesai
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {tiers.map((tierGroup) => (
            <div key={tierGroup.tier} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.1em",
                  color: "var(--rn-muted)",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                {tierGroup.name}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  paddingLeft: "1rem",
                  borderLeft: "1px solid rgba(143, 163, 191, 0.2)",
                  gap: "0.75rem",
                }}
              >
                {tierGroup.nodes.map((node) => {
                  const progressValue = node.done ? 100 : node.isActive ? 45 : 0;
                  return (
                    <div
                      key={node.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.4rem 0",
                        borderBottom: "1px solid rgba(168, 159, 140, 0.1)",
                        minHeight: 44,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleNode(node.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          flex: 1,
                          minHeight: 44,
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: node.done
                              ? "var(--rn-accent)"
                              : node.isActive
                              ? "var(--rn-amber)"
                              : "rgba(139, 147, 160, 0.4)",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: node.isActive ? 700 : 500,
                            color: node.done ? "var(--rn-muted)" : "var(--rn-text)",
                            textDecoration: node.done ? "line-through" : "none",
                          }}
                        >
                          {node.title}
                        </span>
                      </button>

                      <div style={{ flexShrink: 0, marginLeft: "1rem" }}>
                        {node.isActive ? (
                          <CometDial value={progressValue} size={36} />
                        ) : node.done ? (
                          <span
                            style={{
                              fontFamily: "var(--font-mono, monospace)",
                              fontSize: "0.6875rem",
                              color: "var(--rn-accent)",
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                            }}
                          >
                            SELESAI
                          </span>
                        ) : (
                          <span
                            style={{
                              fontFamily: "var(--font-mono, monospace)",
                              fontSize: "0.6875rem",
                              color: "rgba(139, 147, 160, 0.4)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 03 MINTA SENDIRI (Field + Chip cepat flex-wrap 8px) */}
      <section>
        <div
          style={{
            paddingBottom: "0.5rem",
            borderBottom: "1px solid rgba(143, 163, 191, 0.15)",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              color: "var(--rn-accent)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            03 — Minta Sendiri
          </span>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <Field
            value={customPrompt}
            onChange={(v) => {
              setCustomPrompt(v);
              if (promptNotice) setPromptNotice(null);
            }}
            onSubmit={handlePromptSubmitFromField}
            placeholder={activeChip ? `${activeChip}: tulis topik...` : "Aku mau belajar..."}
            ariaLabel="Topik atau pertanyaan belajar"
          />
        </div>

        {promptNotice && (
          <p
            role="status"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              color: "var(--rn-accent)",
              marginBottom: "1rem",
              letterSpacing: "0.04em",
            }}
          >
            {promptNotice}
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {[
            "Jelaskan pakai analogi",
            "Kuis aku",
            "Kasih petunjuk, jangan jawabannya",
          ].map((quickText) => (
            <Chip
              key={quickText}
              label={quickText}
              active={activeChip === quickText}
              onClick={() => handleToggleChip(quickText)}
            />
          ))}
        </div>
      </section>

      {/* 04 MATERIKU (Daftar materi dengan Comet Dial kecil) */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid rgba(143, 163, 191, 0.15)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              color: "var(--rn-accent)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            04 — Materiku
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6875rem",
              color: "var(--rn-muted)",
            }}
          >
            {materials.length} materi
          </span>
        </div>

        {/* Field tambah materi */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Field
            value={newMatTitle}
            onChange={(v) => {
              setNewMatTitle(v);
              if (matError) setMatError("");
            }}
            onSubmit={handleCreateMaterialFromField}
            placeholder="Tambah materi baru..."
            ariaLabel="Judul materi baru"
            error={matError}
            submitIcon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          />
        </div>

        {materials.length === 0 ? (
          <p style={{ color: "var(--rn-muted)", fontStyle: "italic", fontSize: "0.9rem" }}>
            Belum ada materi.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {materials.map((mat) => {
              const isExpanded = expandedMatId === mat.id;
              const terms = termsById[mat.id] ?? [];
              const doneTerms = terms.filter((t) => t.done).length;
              const matProgress = terms.length > 0 ? Math.round((doneTerms / terms.length) * 100) : 0;

              return (
                <div
                  key={mat.id}
                  style={{
                    borderBottom: "1px solid rgba(168, 159, 140, 0.15)",
                    padding: "0.5rem 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: 44,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedMatId(isExpanded ? null : mat.id)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.15rem",
                      }}
                    >
                      <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--rn-text)" }}>
                        {mat.title}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "0.65rem",
                          color: "var(--rn-muted)",
                        }}
                      >
                        {terms.length} istilah · {isExpanded ? "Tutup" : "Ketuk untuk detail"}
                      </span>
                    </button>

                    <div style={{ flexShrink: 0, marginLeft: "1rem" }}>
                      <CometDial value={matProgress} size={38} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: "1rem", paddingLeft: "0.5rem" }}>
                      <Checklist
                        title="Istilah / Checkpoint"
                        kind="term"
                        items={terms}
                        onToggle={async (id) => {
                          await toggleChecklistItem(id);
                          await refresh();
                        }}
                        onAdd={async (title) => {
                          await addChecklistItem("material", mat.id, "term", title);
                          await refresh();
                        }}
                        onDelete={async (id) => {
                          await deleteChecklistItem(id);
                          await refresh();
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
