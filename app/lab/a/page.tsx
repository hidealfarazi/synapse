/**
 * /lab/a — Direction A: Quiet Grotesk
 *
 * Palette: near-black #0E0E0E · white #FFFFFF · steel-blue #6B8CAE
 *          hairline #333333 · muted #666666
 * Fonts:   Space Grotesk 800 (display) + Geist Mono (labels)
 * Sig:     CSS selection-box outline on the first letter of the greeting
 * Motion:  staggered revealUp on load; prefers-reduced-motion safe
 */

import { Space_Grotesk, Geist_Mono } from "next/font/google";
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

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

// Nav items
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
      <ProgressLine value={item.progress} />
    </div>
  );
}

export default function LabAPage() {
  const { today, tomorrow } = getMockData();
  const greeting = getGreeting();
  const firstLetter = greeting.charAt(0);
  const restOfGreeting = greeting.slice(1);
  const now = new Date();

  return (
    <div className={`${styles.root} ${spaceGrotesk.variable} ${geistMono.variable}`}>
      {/* Vertical edge text — desktop only */}
      <span className={styles.edgeText} aria-hidden="true">BELAJAR</span>

      <main className={styles.main}>
        {/* Section counter */}
        <div className={styles.sectionLabel}>
          <span className={styles.counter}>01 / 03</span>
          <span className={styles.hairline} aria-hidden="true" />
          <span className={styles.sectionName}>SELAMAT DATANG</span>
        </div>

        {/* Giant greeting with selection-box on first letter */}
        <div className={styles.greetingBlock}>
          <h1 className={styles.greeting}>
            <span className={styles.firstLetter} aria-hidden="true">{firstLetter}</span>
            <span>{restOfGreeting},</span>
          </h1>
          <p className={styles.dateLabel}>{formatDate(now)}</p>
        </div>

        {/* AI brief */}
        <p className={styles.aiBrief}>{AI_BRIEF}</p>

        {/* Today section */}
        <div className={styles.sectionLabel}>
          <span className={styles.counter}>02 / 03</span>
          <span className={styles.hairline} aria-hidden="true" />
          <span className={styles.sectionName}>HARI INI</span>
        </div>
        <div role="list" className={styles.rowList}>
          {today.map((item) => (
            <AssignmentRow key={item.id} item={item} />
          ))}
        </div>

        {/* Tomorrow section */}
        <div className={styles.sectionLabel}>
          <span className={styles.counter}>03 / 03</span>
          <span className={styles.hairline} aria-hidden="true" />
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
