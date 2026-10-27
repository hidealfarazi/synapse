/**
 * components/Checklist.tsx
 * Wraps SpringCheck list with add & delete item actions,
 * compliant with Task 4 and mobile 390px.
 */
"use client";

import { useState } from "react";
import { ChecklistItem, ChecklistKind } from "@/lib/types";
import { SpringCheck } from "@/components/SpringCheck";
import { Field } from "@/components/ui/Field";

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  title: string;
  kind: ChecklistKind;
  summaryText?: string;
}

export function Checklist({
  items,
  onToggle,
  onAdd,
  onDelete,
  title,
  kind,
  summaryText,
}: ChecklistProps) {
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim());
    setNewTitle("");
  };

  const doneCount = items.filter((i) => i.done).length;
  const headerSummary = summaryText ?? `${doneCount}/${items.length} selesai`;

  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
            letterSpacing: "0.12em",
            color: "var(--rn-muted)",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.7rem",
            color: "var(--rn-accent)",
          }}
        >
          {headerSummary}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {items.length === 0 ? (
          <p style={{ color: "var(--rn-muted)", fontStyle: "italic", fontSize: "0.9rem" }}>
            Belum ada item.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(168, 159, 140, 0.12)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <SpringCheck
                  label={item.title}
                  checked={item.done}
                  onChange={() => onToggle(item.id)}
                  ariaLabel={`Centang ${item.title}`}
                />
              </div>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label={`Hapus ${item.title}`}
                style={{
                  minHeight: 44,
                  minWidth: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--rn-muted)",
                  fontSize: "1rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add new item field */}
      <div style={{ marginTop: "1.25rem" }}>
        <Field
          value={newTitle}
          onChange={setNewTitle}
          onSubmit={(val) => {
            if (!val.trim()) return;
            onAdd(val.trim());
            setNewTitle("");
          }}
          placeholder={`Tambah ${title.toLowerCase()} baru…`}
          ariaLabel={`Tambah ${title.toLowerCase()} baru`}
          submitIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
