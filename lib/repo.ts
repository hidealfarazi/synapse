"use client";

import { supabase } from "@/lib/supabase/client";
import type { Assignment, ChecklistItem, ChecklistKind, Checkpoint, Material } from "./types";
import type { LearningFocus, SkillNode } from "./mock/learning";
import type { Recommendation } from "./ai/types";

// Data is always read from the signed-in account. No shared fallback or seed data.
type Entity = "assignments" | "checklist_items" | "checkpoints" | "materials" | "learning_focus" | "skill_nodes" | "recommendations";
type Row<T> = { id: string; user_id: string; payload: T; day?: string; parent_type?: string; parent_id?: string };

// ID akun diambil dari klaim JWT yang diverifikasi (lokal, tanpa 1 request jaringan per query).
// RLS di database tetap jadi penjaga utama: baris akun lain tidak akan pernah terbaca/tertulis.
async function account() {
  const { data, error } = await supabase.auth.getClaims();
  if (error) throw error;
  const id = data?.claims?.sub;
  if (!id) throw new Error("Sign in required");
  return id;
}

function checked<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

async function all<T>(table: Entity): Promise<Row<T>[]> {
  const user = await account();
  return checked(await supabase.from(table).select("*").eq("user_id", user)) as Row<T>[];
}

async function one<T>(table: Entity, id: string): Promise<Row<T> | undefined> {
  const user = await account();
  const data = checked(await supabase.from(table).select("*").eq("user_id", user).eq("id", id).maybeSingle());
  return (data ?? undefined) as Row<T> | undefined;
}

async function save<T extends { id: string }>(table: Entity, value: T, extra: Record<string, unknown> = {}): Promise<T> {
  const user = await account();
  checked(await supabase.from(table).upsert({ id: value.id, user_id: user, payload: value, ...extra }, { onConflict: "user_id,id" }));
  return value;
}

async function remove(table: Entity, id: string): Promise<boolean> {
  const user = await account();
  const data = checked(await supabase.from(table).delete().eq("id", id).eq("user_id", user).select("id"));
  return (data ?? []).length > 0;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const newId = () => crypto.randomUUID();
const assignmentFrom = (a: Assignment): Assignment => ({ ...a, dueAt: new Date(a.dueAt), createdAt: new Date(a.createdAt) });
const checkpointFrom = (c: Checkpoint): Checkpoint => ({ ...c, createdAt: new Date(c.createdAt) });
const materialFrom = (m: Material): Material => ({ ...m, createdAt: new Date(m.createdAt) });

export const AI_BRIEF = "";

export async function listAssignments(options?: { includeArchived?: boolean }): Promise<Assignment[]> {
  const items = (await all<Assignment>("assignments")).map((r) => assignmentFrom(r.payload));
  return options?.includeArchived ? items : items.filter((a) => !a.archivedAt);
}
export async function getAssignment(id: string): Promise<Assignment | undefined> {
  const row = await one<Assignment>("assignments", id);
  return row && assignmentFrom(row.payload);
}
export async function createAssignment(data: Omit<Assignment, "id" | "createdAt" | "progress" | "status">): Promise<Assignment> {
  return save("assignments", { ...data, id: newId(), status: "todo" as const, progress: 0, createdAt: new Date() });
}
export async function updateAssignment(id: string, patch: Partial<Assignment>): Promise<Assignment | undefined> {
  const current = await getAssignment(id);
  if (!current) return undefined;
  return save("assignments", { ...current, ...patch, id });
}
export function archiveAssignment(id: string) {
  return updateAssignment(id, { archivedAt: new Date().toISOString(), status: "done", progress: 100 });
}
export function restoreAssignment(id: string) {
  return updateAssignment(id, { archivedAt: undefined, status: "todo" });
}
export async function deleteAssignment(id: string): Promise<boolean> {
  return remove("assignments", id);
}

export async function listChecklist(parentType: "assignment" | "material", parentId: string): Promise<ChecklistItem[]> {
  const user = await account();
  const rows = checked(await supabase.from("checklist_items").select("*").eq("user_id", user).eq("parent_type", parentType).eq("parent_id", parentId));
  return (rows as Row<ChecklistItem>[]).map((r) => r.payload);
}
export async function addChecklistItem(parentType: "assignment" | "material", parentId: string, kind: ChecklistKind, title: string): Promise<ChecklistItem> {
  const parent = parentType === "assignment" ? await getAssignment(parentId) : await one<Material>("materials", parentId);
  if (!parent) throw new Error("Parent not found");
  const item = await save("checklist_items", { id: newId(), parentType, parentId, kind, title, done: false }, { parent_type: parentType, parent_id: parentId });
  if (parentType === "assignment") await recalculateAssignmentProgress(parentId);
  return item;
}
export async function toggleChecklistItem(id: string): Promise<ChecklistItem | undefined> {
  const row = await one<ChecklistItem>("checklist_items", id);
  if (!row) return undefined;
  const item = await save("checklist_items", { ...row.payload, done: !row.payload.done }, { parent_type: row.parent_type, parent_id: row.parent_id });
  if (item.parentType === "assignment") await recalculateAssignmentProgress(item.parentId);
  return item;
}
export async function deleteChecklistItem(id: string): Promise<boolean> {
  const row = await one<ChecklistItem>("checklist_items", id);
  if (!row) return false;
  const deleted = await remove("checklist_items", id);
  if (deleted && row.payload.parentType === "assignment") await recalculateAssignmentProgress(row.payload.parentId);
  return deleted;
}
async function recalculateAssignmentProgress(id: string) {
  const steps = (await listChecklist("assignment", id)).filter((c) => c.kind === "step");
  const progress = steps.length ? Math.round(steps.filter((c) => c.done).length * 100 / steps.length) : 0;
  await updateAssignment(id, { progress, status: progress === 100 && steps.length ? "done" : progress ? "doing" : "todo" });
}
export async function addCheckpoint(assignmentId: string, note?: string, imagePath?: string): Promise<Checkpoint> {
  if (!await getAssignment(assignmentId)) throw new Error("Assignment not found");
  return save("checkpoints", { id: newId(), assignmentId, note, imagePath, createdAt: new Date() }, { parent_id: assignmentId });
}
export async function listCheckpoints(assignmentId: string): Promise<Checkpoint[]> {
  return (await all<Checkpoint>("checkpoints")).filter((r) => r.parent_id === assignmentId).map((r) => checkpointFrom(r.payload));
}
export async function listMaterials(): Promise<Material[]> {
  return (await all<Material>("materials")).map((r) => materialFrom(r.payload));
}
export async function createMaterial(title: string, subjectId?: string): Promise<Material> {
  return save("materials", { id: newId(), title, subjectId, createdAt: new Date() });
}

export async function getTodayLearningFocus(): Promise<LearningFocus | undefined> {
  return (await one<LearningFocus>("learning_focus", todayKey()))?.payload;
}
export async function refreshLearningFocus(): Promise<LearningFocus | undefined> {
  // No generated mock recommendation: refresh current persisted focus only.
  return getTodayLearningFocus();
}
export async function saveLearningFocus(focus: LearningFocus): Promise<LearningFocus> {
  const day = todayKey();
  await save("learning_focus", { ...focus, id: day }, { day });
  return focus;
}
export async function toggleFocusCheckpoint(checkpointId: string): Promise<LearningFocus | undefined> {
  const focus = await getTodayLearningFocus();
  if (!focus || !focus.checkpoints.some((c) => c.id === checkpointId)) return focus;
  return saveLearningFocus({ ...focus, checkpoints: focus.checkpoints.map((c) => c.id === checkpointId ? { ...c, done: !c.done } : c) });
}
export async function listSkillNodes(): Promise<SkillNode[]> {
  return (await all<SkillNode>("skill_nodes")).map((r) => r.payload);
}
export async function saveSkillNode(node: SkillNode): Promise<SkillNode> {
  return save("skill_nodes", node);
}
export async function toggleSkillNode(nodeId: string): Promise<SkillNode[]> {
  const row = await one<SkillNode>("skill_nodes", nodeId);
  if (row) await saveSkillNode({ ...row.payload, done: !row.payload.done });
  return listSkillNodes();
}
export async function getTodayRecommendation(): Promise<Recommendation | undefined> {
  return (await one<Recommendation>("recommendations", todayKey()))?.payload;
}
export async function saveRecommendation(recommendation: Recommendation): Promise<Recommendation> {
  const day = todayKey();
  await save("recommendations", { ...recommendation, id: day }, { day });
  return recommendation;
}
export async function switchRecommendationTopic(): Promise<Recommendation | undefined> {
  const current = await getTodayRecommendation();
  if (!current?.alternatives.length) return current;
  const [next, ...rest] = current.alternatives;
  return saveRecommendation({ ...current, topic: next.topic, tier: next.tier, minutes: next.minutes, alternatives: [...rest, { topic: current.topic, tier: current.tier, minutes: current.minutes }], generatedAt: new Date().toISOString() });
}
