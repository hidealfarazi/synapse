export interface Subject {
  id: string;
  name: string;
  color?: string;
}

export interface Assignment {
  id: string;
  subjectId?: string;
  subject: string;
  title: string;
  description?: string;
  dueAt: Date;
  priority: 1 | 2 | 3;
  status: "todo" | "doing" | "done";
  progress: number; // 0–100
  estMinutes?: number;
  createdAt: Date;
  archivedAt?: string;
}

export type ChecklistKind = "step" | "bring" | "term";

export interface ChecklistItem {
  id: string;
  parentType: "assignment" | "material";
  parentId: string;
  kind: ChecklistKind;
  title: string;
  done: boolean;
}

export interface Checkpoint {
  id: string;
  assignmentId: string;
  note?: string;
  imagePath?: string;
  createdAt: Date;
}

export interface Material {
  id: string;
  title: string;
  subjectId?: string;
  createdAt: Date;
}
