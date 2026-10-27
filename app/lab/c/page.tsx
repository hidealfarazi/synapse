/**
 * /lab/c — Direction C: Hybrid
 *
 * Palette: dark studio #121212 · warm cream #F0E8DC · gold-copper #C4954A
 *          pure white #FFFFFF (focal numerals) · muted #888888
 * Fonts:   Space Grotesk 800 (oversized numerals) + Shippori Mincho 800 (section heads)
 *          + Geist Mono (labels)
 * Sig:     Oversized deadline HH:MM numeral flips in on mount via CSS perspective rotateX
 * Layout:  Single col mobile, two-col (today | tomorrow) desktop ≥768px
 */

import { Space_Grotesk, Shippori_Mincho, Geist_Mono } from "next/font/google";
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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display",
});

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
  { href: "/", label: "Hari Ini", icon: "○" },
  { href: "/pr", label: "PR", icon: "□" },
  { href: "/ai", label: "AI", icon: "◇" },
  { href: "/more", label: "Lainnya", icon: "≡" },
] as const;

function ProgressLine({ value }: { value: number }) {
  return (
    <div className={styles.progressTrack} aria-label={`Progress ${value}%`}>
      <div className={styles.progressFill} style={{ width: `${value}%` }} />
      <div
        className={styles.progressDot}
        style={{ left: `${value}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

function AssignmentRow({
  item,
  muted,
  index,
}: {
  item: Assignment;
  muted?: boolean;
  index: number;
}) {
  const mins = minutesUntil(item.dueAt);
  const urgent = mins >= 0 && mins < 60;
  const timeStr = formatTime(item.dueAt);

  return (
    <div
      className={`${styles.row} ${muted ? styles.rowMuted : ""}`}
      role="listitem"
      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
    >
      {/* Oversized flipping deadline numeral — the hero element */}
      <div
        className={`${styles.flipNumeral} ${urgent ? styles.urgentNumeral : ""}`}
        aria-label={`Tenggat ${timeStr}`}
        style={{ animationDelay: `${0.35 + index * 0.1}s` }}
      >
        {timeStr}
      </div>

      <div className={styles.rowContent}>
        <span className={`${styles.subject} ${urgent ? styles.urgent : ""}`}>
          {item.subject}
        </span>
        <p className={styles.rowTitle}>{item.title}</p>
        <ProgressLine value={item.progress} />
      </div>
    </div>
  );
}

export default function LabCPage() {
  const { today, tomorrow } = getMockData();
  const greeting = getGreeting();
  const now = new Date();

  return (
    <div
      className={`${styles.root} ${spaceGrotesk.variable} ${shipporiMincho.variable} ${geistMono.variable}`}
    >
      <main className={styles.main}>
        {/* Top strip */}
        <div className={styles.topStrip}>
          <span className={styles.dirLabel}>C / HYBRID</span>
          <span className={styles.dateLabel}>{formatDate(now)}</span>
        </div>

        {/* Giant serif greeting */}
        <div className={styles.greetingBlock}>
          <h1 className={styles.greeting}>{greeting},</h1>
        </div>

        {/* AI brief */}
        <p className={styles.aiBrief}>{AI_BRIEF}</p>

        {/* Hairline with center dot */}
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine} />
          <span className={styles.dividerDot} />
          <span className={styles.dividerLine} />
        </div>

        {/* Two-column section on desktop */}
        <div className={styles.columns}>
          {/* Today column */}
          <div className={styles.column}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Hari ini</h2>
              <span className={styles.sectionCount}>{today.length} tugas</span>
            </div>
            <div role="list" className={styles.rowList}>
              {today.map((item, i) => (
                <AssignmentRow key={item.id} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Tomorrow column */}
          <div className={styles.column}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Besok</h2>
              <span className={styles.sectionCount}>{tomorrow.length} tugas</span>
            </div>
            <div role="list" className={styles.rowList}>
              {tomorrow.map((item, i) => (
                <AssignmentRow key={item.id} item={item} muted index={i} />
              ))}
            </div>
          </div>
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
