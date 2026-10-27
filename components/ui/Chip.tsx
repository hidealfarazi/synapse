/**
 * components/ui/Chip.tsx
 * Kontrol Chip/pilihan — untuk daftar quick-prompt atau filter.
 * Radius 12px, height 44px. Keadaan aktif: latar aksen 18%, border aksen.
 * Hover (hover-capable only): latar rgba(143,163,191,.12), border aksen .45.
 * Transisi 200ms ease-out. Focus-visible outline. Target sentuh >= 44px.
 */
"use client";

import React from "react";

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Chip({ label, active = false, onClick, disabled, "aria-label": ariaLabel }: ChipProps) {
  const [hovered, setHovered] = React.useState(false);

  const supportsHover =
    typeof window !== "undefined"
      ? window.matchMedia("(hover: hover)").matches
      : false;

  const dynamicStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    padding: "0 1rem",
    borderRadius: "12px",
    background: active
      ? "rgba(143, 163, 191, 0.18)"
      : supportsHover && hovered && !disabled
      ? "rgba(143, 163, 191, 0.12)"
      : "rgba(255, 255, 255, 0.04)",
    border: active
      ? "1px solid var(--rn-accent)"
      : supportsHover && hovered && !disabled
      ? "1px solid rgba(143, 163, 191, 0.45)"
      : "1px solid rgba(255, 255, 255, 0.12)",
    color: active ? "var(--rn-text)" : "var(--rn-muted)",
    fontFamily: "var(--font-body, sans-serif)",
    fontSize: "0.875rem",
    fontWeight: active ? 600 : 400,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "background 200ms ease-out, border-color 200ms ease-out, color 200ms ease-out",
    WebkitTapHighlightColor: "transparent",
    whiteSpace: "nowrap",
    userSelect: "none",
  };

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={onClick}
      style={dynamicStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </button>
  );
}
