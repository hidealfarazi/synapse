/**
 * components/ui/Field.tsx
 * Kontrol input terpadu — wadah tinggi 52px, radius 12px, tombol kirim ikon bulat di dalam.
 * Input transparan, placeholder muted, caret aksen, enterKeyHint="send", autoComplete="off".
 * :focus-within → border aksen + ring rgba(143,163,191,.18).
 * Tombol kirim 36px radius 10px — nonaktif saat input kosong.
 * Beri aria-label (label tersembunyi), bukan hanya placeholder.
 * Pesan validasi/error opsional di bawah kolom.
 */
"use client";

import React, { useId } from "react";

interface FieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  submitIcon?: React.ReactNode;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export function Field({
  value,
  onChange,
  onSubmit,
  placeholder = "",
  ariaLabel,
  submitIcon,
  disabled = false,
  error,
  autoFocus,
}: FieldProps) {
  const [focused, setFocused] = React.useState(false);
  const id = useId();
  const isEmpty = value.trim().length === 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isEmpty && !disabled) {
      e.preventDefault();
      onSubmit(value.trim());
    }
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    height: "52px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.04)",
    border: focused
      ? "1px solid var(--rn-accent)"
      : error
      ? "1px solid var(--rn-alert)"
      : "1px solid rgba(255, 255, 255, 0.12)",
    padding: "0 6px 0 16px",
    boxShadow: focused ? "0 0 0 3px rgba(143, 163, 191, 0.18)" : "none",
    transition: "border-color 200ms ease-out, box-shadow 200ms ease-out",
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--rn-text)",
    fontFamily: "var(--font-body, sans-serif)",
    fontSize: "1rem",
    caretColor: "var(--rn-accent)",
    minWidth: 0,
  };

  const btnStyle: React.CSSProperties = {
    flexShrink: 0,
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: isEmpty || disabled
      ? "rgba(255, 255, 255, 0.06)"
      : "var(--rn-accent)",
    border: "none",
    color: isEmpty || disabled ? "var(--rn-muted)" : "var(--rn-bg)",
    cursor: isEmpty || disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 200ms ease-out, color 200ms ease-out",
    opacity: isEmpty || disabled ? 0.5 : 1,
  };

  return (
    <div>
      {/* Label tersembunyi — aksesibilitas */}
      <label htmlFor={id} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
        {ariaLabel}
      </label>

      <div style={containerStyle}>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          enterKeyHint="send"
          autoComplete="off"
          disabled={disabled}
          autoFocus={autoFocus}
          style={inputStyle}
        />
        <button
          type="button"
          aria-label="Kirim"
          disabled={isEmpty || disabled}
          onClick={() => {
            if (!isEmpty && !disabled) onSubmit(value.trim());
          }}
          style={btnStyle}
        >
          {submitIcon ?? (isEmpty ? <PlusIcon /> : <SendIcon />)}
        </button>
      </div>

      {/* Pesan error/validasi di bawah kolom */}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            color: "var(--rn-alert)",
            marginTop: "0.4rem",
            letterSpacing: "0.04em",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
