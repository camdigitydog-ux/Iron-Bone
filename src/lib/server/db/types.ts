export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface DbSessionWithUser {
  userId: string;
  email: string;
  expiresAt: string;
}

export interface DbUserData {
  data: string;
  updatedAt: string;
}

export interface DbDriver {
  findUserByEmail(email: string): Promise<DbUser | undefined>;
  insertUser(user: DbUser): Promise<void>;
  insertSession(id: string, userId: string, expiresAt: string, createdAt: string): Promise<void>;
  findSessionWithUser(sessionId: string): Promise<DbSessionWithUser | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  /** The synced blob is the runner's whole local Dexie database, serialized —
   * see src/lib/db/sync.ts. One row per user, overwritten on every push. */
  getUserData(userId: string): Promise<DbUserData | undefined>;
  setUserData(userId: string, data: string, updatedAt: string): Promise<void>;
}
