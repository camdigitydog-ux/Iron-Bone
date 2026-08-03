import "server-only";
import { Pool } from "pg";
import { postgresConnectionString } from "./env";
import type { DbDriver, DbUser, DbSessionWithUser, DbUserData } from "./types";

// Plain node-postgres over the standard wire protocol (TCP+TLS) — works
// against any real Postgres server (Prisma Postgres, Supabase, RDS, a
// self-hosted box, etc.), unlike Neon-specific WebSocket clients that only
// work against Neon's own proxy infrastructure.
const pool = new Pool({ connectionString: postgresConnectionString() });

// Runs once per server instance, lazily (not at import time) so the build and
// any cold start that never touches auth never needs a live DB connection.
let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_data (
          user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          data TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
    })();
  }
  return schemaReady;
}

export const postgresDriver: DbDriver = {
  async findUserByEmail(email) {
    await ensureSchema();
    const { rows } = await pool.query<DbUser>(
      `SELECT id, email, password_hash as "passwordHash", created_at as "createdAt"
       FROM users WHERE email = $1`,
      [email],
    );
    return rows[0];
  },

  async insertUser(user) {
    await ensureSchema();
    await pool.query(
      `INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)`,
      [user.id, user.email, user.passwordHash, user.createdAt],
    );
  },

  async insertSession(id, userId, expiresAt, createdAt) {
    await ensureSchema();
    await pool.query(
      `INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4)`,
      [id, userId, expiresAt, createdAt],
    );
  },

  async findSessionWithUser(sessionId) {
    await ensureSchema();
    const { rows } = await pool.query<DbSessionWithUser>(
      `SELECT sessions.user_id as "userId", sessions.expires_at as "expiresAt", users.email as "email"
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = $1`,
      [sessionId],
    );
    return rows[0];
  },

  async deleteSession(sessionId) {
    await ensureSchema();
    await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
  },

  async getUserData(userId) {
    await ensureSchema();
    const { rows } = await pool.query<DbUserData>(
      `SELECT data, updated_at as "updatedAt" FROM user_data WHERE user_id = $1`,
      [userId],
    );
    return rows[0];
  },

  async setUserData(userId, data, updatedAt) {
    await ensureSchema();
    await pool.query(
      `INSERT INTO user_data (user_id, data, updated_at) VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = $3`,
      [userId, data, updatedAt],
    );
  },
};
