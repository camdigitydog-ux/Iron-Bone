import type { BaseEntity, ID } from "@/lib/domain";
import { newId, nowIso } from "@/lib/utils/id";
import type { CreateInput, UpdatePatch } from "../types";

/**
 * A minimal view of a Dexie table. Declared with method-shorthand syntax (not
 * function-typed properties) so structural comparisons against Dexie's real
 * `EntityTable<T, "id">` stay bivariant and don't trip over its `InsertType`/`modify`
 * generics, which are awkward to satisfy generically across every entity shape.
 */
interface MutableTable<T> {
  add(item: T): Promise<unknown>;
  get(id: ID): Promise<T | undefined>;
  put(item: T): Promise<unknown>;
}

export async function createEntity<T extends BaseEntity>(
  table: MutableTable<T>,
  input: CreateInput<T>,
): Promise<T> {
  const timestamp = nowIso();
  const entity = {
    ...input,
    id: newId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  } as T;
  await table.add(entity);
  return entity;
}

export async function updateEntity<T extends BaseEntity>(
  table: MutableTable<T>,
  id: ID,
  patch: UpdatePatch<T>,
): Promise<T> {
  const existing = await table.get(id);
  if (!existing) {
    throw new Error(`Entity ${id} not found`);
  }
  const updated = { ...existing, ...patch, updatedAt: nowIso() } as T;
  await table.put(updated);
  return updated;
}
