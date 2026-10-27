/**
 * components/SpringCheck.tsx
 * Adapted from React Bits SpringCheck — borderless version.
 * Square sharp box, rn- tokens only, spring tick animation,
 * strikethrough label when checked, min 44px touch, reduced-motion safe.
 */
"use client";

import { motion, useReducedMotion } from "motion/react";

interface SpringCheckProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
}

const TICK_PATH = "M5 12.5l4.5 4.5L19 7.5";

export function SpringCheck({ label, checked, onChange, ariaLabel }: SpringCheckProps) {
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        minHeight: 44,
        width: "100%",
        padding: "10px 0",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        color: "var(--rn-text)",
      }}
    >
      {reduce ? (
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: 26,
            height: 26,
            borderRadius: 0,
            border: `1.5px solid ${checked ? "var(--rn-accent)" : "var(--rn-muted)"}`,
            background: checked ? "var(--rn-accent)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {checked && (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d={TICK_PATH} stroke="#0B0D10" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      ) : (
        <motion.span
          aria-hidden="true"
          key={String(checked)}
          initial={{ scale: checked ? 0.6 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 17 }}
          style={{
            flexShrink: 0,
            width: 26,
            height: 26,
            borderRadius: 0,
            border: `1.5px solid ${checked ? "var(--rn-accent)" : "var(--rn-muted)"}`,
            background: checked ? "var(--rn-accent)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {checked && (
            <motion.svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <motion.path
                d={TICK_PATH}
                stroke="#12100E"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              />
            </motion.svg>
          )}
        </motion.span>
      )}

      <span
        style={{
          flex: 1,
          fontSize: "1rem",
          lineHeight: 1.5,
          color: "var(--rn-text)",
          textDecoration: checked ? "line-through" : "none",
          opacity: checked ? 0.55 : 1,
          transition: reduce ? "none" : "opacity 200ms ease-out",
        }}
      >
        {label}
      </span>
    </button>
  );
}
