import "server-only";
import type { DbDriver } from "./types";

// Vercel's own Postgres/Neon storage integration injects POSTGRES_URL — when
// present, use that (works on Vercel's read-only, ephemeral filesystem).
// Otherwise fall back to a local SQLite file for zero-setup local dev.
// The unused branch is never imported, so its module-level side effects
// (opening a socket vs. opening a file) never run.
let driverPromise: Promise<DbDriver> | null = null;

function loadDriver(): Promise<DbDriver> {
  if (!driverPromise) {
    driverPromise = process.env.POSTGRES_URL
      ? import("./postgres").then((m) => m.postgresDriver)
      : import("./sqlite").then((m) => m.sqliteDriver);
  }
  return driverPromise;
}

export function getDriver(): Promise<DbDriver> {
  return loadDriver();
}
