"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { FormField, SubmitButton } from "@/components/form-field";

const roleOptions = [
  { value: "CLIENT", label: "I'm hiring", hint: "Post projects and pick freelancers" },
  { value: "FREELANCER", label: "I'm freelancing", hint: "Find projects and send proposals" },
];

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium">Account type</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {roleOptions.map((option) => (
            <label
              key={option.value}
              className="cursor-pointer rounded-md border border-zinc-300 p-3 text-sm has-focus-visible:ring-2 has-focus-visible:ring-zinc-400 has-checked:border-zinc-900 has-checked:bg-zinc-100 dark:border-zinc-700 dark:has-checked:border-zinc-300 dark:has-checked:bg-zinc-800"
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                defaultChecked={state?.values?.role === option.value}
                className="sr-only"
              />
              <span className="block font-medium">{option.label}</span>
              <span className="block text-xs text-zinc-500">{option.hint}</span>
            </label>
          ))}
        </div>
        {state?.errors?.role && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.role[0]}</p>
        )}
      </fieldset>
      <FormField
        label="Name"
        name="name"
        autoComplete="name"
        defaultValue={state?.values?.name}
        errors={state?.errors?.name}
      />
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
        autoComplete="new-password"
        errors={state?.errors?.password}
      />
      <SubmitButton pending={pending}>{pending ? "Creating account…" : "Create account"}</SubmitButton>
    </form>
  );
}
