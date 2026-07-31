import "server-only";
import { sql } from "@vercel/postgres";
import type { DbDriver, DbUser, DbSessionWithUser } from "./types";

// Runs once per server instance, lazily (not at import time) so the build and
// any cold start that never touches auth never needs a live DB connection.
let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`;
    })();
  }
  return schemaReady;
}

export const postgresDriver: DbDriver = {
  async findUserByEmail(email) {
    await ensureSchema();
    const { rows } = await sql<DbUser>`
      SELECT id, email, password_hash as "passwordHash", created_at as "createdAt"
      FROM users WHERE email = ${email}
    `;
    return rows[0];
  },

  async insertUser(user) {
    await ensureSchema();
    await sql`
      INSERT INTO users (id, email, password_hash, created_at)
      VALUES (${user.id}, ${user.email}, ${user.passwordHash}, ${user.createdAt})
    `;
  },

  async insertSession(id, userId, expiresAt, createdAt) {
    await ensureSchema();
    await sql`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (${id}, ${userId}, ${expiresAt}, ${createdAt})
    `;
  },

  async findSessionWithUser(sessionId) {
    await ensureSchema();
    const { rows } = await sql<DbSessionWithUser>`
      SELECT sessions.user_id as "userId", sessions.expires_at as "expiresAt", users.email as "email"
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.id = ${sessionId}
    `;
    return rows[0];
  },

  async deleteSession(sessionId) {
    await ensureSchema();
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
  },
};
