/**
 * components/MaterialList.tsx
 * Client component for Belajar (/belajar) page: Material list + term checklist.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listMaterials,
  createMaterial,
  listChecklist,
  toggleChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
} from "@/lib/repo";
import type { ChecklistItem, Material } from "@/lib/types";
import { Checklist } from "@/components/Checklist";
import { Field } from "@/components/ui/Field";

export function MaterialList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [termsById, setTermsById] = useState<Record<string, ChecklistItem[]>>({});
  const [newTitle, setNewTitle] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const list = await listMaterials();
    const entries = await Promise.all(list.map(async (m) => [m.id, await listChecklist("material", m.id)] as const));
    setMaterials(list);
    setTermsById(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await listMaterials();
      const entries = await Promise.all(list.map(async (m) => [m.id, await listChecklist("material", m.id)] as const));
      if (!alive) return;
      setMaterials(list);
      setTermsById(Object.fromEntries(entries));
    })().catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const refresh = load;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createMaterial(newTitle.trim());
    setNewTitle("");
    await refresh();
  };

  return (
    <div>
      {/* Field tambah materi */}
      <div style={{ marginBottom: "2.25rem" }}>
        <Field
          value={newTitle}
          onChange={setNewTitle}
          onSubmit={async (val) => {
            if (!val.trim()) return;
            await createMaterial(val.trim());
            setNewTitle("");
            await refresh();
          }}
          placeholder="Tambah materi baru…"
          ariaLabel="Judul materi baru"
          submitIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        />
      </div>

      {/* Daftar materi */}
      {materials.length === 0 ? (
        <div
          style={{
            padding: "3rem 1rem",
            textAlign: "center",
            border: "1px dashed rgba(143, 163, 191, 0.2)",
            marginTop: "1rem",
          }}
        >
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rn-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Belum ada materi belajar
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--rn-muted)", marginTop: "0.5rem" }}>
            Tulis judul di atas untuk mulai mencatat istilah dan checkpoint.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {materials.map((mat) => {
            const isExpanded = expandedId === mat.id;
            const terms = termsById[mat.id] ?? [];

            return (
              <div
                key={mat.id}
                style={{
                  borderBottom: "1px solid rgba(168, 159, 140, 0.15)",
                  padding: "0.75rem 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : mat.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem 0",
                    minHeight: 44,
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "var(--rn-text)",
                      textAlign: "left",
                    }}
                  >
                    {mat.title}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.7rem",
                      color: "var(--rn-muted)",
                      flexShrink: 0,
                      marginLeft: "1rem",
                    }}
                  >
                    {isExpanded ? "Tutup" : `${terms.length} istilah`}
                  </span>
                </button>

                {isExpanded && (
                  <div style={{ marginTop: "1rem", paddingLeft: "0.25rem" }}>
                    <Checklist
                      title="Istilah / Checkpoint"
                      kind="term"
                      items={terms}
                      onToggle={async (itemId) => {
                        await toggleChecklistItem(itemId);
                        await refresh();
                      }}
                      onAdd={async (title) => {
                        await addChecklistItem("material", mat.id, "term", title);
                        await refresh();
                      }}
                      onDelete={async (itemId) => {
                        await deleteChecklistItem(itemId);
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
    </div>
  );
}
