import "server-only";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import type { DbDriver, DbUser, DbSessionWithUser } from "./types";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "iron-bone.db"));

// Multiple Next.js build/dev worker processes can open this file at nearly the
// same instant on first run, racing to create the schema below. A busy timeout
// makes the losers wait for the writer's lock instead of failing immediately.
db.exec("PRAGMA busy_timeout = 5000");
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
`);

export const sqliteDriver: DbDriver = {
  async findUserByEmail(email) {
    return db
      .prepare(
        "SELECT id, email, password_hash as passwordHash, created_at as createdAt FROM users WHERE email = ?",
      )
      .get(email) as DbUser | undefined;
  },

  async insertUser(user) {
    db.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)").run(
      user.id,
      user.email,
      user.passwordHash,
      user.createdAt,
    );
  },

  async insertSession(id, userId, expiresAt, createdAt) {
    db.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
      id,
      userId,
      expiresAt,
      createdAt,
    );
  },

  async findSessionWithUser(sessionId) {
    return db
      .prepare(
        `SELECT sessions.user_id as userId, sessions.expires_at as expiresAt, users.email as email
         FROM sessions
         JOIN users ON users.id = sessions.user_id
         WHERE sessions.id = ?`,
      )
      .get(sessionId) as DbSessionWithUser | undefined;
  },

  async deleteSession(sessionId) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  },
};
