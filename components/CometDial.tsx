/**
 * components/CometDial.tsx
 * Adapted from React Bits CometDial for read-only progress display.
 * Complies with DESIGN.md (borderless, uses rn- tokens, mono font).
 */

"use client";

import React, { useEffect, useRef } from "react";

interface CometDialProps {
  value: number; // 0 to 100
  size?: number; // e.g. 44 for row, 160 for detail page
  className?: string;
}

export function CometDial({ value, size = 44, className = "" }: CometDialProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const strokeWidth = size > 60 ? 4 : 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        pointerEvents: "none", // Read-only: disable interaction
      }}
      aria-label={`Progress ${clamped}%`}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--rn-muted)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Progress fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--rn-accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: size > 60 ? `${Math.round(size * 0.22)}px` : "10px",
          color: "var(--rn-text)",
          fontWeight: 500,
          letterSpacing: "-0.04em",
        }}
      >
        {clamped}
      </div>
    </div>
  );
}
