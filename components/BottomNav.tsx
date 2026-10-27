/**
 * components/BottomNav.tsx
 * Floating dock navbar for mobile (<1024px) and left sidebar rail for desktop (>=1024px).
 * Custom thin SVG icons, sliding 2px active indicator, zero focus ring boxes,
 * and slide-over sheet for "Lainnya" (Archive, Materials, Rain Toggle, Settings).
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";

export function BottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [rainEnabled, setRainEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("rn_rain_enabled");
    if (saved !== null) setRainEnabled(saved === "true");
  }, []);

  const toggleRain = () => {
    const next = !rainEnabled;
    setRainEnabled(next);
    localStorage.setItem("rn_rain_enabled", String(next));
    window.dispatchEvent(new Event("rn_rain_toggle"));
  };

  // Halaman masuk tidak punya navigasi.
  if (pathname === "/login") return null;

  const navs = [
    { href: "/", label: "Hari Ini", icon: "sun" },
    { href: "/pr", label: "PR", icon: "check" },
    { href: "/belajar", label: "Belajar", icon: "book" },
    { href: "#more", label: "Lainnya", icon: "menu", isMore: true },
  ];

  return (
    <>
      {/* Mobile Floating Dock (<1024px) */}
      <nav
        aria-label="Navigasi utama"
        className="mobile-dock"
        style={{
          position: "fixed",
          bottom: "1.25rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(92vw, 420px)",
          height: "64px",
          background: "rgba(11, 13, 16, 0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(143, 163, 191, 0.15)",
          borderRadius: "32px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 100,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {navs.map((n) => {
          const isActive = !n.isMore && pathname === n.href;
          const isMoreActive = n.isMore && sheetOpen;

          return n.isMore ? (
            <button
              key={n.label}
              onClick={() => setSheetOpen(true)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.2rem",
                flex: 1,
                height: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: isMoreActive ? "var(--rn-accent)" : "var(--rn-muted)",
                position: "relative",
                outline: "none",
              }}
              aria-label="Menu Lainnya"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {n.label}
              </span>
              {(isMoreActive) && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    width: "16px",
                    height: "2px",
                    background: "var(--rn-accent)",
                    borderRadius: "1px",
                  }}
                />
              )}
            </button>
          ) : (
            <Link
              key={n.href}
              href={n.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.2rem",
                flex: 1,
                height: "100%",
                color: isActive ? "var(--rn-accent)" : "var(--rn-muted)",
                textDecoration: "none",
                position: "relative",
                outline: "none",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {n.icon === "sun" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                  <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                  <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
                </svg>
              )}
              {n.icon === "check" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              )}
              {n.icon === "book" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              )}
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {n.label}
              </span>
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    width: "16px",
                    height: "2px",
                    background: "var(--rn-accent)",
                    borderRadius: "1px",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Desktop Left Rail (>=1024px) */}
      <aside
        className="desktop-rail"
        aria-label="Navigasi samping"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "80px",
          background: "var(--rn-bg)",
          borderRight: "1px solid rgba(143, 163, 191, 0.15)",
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "2.5rem",
          gap: "2rem",
          zIndex: 100,
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700, color: "var(--rn-accent)" }}>
          B
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", alignItems: "center" }}>
          {navs.map((n) => {
            const isActive = !n.isMore && pathname === n.href;
            const isMoreActive = n.isMore && sheetOpen;
            return n.isMore ? (
              <button
                key={n.label}
                onClick={() => setSheetOpen(true)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.3rem",
                  color: isMoreActive ? "var(--rn-accent)" : "var(--rn-muted)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  width: "100%",
                }}
                title={n.label}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase" }}>{n.label}</span>
              </button>
            ) : (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.3rem",
                  color: isActive ? "var(--rn-accent)" : "var(--rn-muted)",
                  textDecoration: "none",
                  padding: "0.5rem",
                  width: "100%",
                  position: "relative",
                }}
                title={n.label}
              >
                {n.icon === "sun" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <line x1="12" y1="2" x2="12" y2="4" />
                    <line x1="12" y1="20" x2="12" y2="22" />
                    <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                    <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                    <line x1="2" y1="12" x2="4" y2="12" />
                    <line x1="20" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                    <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
                  </svg>
                )}
                {n.icon === "check" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                )}
                {n.icon === "book" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                )}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase" }}>{n.label}</span>
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: "2px",
                      background: "var(--rn-accent)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Media query styling for desktop rail vs mobile dock */}
      <style>{`
        @media (min-width: 1024px) {
          .mobile-dock { display: none !important; }
          .desktop-rail { display: flex !important; }
          body { padding-left: 80px; }
        }
      `}</style>

      {/* Slide-over Sheet for "Lainnya" */}
      {sheetOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSheetOpen(false)}
        >
          <div
            style={{
              width: "min(380px, 85vw)",
              height: "100%",
              background: "#0B0D10",
              borderLeft: "1px solid rgba(143, 163, 191, 0.15)",
              padding: "2.5rem 2rem",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.15em", color: "var(--rn-muted)", textTransform: "uppercase" }}>
                04 / 04 — LAINNYA
              </span>
              <button
                onClick={() => setSheetOpen(false)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1rem",
                  color: "var(--rn-text)",
                  padding: "0.5rem",
                  cursor: "pointer",
                }}
                aria-label="Tutup menu"
              >
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Menu & Alat</h2>

            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link
                href="/arsip"
                onClick={() => setSheetOpen(false)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 0",
                  borderBottom: "1px solid rgba(168, 159, 140, 0.2)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <span>Arsip Tugas</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--rn-muted)" }}>→</span>
              </Link>
              <Link
                href="/belajar"
                onClick={() => setSheetOpen(false)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 0",
                  borderBottom: "1px solid rgba(168, 159, 140, 0.2)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <span>Materi Belajar</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--rn-muted)" }}>→</span>
              </Link>
            </nav>

            {/* Atmosphere toggle */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 0",
                borderBottom: "1px solid rgba(168, 159, 140, 0.2)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Atmosfer Hujan</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--rn-muted)", marginTop: "0.2rem" }}>
                  Hujan latar: hero & halaman lain
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={rainEnabled}
                aria-label="Atmosfer Hujan"
                onClick={toggleRain}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minHeight: "44px",
                  padding: "0.25rem 0.85rem",
                  borderRadius: "22px",
                  background: rainEnabled ? "rgba(143, 163, 191, 0.18)" : "rgba(255, 255, 255, 0.04)",
                  border: rainEnabled ? "1px solid var(--rn-accent)" : "1px solid rgba(255, 255, 255, 0.12)",
                  color: rainEnabled ? "var(--rn-accent)" : "var(--rn-muted)",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "background 200ms ease-out, border-color 200ms ease-out, color 200ms ease-out",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: rainEnabled ? "var(--rn-accent)" : "var(--rn-muted)",
                    display: "inline-block",
                  }}
                />
                {rainEnabled ? "Nyala" : "Mati"}
              </button>
            </div>

            <AccountPanel />

            <div style={{ marginTop: "auto", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--rn-muted)" }}>
              Belajar v0.1.0 · P0 Polish
            </div>
          </div>
        </div>
      )}
    </>
  );
}
