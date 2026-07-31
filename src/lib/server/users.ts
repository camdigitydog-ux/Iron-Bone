import "server-only";
import { randomUUID } from "node:crypto";
import { getDriver } from "./db";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const driver = await getDriver();
  return driver.findUserByEmail(email);
}

export async function createUser(email: string, passwordHash: string): Promise<UserRecord> {
  const driver = await getDriver();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const user: UserRecord = { id, email, passwordHash, createdAt };
  await driver.insertUser(user);
  return user;
}
