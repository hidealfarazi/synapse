/**
 * components/LoginForm.tsx
 * Masuk / daftar dengan email + kata sandi (Supabase Auth). Gaya sama dengan form lain:
 * label mono, kolom 52px radius 12px, tombol primer, konten tanpa kartu.
 */
"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { PageHead } from "@/components/PageHead";
import { Button } from "@/components/ui/Button";

type Mode = "masuk" | "daftar";

function friendlyError(err: { code?: string; message?: string }): string {
  switch (err.code) {
    case "invalid_credentials":
      return "Email atau kata sandi salah.";
    case "email_not_confirmed":
      return "Email belum dikonfirmasi. Cek kotak masukmu.";
    case "user_already_exists":
    case "email_exists":
      return "Email ini sudah terdaftar. Coba masuk.";
    case "weak_password":
      return "Kata sandi terlalu lemah. Pakai minimal 8 karakter.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Terlalu sering mencoba. Tunggu sebentar lalu ulangi.";
    case "signup_disabled":
      return "Pendaftaran akun baru sedang dimatikan.";
  }
  if (err.message?.toLowerCase().includes("fetch")) return "Tidak bisa terhubung. Periksa koneksi internetmu.";
  return "Terjadi kesalahan. Coba lagi.";
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.75rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--rn-muted)",
};

function AuthField(props: {
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  inputMode?: "email";
  trailing?: React.ReactNode;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label htmlFor={id} style={labelStyle}>
        {props.label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 52,
          borderRadius: 12,
          background: "rgba(255, 255, 255, 0.04)",
          border: focused ? "1px solid var(--rn-accent)" : "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: focused ? "0 0 0 3px rgba(143, 163, 191, 0.18)" : "none",
          padding: "0 6px 0 16px",
          transition: "border-color 200ms ease-out, box-shadow 200ms ease-out",
        }}
      >
        <input
          id={id}
          type={props.type}
          value={props.value}
          required
          autoComplete={props.autoComplete}
          inputMode={props.inputMode}
          autoCapitalize="none"
          spellCheck={false}
          onChange={(e) => props.onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--rn-text)",
            fontFamily: "var(--font-body, sans-serif)",
            fontSize: "1rem",
            caretColor: "var(--rn-accent)",
          }}
        />
        {props.trailing}
      </div>
    </div>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("masuk");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError === "konfirmasi" ? "Tautan konfirmasi tidak valid atau kedaluwarsa. Coba masuk atau daftar lagi." : "");
  const [notice, setNotice] = useState("");

  const isSignup = mode === "daftar";

  const switchMode = () => {
    setMode(isSignup ? "masuk" : "daftar");
    setError("");
    setNotice("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    setBusy(true);
    try {
      const cleanEmail = email.trim();
      if (isSignup) {
        const { data, error: err } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) throw err;
        // Email sudah terdaftar + konfirmasi aktif: Supabase mengembalikan user tanpa identitas.
        if (data.user && data.user.identities?.length === 0) {
          setError("Email ini sudah terdaftar. Coba masuk.");
          return;
        }
        if (!data.session) {
          setNotice("Akun dibuat. Buka emailmu dan ketuk tautan konfirmasi, lalu masuk.");
          setMode("masuk");
          setPassword("");
          return;
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (err) throw err;
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(friendlyError(err as { code?: string; message?: string }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        background: "transparent",
        color: "var(--rn-text)",
        minHeight: "100dvh",
        padding: "2.5rem 1.5rem 4rem",
        maxWidth: "36rem",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <PageHead
        counter="BELAJAR"
        section={isSignup ? "DAFTAR" : "MASUK"}
        title={isSignup ? "Buat akun" : "Masuk"}
        sub="Tugas & materimu tersimpan di akunmu sendiri"
      />

      <form onSubmit={handleSubmit} noValidate={false} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <AuthField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" />
        <AuthField
          label="Kata sandi"
          type={show ? "text" : "password"}
          value={password}
          onChange={setPassword}
          autoComplete={isSignup ? "new-password" : "current-password"}
          trailing={
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-pressed={show}
              aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              style={{
                minWidth: 64,
                height: 44,
                borderRadius: 10,
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--rn-muted)",
              }}
            >
              {show ? "Tutup" : "Lihat"}
            </button>
          }
        />

        {error && (
          <p role="alert" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rn-alert)", letterSpacing: "0.04em", lineHeight: 1.5 }}>
            {error}
          </p>
        )}
        {notice && (
          <p role="status" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--rn-accent)", letterSpacing: "0.04em", lineHeight: 1.5 }}>
            {notice}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={busy} style={{ width: "100%" }}>
          {busy ? "Memproses…" : isSignup ? "Daftar" : "Masuk"}
        </Button>
      </form>

      <button
        type="button"
        onClick={switchMode}
        style={{
          alignSelf: "flex-start",
          minHeight: 44,
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--rn-accent)",
          textDecoration: "underline",
          textUnderlineOffset: "4px",
        }}
      >
        {isSignup ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
      </button>
    </div>
  );
}
