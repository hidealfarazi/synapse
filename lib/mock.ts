/**
 * lib/mock.ts
 * Shared mock data for all lab design directions.
 * Real dynamic dates — computed at call time from new Date().
 * Replace with lib/repo.ts Supabase calls in production.
 */

export interface Assignment {
  id: string;
  subject: string;
  title: string;
  dueAt: Date;
  progress: number; // 0–100
  status: "todo" | "doing" | "done";
  priority: 1 | 2 | 3;
}

export interface MockData {
  today: Assignment[];
  tomorrow: Assignment[];
}

export function getMockData(): MockData {
  const now = new Date();

  // Today at various hours
  const todayAt = (h: number, m: number): Date => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  };

  // Tomorrow at various hours
  const tomorrowAt = (h: number, m: number): Date => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(h, m, 0, 0);
    return d;
  };

  return {
    today: [
      {
        id: "t1",
        subject: "Pemrograman Web",
        title: "Buat halaman login dengan validasi form",
        dueAt: todayAt(15, 30),
        progress: 65,
        status: "doing",
        priority: 1,
      },
      {
        id: "t2",
        subject: "Basis Data",
        title: "Diagram ERD sistem perpustakaan",
        dueAt: todayAt(20, 0),
        progress: 30,
        status: "todo",
        priority: 2,
      },
    ],
    tomorrow: [
      {
        id: "b1",
        subject: "Matematika",
        title: "Latihan soal limit fungsi trigonometri",
        dueAt: tomorrowAt(8, 0),
        progress: 0,
        status: "todo",
        priority: 2,
      },
      {
        id: "b2",
        subject: "PKK",
        title: "Laporan praktik kerja lapangan minggu ke-3",
        dueAt: tomorrowAt(14, 0),
        progress: 80,
        status: "doing",
        priority: 1,
      },
    ],
  };
}

/** Returns a time-based Indonesian greeting */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/** Format a Date as HH:MM in Indonesian locale */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Format a Date as full Indonesian date string */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Returns minutes until due. Negative = overdue. */
export function minutesUntil(dueAt: Date): number {
  return Math.floor((dueAt.getTime() - Date.now()) / 60000);
}

/** Mock AI brief — static string, simulates server response */
export const AI_BRIEF =
  "Prioritaskan login form dulu — sudah 65%. ERD bisa kamu selesaikan malam ini setelah makan.";
