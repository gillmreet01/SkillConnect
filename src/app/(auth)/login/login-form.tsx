"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { FormField, SubmitButton } from "@/components/form-field";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email}
        errors={state?.errors?.email}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        errors={state?.errors?.password}
      />
      {state?.message && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}
      <SubmitButton pending={pending}>{pending ? "Logging in…" : "Log in"}</SubmitButton>
    </form>
  );
}
