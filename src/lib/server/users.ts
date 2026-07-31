import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return db
    .prepare(
      "SELECT id, email, password_hash as passwordHash, created_at as createdAt FROM users WHERE email = ?",
    )
    .get(email) as UserRecord | undefined;
}

export function createUser(email: string, passwordHash: string): UserRecord {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)").run(
    id,
    email,
    passwordHash,
    createdAt,
  );
  return { id, email, passwordHash, createdAt };
}
