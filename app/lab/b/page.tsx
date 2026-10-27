/**
 * /lab/b — Direction B: Ink & Batik
 *
 * Palette: deepest ink #080605 · parchment #EFE6D2 · gold #C9A24B
 *          indigo-black #1E1810 (batik contrast) · muted #A89F8C
 * Fonts:   Shippori Mincho 800 (display+heading) + Geist Mono (labels)
 * Sig:     SVG hairline animates stroke-dashoffset → 0 on mount
 * Motif:   Faint SVG kawung repeating (4% opacity, aria-hidden)
 *          Kanji micro-labels: 今日 / 明日 paired with Indonesian copy
 */

import { Shippori_Mincho, Geist_Mono } from "next/font/google";
import Link from "next/link";
import {
  getMockData,
  getGreeting,
  formatTime,
  formatDate,
  minutesUntil,
  AI_BRIEF,
  type Assignment,
} from "@/lib/mock";
import styles from "./page.module.css";

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-serif",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const NAV = [
  { href: "/", label: "Hari Ini", icon: "今" },
  { href: "/pr", label: "PR", icon: "課" },
  { href: "/ai", label: "AI", icon: "問" },
  { href: "/more", label: "Lainnya", icon: "他" },
] as const;

function DiamondProgress({ value }: { value: number }) {
  return (
    <div className={styles.progressWrap} aria-label={`Progress ${value}%`}>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${value}%` }}>
          <span className={styles.diamond} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function AssignmentRow({ item, muted }: { item: Assignment; muted?: boolean }) {
  const mins = minutesUntil(item.dueAt);
  const urgent = mins >= 0 && mins < 60;
  return (
    <div className={`${styles.row} ${muted ? styles.rowMuted : ""}`} role="listitem">
      <div className={styles.rowTop}>
        <span className={`${styles.subject} ${urgent ? styles.urgent : ""}`}>
          {item.subject}
        </span>
        <span className={`${styles.dueTime} ${urgent ? styles.urgent : ""}`}>
          {formatTime(item.dueAt)}
        </span>
      </div>
      <p className={styles.rowTitle}>{item.title}</p>
      <DiamondProgress value={item.progress} />
    </div>
  );
}

export default function LabBPage() {
  const { today, tomorrow } = getMockData();
  const greeting = getGreeting();
  const now = new Date();

  return (
    <div className={`${styles.root} ${shipporiMincho.variable} ${geistMono.variable}`}>
      {/* Kawung motif — decorative, screen-reader hidden */}
      <div className={styles.kawung} aria-hidden="true" />

      <main className={styles.main}>
        {/* Top counter */}
        <div className={styles.topStrip}>
          <span className={styles.counter}>01 / 03</span>
          <span className={styles.topRight}>HARI INI</span>
        </div>

        {/* Giant serif greeting */}
        <div className={styles.greetingBlock}>
          <h1 className={styles.greeting}>{greeting},</h1>
          <p className={styles.dateLabel}>{formatDate(now)}</p>
        </div>

        {/* AI brief — italic serif */}
        <p className={styles.aiBrief}>{AI_BRIEF}</p>

        {/* Animated brush hairline */}
        <svg
          className={styles.brushLine}
          viewBox="0 0 320 1"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="0.5"
            x2="320"
            y2="0.5"
            stroke="#C9A24B"
            strokeWidth="0.75"
            className={styles.brushStroke}
          />
        </svg>

        {/* Today section */}
        <div className={styles.sectionLabel}>
          <span className={styles.kanji}>今日</span>
          <span className={styles.sectionName}>HARI INI</span>
        </div>
        <div role="list" className={styles.rowList}>
          {today.map((item) => (
            <AssignmentRow key={item.id} item={item} />
          ))}
        </div>

        {/* Tomorrow section */}
        <div className={styles.sectionLabel}>
          <span className={styles.kanji}>明日</span>
          <span className={styles.sectionName}>BESOK</span>
        </div>
        <div role="list" className={styles.rowList}>
          {tomorrow.map((item) => (
            <AssignmentRow key={item.id} item={item} muted />
          ))}
        </div>
      </main>

      {/* Bottom nav */}
      <nav className={styles.nav} aria-label="Navigasi utama">
        {NAV.map(({ href, label, icon }) => {
          const isActive = href === "/";
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${isActive ? styles.navActive : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={styles.navIcon} aria-hidden="true">{icon}</span>
              <span className={styles.navLabel}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
