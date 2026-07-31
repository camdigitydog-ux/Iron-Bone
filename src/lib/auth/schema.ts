import { z } from "zod";

export const emailField = z
  .email({ error: "Enter a valid email address." })
  .trim()
  .toLowerCase();

export const signupSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(8, { error: "Use at least 8 characters." })
    .regex(/[a-zA-Z]/, { error: "Include at least one letter." })
    .regex(/[0-9]/, { error: "Include at least one number." }),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: "Enter your password." }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type AuthFormState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
} | undefined;
