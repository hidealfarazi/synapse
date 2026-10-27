/**
 * app/arsip/page.tsx — Arsip tugas
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { listAssignments, restoreAssignment, deleteAssignment } from "@/lib/repo";
import type { Assignment } from "@/lib/types";
import { subjectColor } from "@/lib/subjectColors";
import { PageHead } from "@/components/PageHead";
import { Button } from "@/components/ui/Button";

export default function ArsipPage() {
  const [archived, setArchived] = useState<Assignment[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const all = await listAssignments({ includeArchived: true });
    setArchived(all.filter((a) => a.archivedAt));
  }, []);

  useEffect(() => {
    let alive = true;
    listAssignments({ includeArchived: true }).then((all) => {
      if (alive) setArchived(all.filter((a) => a.archivedAt));
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleRestore = async (id: string) => {
    await restoreAssignment(id);
    await refresh();
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
        counter="04 / 04"
        section="ARSIP"
        title="Arsip"
        sub={`Tugas yang telah diarsipkan (${archived.length})`}
      />

      {archived.length === 0 ? (
        <div
          style={{
            padding: "3rem 1rem",
            textAlign: "center",
            border: "1px dashed rgba(143, 163, 191, 0.2)",
          }}
        >
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rn-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Arsip kosong
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--rn-muted)", marginTop: "0.5rem" }}>
            Tugas yang diselesaikan dan diarsipkan akan muncul di sini.
          </p>
        </div>
      ) : (
        <div role="list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {archived.map((item) => (
            <div
              key={item.id}
              role="listitem"
              style={{
                padding: "1.25rem 0",
                borderBottom: "1px solid rgba(168, 159, 140, 0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
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
                      color: "var(--rn-accent)",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.subject}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: "var(--rn-text)",
                    margin: "0.25rem 0",
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.65rem",
                    color: "var(--rn-muted)",
                  }}
                >
                  Diarsipkan: {new Date(item.archivedAt!).toLocaleDateString("id-ID")}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center" }}>
                {confirmDeleteId === item.id ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={async () => {
                        setConfirmDeleteId(null);
                        await deleteAssignment(item.id);
                        await refresh();
                      }}
                      style={{
                        padding: "0 0.85rem",
                        fontSize: "0.6875rem",
                      }}
                    >
                      Konfirmasi Hapus
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setConfirmDeleteId(null)}
                      style={{
                        padding: "0 0.75rem",
                        fontSize: "0.6875rem",
                      }}
                    >
                      Batal
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleRestore(item.id)}
                      style={{
                        padding: "0 0.85rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      Pulihkan
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setConfirmDeleteId(item.id)}
                      style={{
                        padding: "0 0.85rem",
                        fontSize: "0.75rem",
                        borderColor: "rgba(217, 119, 107, 0.35)",
                        color: "var(--rn-alert)",
                      }}
                    >
                      Hapus Permanen
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
