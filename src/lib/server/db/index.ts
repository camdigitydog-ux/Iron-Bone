import "server-only";
import type { DbDriver } from "./types";
import { postgresConnectionString } from "./env";

// The unused branch is never imported, so its module-level side effects
// (opening a socket vs. opening a file) never run.
let driverPromise: Promise<DbDriver> | null = null;

function loadDriver(): Promise<DbDriver> {
  if (!driverPromise) {
    driverPromise = postgresConnectionString()
      ? import("./postgres").then((m) => m.postgresDriver)
      : import("./sqlite").then((m) => m.sqliteDriver);
  }
  return driverPromise;
}

export function getDriver(): Promise<DbDriver> {
  return loadDriver();
}
