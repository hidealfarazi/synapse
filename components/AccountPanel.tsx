/**
 * components/AccountPanel.tsx
 * Baris akun: email yang sedang login + tombol Keluar. Dipakai di menu Lainnya dan halaman /more.
 */
"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";

export function AccountPanel() {
  const { user, ready, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!ready || !user) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "1rem 0",
        borderBottom: "1px solid rgba(168, 159, 140, 0.2)",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Akun</div>
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            color: "var(--rn-muted)",
            marginTop: "0.2rem",
            overflowWrap: "anywhere",
          }}
        >
          {user.email ?? "Tanpa email"}
        </div>
      </div>
      <div>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await signOut();
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Keluar…" : "Keluar"}
        </Button>
      </div>
    </div>
  );
}
