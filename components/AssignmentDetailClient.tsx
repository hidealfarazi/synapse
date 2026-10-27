/**
 * components/AssignmentDetailClient.tsx
 * Client wrapper for assignment detail page to manage dynamic checklist state.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Assignment, ChecklistItem } from "@/lib/types";
import Link from "next/link";
import {
  getAssignment,
  listChecklist,
  toggleChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
} from "@/lib/repo";
import { formatTime, formatDate } from "@/lib/mock";
import { subjectColor } from "@/lib/subjectColors";
import { CometDial } from "@/components/CometDial";
import { Checklist } from "@/components/Checklist";

export function AssignmentDetailClient({ id }: { id: string }) {
  // undefined = memuat, null = tidak ditemukan (atau bukan milik akun ini)
  const [assignment, setAssignment] = useState<Assignment | null | undefined>(undefined);
  const [items, setItems] = useState<ChecklistItem[]>([]);

  const refresh = useCallback(async () => {
    const [a, list] = await Promise.all([getAssignment(id), listChecklist("assignment", id)]);
    setAssignment(a ?? null);
    setItems(list);
  }, [id]);

  useEffect(() => {
    let alive = true;
    Promise.all([getAssignment(id), listChecklist("assignment", id)])
      .then(([a, list]) => {
        if (!alive) return;
        setAssignment(a ?? null);
        setItems(list);
      })
      .catch(() => {
        if (alive) setAssignment(null);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (assignment === undefined) {
    return <div aria-busy="true" style={{ minHeight: "100dvh" }} />;
  }

  if (assignment === null) {
    return (
      <div style={{ padding: "2rem 1.5rem", color: "var(--rn-text)", maxWidth: "36rem", margin: "0 auto" }}>
        <Link
          href="/pr"
          aria-label="Kembali ke PR"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            marginLeft: "-0.5rem",
            color: "var(--rn-text)",
            textDecoration: "none",
            marginBottom: "1rem",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <p style={{ color: "var(--rn-muted)" }}>Tugas tidak ditemukan.</p>
      </div>
    );
  }

  const handleToggle = async (itemId: string) => {
    await toggleChecklistItem(itemId);
    await refresh();
  };

  const handleAdd = async (kind: "step" | "bring", title: string) => {
    await addChecklistItem("assignment", id, kind, title);
    await refresh();
  };

  const handleDelete = async (itemId: string) => {
    await deleteChecklistItem(itemId);
    await refresh();
  };

  const steps = items.filter((c) => c.kind === "step");
  const brings = items.filter((c) => c.kind === "bring");
  const progress =
    steps.length > 0
      ? Math.round((steps.filter((s) => s.done).length / steps.length) * 100)
      : assignment.progress;

  const bringsDone = brings.filter((b) => b.done).length;

  return (
    <div
      style={{
        background: "transparent",
        color: "var(--rn-text)",
        minHeight: "100dvh",
        padding: "2rem 1.5rem 8.5rem",
        maxWidth: "36rem",
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <Link
          href="/pr"
          aria-label="Kembali ke PR"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            marginLeft: "-0.5rem",
            color: "var(--rn-text)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "2px",
              height: "0.75rem",
              backgroundColor: subjectColor(assignment.subject),
              borderRadius: "1px",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              color: "var(--rn-accent)",
              textTransform: "uppercase",
            }}
          >
            {assignment.subject}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 8vw, 2.75rem)", fontWeight: 800, lineHeight: 1.1 }}>
            {assignment.title}
          </h1>
        </div>
        <div style={{ flexShrink: 0 }}>
          <CometDial value={progress} size={160} />
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
          color: "var(--rn-muted)",
          marginBottom: "1rem",
        }}
      >
        {formatTime(assignment.dueAt)} · {formatDate(assignment.dueAt)} · {assignment.status}
      </p>

      {assignment.description && (
        <p style={{ lineHeight: 1.6, color: "var(--rn-muted)", marginBottom: "2rem" }}>
          {assignment.description}
        </p>
      )}

      {/* Langkah (kind step) */}
      <Checklist
        title="Langkah"
        kind="step"
        items={steps}
        onToggle={handleToggle}
        onAdd={(title) => handleAdd("step", title)}
        onDelete={handleDelete}
      />

      {/* Perlu disiapkan (kind bring) */}
      <Checklist
        title="Perlu disiapkan"
        kind="bring"
        items={brings}
        onToggle={handleToggle}
        onAdd={(title) => handleAdd("bring", title)}
        onDelete={handleDelete}
        summaryText={`${bringsDone}/${brings.length} siap`}
      />


    </div>
  );
}
