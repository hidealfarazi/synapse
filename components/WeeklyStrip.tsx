/**
 * components/WeeklyStrip.tsx
 * Strip 7 hari (Sen-Min) berisi jumlah tenggat per hari.
 * Format angka mono kecil / titik; hari ini ditandai garis bawah 2px.
 * Tanpa kotak/kartu (borderless).
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Assignment } from "@/lib/types";
import { listAssignments } from "@/lib/repo";

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function WeeklyStrip() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    let alive = true;
    listAssignments().then((all) => {
      if (alive) setAssignments(all.filter((a) => !a.archivedAt));
    });
    return () => {
      alive = false;
    };
  }, []);

  const days = useMemo(() => {
    const now = new Date();
    // 0 = Sen, 6 = Min
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);

    return DAY_LABELS.map((label, index) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
      const isToday = d.toDateString() === now.toDateString();

      const count = assignments.filter((a) => {
        const due = new Date(a.dueAt);
        return (
          due.getFullYear() === d.getFullYear() &&
          due.getMonth() === d.getMonth() &&
          due.getDate() === d.getDate()
        );
      }).length;

      return {
        label,
        dateNumber: d.getDate(),
        isToday,
        count,
      };
    });
  }, [assignments]);

  return (
    <div
      style={{
        marginTop: "1rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid rgba(143, 163, 191, 0.15)",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            color: "var(--rn-muted)",
            textTransform: "uppercase",
          }}
        >
          Strip Mingguan
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            color: "var(--rn-muted)",
          }}
        >
          Sen — Min
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0.25rem",
          alignItems: "flex-end",
          textAlign: "center",
        }}
      >
        {days.map((d) => (
          <div
            key={d.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "44px",
              gap: "0.35rem",
              paddingBottom: "0.45rem",
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.625rem",
                letterSpacing: "0.06em",
                color: d.isToday ? "var(--rn-text)" : "var(--rn-muted)",
                fontWeight: d.isToday ? 700 : 400,
                textTransform: "uppercase",
              }}
            >
              {d.label}
            </span>

            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
                color:
                  d.count > 0
                    ? d.isToday
                      ? "var(--rn-amber)"
                      : "var(--rn-text)"
                    : "rgba(139, 147, 160, 0.35)",
                fontWeight: d.count > 0 ? 700 : 400,
              }}
            >
              {d.count > 0 ? d.count : "·"}
            </span>

            {/* Garis bawah 2px penanda hari ini (tanpa kotak) */}
            {d.isToday && (
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "16px",
                  height: "2px",
                  background: "var(--rn-accent)",
                  borderRadius: "1px",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
