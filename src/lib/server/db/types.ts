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

export interface DbDriver {
  findUserByEmail(email: string): Promise<DbUser | undefined>;
  insertUser(user: DbUser): Promise<void>;
  insertSession(id: string, userId: string, expiresAt: string, createdAt: string): Promise<void>;
  findSessionWithUser(sessionId: string): Promise<DbSessionWithUser | undefined>;
  deleteSession(sessionId: string): Promise<void>;
}
