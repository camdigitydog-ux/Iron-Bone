import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { db } from "./db";
import { SESSION_COOKIE_NAME } from "./constants";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export interface Session {
  userId: string;
  email: string;
}

interface SessionRow {
  userId: string;
  expiresAt: string;
  email: string;
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  db.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
    token,
    userId,
    expiresAt.toISOString(),
    new Date().toISOString(),
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(token);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const getSession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const row = db
    .prepare(
      `SELECT sessions.user_id as userId, sessions.expires_at as expiresAt, users.email as email
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = ?`,
    )
    .get(token) as SessionRow | undefined;

  if (!row) return null;

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(token);
    return null;
  }

  return { userId: row.userId, email: row.email };
});

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
