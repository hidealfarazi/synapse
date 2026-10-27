/**
 * components/AssignmentList.tsx
 * Client list: Grouped by Terlambat, Hari Ini, Besok, Minggu Ini.
 * Sorted by dueAt ascending. Overdue has distinct alert badge.
 * Most urgent item has larger focal title.
 * Real date logic: tasks whose time has passed today move to "Terlambat".
 */
"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  listAssignments,
  archiveAssignment,
  deleteAssignment,
} from "@/lib/repo";
import { formatTime, minutesUntil } from "@/lib/mock";
import { subjectColor } from "@/lib/subjectColors";
import type { Assignment } from "@/lib/types";
import { CometDial } from "@/components/CometDial";
import { SwipeRow } from "@/components/SwipeRow";
import { Button } from "@/components/ui/Button";

// repo.recalculateAssignmentProgress selalu menyimpan progres terbaru di data tugas,
// jadi cukup dibaca langsung (tanpa 1 query checklist per baris).
function progressOf(item: Assignment): number {
  return item.progress;
}

interface GroupedAssignments {
  label: string;
  badge?: string;
  isOverdue?: boolean;
  items: Assignment[];
}

export function AssignmentList() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<Assignment | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    const all = await listAssignments();
    setItems(all.filter((a) => !a.archivedAt));
    setLoaded(true);
  }, []);

  useEffect(() => {
    let alive = true;
    listAssignments()
      .then((all) => {
        if (!alive) return;
        setItems(all.filter((a) => !a.archivedAt));
        setLoaded(true);
      })
      .catch(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleArchive = async (id: string) => {
    if (pending?.id === id) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      setPending(null);
    }
    await archiveAssignment(id);
    await refresh();
  };

  const handleDeleteRequest = (item: Assignment) => {
    if (pending && pending.id !== item.id) {
      void deleteAssignment(pending.id);
    }
    if (timerRef.current) clearTimeout(timerRef.current);

    setItems((prev) => prev.filter((a) => a.id !== item.id));
    setPending(item);
    timerRef.current = setTimeout(async () => {
      timerRef.current = null;
      setPending(null);
      await deleteAssignment(item.id);
      await refresh();
    }, 5000);
  };

  const handleUndo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPending(null);
    void refresh();
  };

  // Group items by: Terlambat, Hari Ini, Besok, Minggu Ini
  const groups = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfTomorrow = startOfToday + 86400000;
    const startOfDayAfterTomorrow = startOfTomorrow + 86400000;
    const endOfWeek = startOfToday + 7 * 86400000;

    const overdue: Assignment[] = [];
    const today: Assignment[] = [];
    const tomorrow: Assignment[] = [];
    const thisWeek: Assignment[] = [];

    // Sort by dueAt ascending
    const sorted = [...items].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

    for (const item of sorted) {
      const due = new Date(item.dueAt).getTime();
      if (due < now.getTime()) {
        overdue.push(item);
      } else if (due < startOfTomorrow) {
        today.push(item);
      } else if (due < startOfDayAfterTomorrow) {
        tomorrow.push(item);
      } else if (due < endOfWeek) {
        thisWeek.push(item);
      } else {
        thisWeek.push(item);
      }
    }

    const res: GroupedAssignments[] = [];
    if (overdue.length > 0) {
      res.push({ label: "Terlambat", isOverdue: true, items: overdue });
    }
    if (today.length > 0) {
      res.push({ label: "Hari ini", items: today });
    }
    if (tomorrow.length > 0) {
      res.push({ label: "Besok", items: tomorrow });
    }
    if (thisWeek.length > 0) {
      res.push({ label: "Minggu ini", items: thisWeek });
    }

    return res;
  }, [items]);

  // The very first active task is the most urgent focal point
  const mostUrgentId = useMemo(() => {
    const sorted = [...items].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    return sorted[0]?.id;
  }, [items]);

  let globalIndex = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {!loaded ? null : items.length === 0 && !pending ? (
        <p style={{ color: "var(--rn-muted)", fontStyle: "italic" }}>
          Belum ada tugas aktif.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.label} aria-labelledby={`group-${group.label}`}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid rgba(143, 163, 191, 0.15)",
                marginBottom: "0.5rem",
              }}
            >
              <h2
                id={`group-${group.label}`}
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: group.isOverdue ? "var(--rn-alert)" : "var(--rn-muted)",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {group.label}
              </h2>
              {group.badge && (
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.625rem",
                    padding: "0.15rem 0.4rem",
                    background: "rgba(217, 119, 107, 0.15)",
                    color: "var(--rn-alert)",
                    border: "1px solid var(--rn-alert)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                  }}
                >
                  {group.badge}
                </span>
              )}
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.6875rem",
                  color: "var(--rn-muted)",
                  marginLeft: "auto",
                }}
              >
                {group.items.length}
              </span>
            </div>

            <div role="list">
              {group.items.map((item) => {
                const currentIndex = globalIndex++;
                const mins = minutesUntil(new Date(item.dueAt));
                const isOverdue = mins < 0;
                const isAlert = !isOverdue && mins < 60;
                const isAmber = !isOverdue && mins >= 60 && mins < 240;
                const statusColor = isOverdue
                  ? "var(--rn-alert)"
                  : isAlert
                  ? "var(--rn-alert)"
                  : isAmber
                  ? "var(--rn-amber)"
                  : "var(--rn-accent)";
                const progress = progressOf(item);
                const isFocal = item.id === mostUrgentId;

                return (
                  <div key={item.id} role="listitem">
                    <SwipeRow
                      ariaLabel={`Tugas ${item.title}`}
                      isFirst={currentIndex === 0}
                      onArchive={() => handleArchive(item.id)}
                      onDelete={() => handleDeleteRequest(item)}
                    >
                      <Link
                        href={`/pr/${item.id}`}
                        style={{
                          display: "block",
                          padding: isFocal ? "1.5rem 0" : "1.25rem 0",
                          borderBottom: "1px solid rgba(168, 159, 140, 0.2)",
                          textDecoration: "none",
                          color: "inherit",
                          maxWidth: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "1rem",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                                marginBottom: "0.4rem",
                                gap: "0.75rem",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <span
                                  aria-hidden="true"
                                  style={{
                                    display: "inline-block",
                                    width: "2px",
                                    height: "0.75rem",
                                    backgroundColor: subjectColor(item.subject),
                                    borderRadius: "1px",
                                    flexShrink: 0,
                                  }}
                                />
                                <span
                                  style={{
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontSize: "0.6875rem",
                                    letterSpacing: "0.1em",
                                    color: isOverdue ? "var(--rn-muted)" : statusColor,
                                    textTransform: "uppercase",
                                    fontWeight: 500,
                                  }}
                                >
                                  {item.subject}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono, monospace)",
                                  fontSize: "0.6875rem",
                                  color: statusColor,
                                  letterSpacing: "0.05em",
                                  flexShrink: 0,
                                  fontWeight: isOverdue ? 700 : 400,
                                }}
                              >
                                {formatTime(new Date(item.dueAt))}
                              </span>
                            </div>
                            <p
                              style={{
                                fontFamily: "var(--font-display, var(--font-body, sans-serif))",
                                fontSize: isFocal ? "1.375rem" : "1.125rem",
                                fontWeight: isFocal ? 800 : 700,
                                lineHeight: 1.25,
                                color: "var(--rn-text)",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {item.title}
                            </p>
                          </div>
                          <div style={{ flexShrink: 0, marginTop: "0.2rem" }}>
                            <CometDial value={progress} size={isFocal ? 52 : 44} />
                          </div>
                        </div>
                      </Link>
                    </SwipeRow>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* Undo toast */}
      {pending && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            left: "1rem",
            right: "1rem",
            bottom: "5.5rem",
            maxWidth: "34rem",
            margin: "0 auto",
            background: "var(--rn-text)",
            color: "#0B0D10",
            padding: "0.875rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            zIndex: 150,
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Tugas dihapus.</span>
          <Button
            variant="secondary"
            onClick={handleUndo}
            style={{
              background: "rgba(11, 13, 16, 0.12)",
              borderColor: "rgba(11, 13, 16, 0.25)",
              color: "#0B0D10",
              minHeight: "36px",
              height: "36px",
              padding: "0 0.85rem",
              fontSize: "0.75rem",
            }}
          >
            Urungkan
          </Button>
        </div>
      )}
    </div>
  );
}
