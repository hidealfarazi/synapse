export type Source = { title: string; url: string };
export type Tier = "fondasi" | "kompetensi" | "ai";
export type RadarStatus = "adopt" | "trial" | "assess" | "hold";
export type RadarKind = "language" | "framework" | "tool" | "platform";
export type RadarTrack = "web" | "mobile" | "ai" | "iot" | "game" | "data";
export type Confidence = "low" | "medium" | "high";

export type RadarItem = {
  id: string;
  name: string;
  kind: RadarKind;
  track: RadarTrack;
  status: RadarStatus; // adopt = pelajari sekarang, trial = coba di proyek kecil, assess = pantau, hold = tunda
  why: string;
  startWhen: string;
};

export type RadarChange =
  | { type: "new"; item: RadarItem; reason: string; confidence: Confidence }
  | { type: "status"; itemId: string; to: RadarStatus; reason: string; confidence: Confidence };

export type Radar = {
  items: RadarItem[];
  sources: Source[];
  pending: RadarChange[]; // usulan AI, menunggu persetujuan pemilik
  checkedAt: string | null; // terakhir dicek AI
  updatedAt: string | null; // terakhir usulan diterapkan
};

export type Recommendation = {
  topic: string;
  reason: string;
  tier: Tier;
  minutes: number;
  radarItemId?: string;
  alternatives: { topic: string; tier: Tier; minutes: number }[];
  generatedAt: string;
  signalSource?: Source;
};
