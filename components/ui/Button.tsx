/**
 * components/ui/Button.tsx
 * Kontrol tombol bersama — variant primary dan secondary.
 * Radius 12px, token warna rn-, accessible, reduced-motion safe.
 *
 * Seluruh style variant, hover (@media (hover: hover)), active, dan disabled
 * dipindahkan ke class (.rn-btn, .rn-btn-primary, .rn-btn-secondary) dan
 * data-attribute (data-variant) di app/globals.css tanpa inline style border/borderColor.
 */
"use client";

import React from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  href?: string;
}

export function Button({
  variant = "primary",
  children,
  className,
  style,
  disabled,
  href,
  ...rest
}: ButtonProps) {
  const combinedClassName = ["rn-btn", `rn-btn-${variant}`, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClassName}
        data-variant={variant}
        aria-disabled={disabled}
        style={style}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={rest.type ?? "button"}
      disabled={disabled}
      className={combinedClassName}
      data-variant={variant}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
}
