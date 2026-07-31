"use server";

import { redirect } from "next/navigation";
import { signupSchema, loginSchema, type AuthFormState } from "./schema";
import { findUserByEmail, createUser } from "@/lib/server/users";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { createSession, deleteSession } from "@/lib/server/session";

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { fieldErrors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  if (await findUserByEmail(email)) {
    return { fieldErrors: { email: ["An account with this email already exists."] } };
  }

  const passwordHash = await hashPassword(password);

  let userId: string;
  try {
    userId = (await createUser(email, passwordHash)).id;
  } catch {
    return { error: "Could not create your account. Please try again." };
  }

  await createSession(userId);
  redirect("/");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { fieldErrors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;
  const user = await findUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
