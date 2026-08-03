import { db } from "./schema";

export type DbDump = Record<string, unknown[]>;

export async function exportAllData(): Promise<string> {
  const dump: DbDump = {};
  for (const table of db.tables) {
    dump[table.name] = await table.toArray();
  }
  return JSON.stringify(dump);
}

// Overwrites local tables with the remote snapshot — the remote is treated as
// the source of truth on pull, since it represents whatever this account last
// synced from any device. Tables absent from an older snapshot are left alone.
export async function importAllData(json: string): Promise<void> {
  const dump = JSON.parse(json) as DbDump;

  await db.transaction("rw", db.tables, async () => {
    for (const table of db.tables) {
      const rows = dump[table.name];
      if (!rows) continue;
      await table.clear();
      await table.bulkPut(rows as never[]);
    }
  });
}
