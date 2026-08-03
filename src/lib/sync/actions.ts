"use server";

import { getSession } from "@/lib/server/session";
import { getDriver } from "@/lib/server/db";

export interface SyncSnapshot {
  data: string;
  updatedAt: string;
}

// Returns null both when signed out and when a signed-in user has never
// pushed yet — callers treat "no remote snapshot" as "nothing to pull".
export async function pullSyncData(): Promise<SyncSnapshot | null> {
  const session = await getSession();
  if (!session) return null;

  const driver = await getDriver();
  const row = await driver.getUserData(session.userId);
  return row ?? null;
}

export async function pushSyncData(data: string): Promise<SyncSnapshot | null> {
  const session = await getSession();
  if (!session) return null;

  const driver = await getDriver();
  const updatedAt = new Date().toISOString();
  await driver.setUserData(session.userId, data, updatedAt);
  return { data, updatedAt };
}
