/**
 * components/NextTaskBlock.tsx
 * Blok "Berikutnya": tugas paling mendesak + hitung mundur hidup (jam:menit),
 * diperbarui otomatis setiap menit.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAssignments } from "@/lib/repo";
import { subjectColor } from "@/lib/subjectColors";
import { formatTime } from "@/lib/mock";
import type { Assignment } from "@/lib/types";

export function NextTaskBlock() {
  const [items, setItems] = useState<Assignment[]>([]);

  useEffect(() => {
    let alive = true;
    listAssignments().then((all) => {
      if (alive) setItems(all.filter((a) => !a.archivedAt));
    });
    return () => {
      alive = false;
    };
  }, []);
  const [now, setNow] = useState<Date>(() => new Date());

  // Update tiap menit (60 detik)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Ambil tugas yang paling mendesak
  const mostUrgent = useMemo(() => {
    if (items.length === 0) return null;
    const sorted = [...items].sort(
      (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
    );
    return sorted[0];
  }, [items]);

  if (!mostUrgent) return null;

  const due = new Date(mostUrgent.dueAt).getTime();
  const diffMs = due - now.getTime();
  const isOverdue = diffMs < 0;

  let countdownText = "";
  let countdownColor = "var(--rn-accent)";

  if (isOverdue) {
    const overdueMins = Math.floor(Math.abs(diffMs) / 60000);
    const hrs = Math.floor(overdueMins / 60);
    const mins = overdueMins % 60;
    countdownText = `LEWAT ${hrs > 0 ? `${hrs}J ` : ""}${mins}M`;
    countdownColor = "var(--rn-alert)";
  } else {
    const totalMins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    countdownText = `TERSISA ${hrs > 0 ? `${hrs}J ` : ""}${mins}M`;
    if (totalMins < 60) {
      countdownColor = "var(--rn-alert)";
    } else if (totalMins < 240) {
      countdownColor = "var(--rn-amber)";
    }
  }

  return (
    <section
      aria-label="Tugas Berikutnya"
      style={{
        padding: "1.25rem 0",
        borderTop: "1px solid rgba(143, 163, 191, 0.15)",
        borderBottom: "1px solid rgba(143, 163, 191, 0.15)",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            letterSpacing: "0.15em",
            color: "var(--rn-muted)",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Berikutnya
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            color: countdownColor,
            fontWeight: 700,
          }}
        >
          {countdownText}
        </span>
      </div>

      <Link
        href={`/pr/${mostUrgent.id}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
          textDecoration: "none",
          color: "inherit",
          minHeight: 44,
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "2px",
              height: "0.75rem",
              backgroundColor: subjectColor(mostUrgent.subject),
              borderRadius: "1px",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6875rem",
              letterSpacing: "0.1em",
              color: countdownColor,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {mostUrgent.subject} · {formatTime(new Date(mostUrgent.dueAt))}
          </span>
        </div>

        <p
          style={{
            fontSize: "1.25rem",
            fontWeight: 800,
            lineHeight: 1.25,
            color: "var(--rn-text)",
            letterSpacing: "-0.01em",
          }}
        >
          {mostUrgent.title}
        </p>
      </Link>
    </section>
  );
}
