/**
 * components/TechText.tsx
 * Adapted from React Bits TechText — "Letter" reveal only, borderless.
 * Uses rn- tokens, inherits heading font, respects prefers-reduced-motion.
 */

"use client";

import { useEffect, useRef, useState } from "react";

interface TechTextProps {
  text: string;
  className?: string;
  fontSize?: string;
  letterSpacing?: string;
  fontWeight?: number;
}

export function TechText({
  text,
  className = "",
  fontSize,
  letterSpacing = "-0.05em",
  fontWeight = 600,
}: TechTextProps) {
  const [prefersReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prefersReduced) return;
    // Small delay for staggered reveal effect
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [prefersReduced]);

  if (prefersReduced) {
    return (
      <span className={className} style={{ fontWeight, fontSize, letterSpacing }}>
        {text}
      </span>
    );
  }

  const letters = text.split("");
  // Split into words for wrapping if needed, but animate per letter
  return (
    <span
      className={className}
      aria-label={text}
      style={{
        fontWeight,
        fontSize,
        letterSpacing,
        display: "inline-flex",
        flexWrap: "wrap",
        overflow: "hidden",
      }}
    >
      {letters.map((char, i) => {
        const isSpace = char === " ";
        return (
          <span
            key={`${char}-${i}`}
            aria-hidden="true"
            style={{
              display: "inline-block",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(100%)",
              transition: `opacity 400ms ease-out ${i * 40}ms, transform 400ms ease-out ${i * 40}ms`,
              color: "var(--rn-text)",
              // Handle space
              minWidth: isSpace ? "0.3em" : undefined,
            }}
          >
            {isSpace ? "\u00A0" : char}
          </span>
        );
      })}
    </span>
  );
}
