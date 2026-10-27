/**
 * components/SwipeRow.tsx
 * Swipe row without permanent "AKSI" label.
 * On first mount, gives a subtle one-time nudge hint if stored in localStorage.
 * On desktop hover/focus, reveals action buttons or dots.
 */
"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface SwipeRowProps {
  children: React.ReactNode;
  onArchive?: () => void;
  onDelete?: () => void;
  ariaLabel?: string;
  isFirst?: boolean;
}

const ACTION_W = 76;
const THRESHOLD = 35;

export function SwipeRow({ children, onArchive, onDelete, ariaLabel = "Baris tugas", isFirst = false }: SwipeRowProps) {
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxOffset = -(ACTION_W * 2);

  // One-time gesture hint nudge for first row (skipped under reduced motion)
  useEffect(() => {
    if (isFirst && typeof window !== "undefined") {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const shown = localStorage.getItem("rn_swipe_hint_shown");
      if (!shown) {
        localStorage.setItem("rn_swipe_hint_shown", "true");
        const t1 = setTimeout(() => setOffset(-40), 600);
        const t2 = setTimeout(() => setOffset(0), 1200);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }
  }, [isFirst]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      setOffset(next ? maxOffset : 0);
      return next;
    });
  }, [maxOffset]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startX.current = e.clientX;
    dragging.current = false;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      if (Math.abs(dx) > 5) dragging.current = true;
      let next = 0;
      if (open) {
        next = maxOffset + dx;
      } else {
        next = Math.min(0, dx);
      }
      next = Math.max(maxOffset, Math.min(0, next));
      setOffset(next);
    },
    [open, maxOffset]
  );

  const snap = useCallback(
    (finalOffset: number) => {
      const shouldOpen = finalOffset < -THRESHOLD;
      setOpen(shouldOpen);
      setOffset(shouldOpen ? maxOffset : 0);
      startX.current = null;
    },
    [maxOffset]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (startX.current === null) return;
      snap(offset);
    },
    [offset, snap]
  );

  return (
    <div
      ref={containerRef}
      className="swipe-row-container"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "transparent",
        borderRadius: 0,
        touchAction: "pan-y",
      }}
      aria-label={ariaLabel}
    >
      {/* Action drawer behind */}
      <div
        aria-hidden={!open && offset === 0}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "stretch",
          pointerEvents: open ? "auto" : "none",
          opacity: open || offset !== 0 ? 1 : 0,
          visibility: open || offset !== 0 ? "visible" : "hidden",
          transition: "opacity 150ms ease-out, visibility 150ms",
        }}
      >
        <button
          onClick={() => {
            setOpen(false);
            setOffset(0);
            onArchive?.();
          }}
          style={{
            width: ACTION_W,
            background: "#2563EB",
            color: "#FFFFFF",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Arsipkan tugas"
        >
          Arsip
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setOffset(0);
            onDelete?.();
          }}
          style={{
            width: ACTION_W,
            background: "#DC2626",
            color: "#FFFFFF",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Hapus tugas"
        >
          Hapus
        </button>
      </div>

      {/* Foreground row */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "relative",
          background: "transparent",
          transform: `translateX(${offset}px)`,
          transition: dragging.current ? "none" : "transform 200ms ease-out",
          display: "flex",
          alignItems: "stretch",
          minHeight: 44,
          zIndex: 2,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        {/* Desktop-only action trigger button: hidden on touch / default, visible on hover/focus */}
        <button
          className="desktop-trigger"
          onClick={handleToggle}
          aria-label={open ? "Tutup opsi tugas" : "Buka opsi tugas"}
          aria-expanded={open}
          style={{
            flexShrink: 0,
            width: 44,
            minHeight: 44,
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            color: open ? "var(--rn-text)" : "var(--rn-muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      {/* Desktop hover/focus reveal button style */}
      <style>{`
        @media (hover: hover) and (min-width: 768px) {
          .swipe-row-container .desktop-trigger {
            display: flex !important;
            opacity: 0;
            transition: opacity 150ms ease-in-out;
          }
          .swipe-row-container:hover .desktop-trigger,
          .swipe-row-container:focus-within .desktop-trigger {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
