"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/lib/auth/actions";
import { Button, FormField, Input } from "@/components/ui";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label="Email" htmlFor="email" error={state?.fieldErrors?.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>
      <FormField label="Password" htmlFor="password" error={state?.fieldErrors?.password?.[0]}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </FormField>
      <p className="-mt-2 text-[11px] text-muted-foreground">
        At least 8 characters, with a letter and a number.
      </p>
      {state?.error ? <p className="text-xs text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Creating account…" : "Sign Up"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
