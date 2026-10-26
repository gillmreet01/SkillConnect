"use client";

import { useActionState } from "react";
import { createProject } from "@/app/actions/projects";
import { FieldErrors, FormField, SubmitButton, TextAreaField } from "@/components/form-field";

export function NewProjectForm({ skills }: { skills: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createProject, undefined);
  const selected = new Set(state?.values?.skills);

  return (
    <form action={action} className="space-y-5">
      <FormField label="Title" name="title" defaultValue={state?.values?.title} errors={state?.errors?.title} />
      <TextAreaField
        label="Description"
        name="description"
        defaultValue={state?.values?.description}
        errors={state?.errors?.description}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Budget (USD)"
          name="budget"
          type="number"
          min={5}
          step={1}
          inputMode="numeric"
          defaultValue={state?.values?.budget}
          errors={state?.errors?.budget}
        />
        <FormField
          label="Deadline (optional)"
          name="deadline"
          type="date"
          defaultValue={state?.values?.deadline}
          errors={state?.errors?.deadline}
        />
      </div>

      <fieldset aria-describedby="skills-error">
        <legend className="text-sm font-medium">Skills needed</legend>
        <p className="text-xs text-zinc-500">Pick up to 8.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <label
              key={skill.id}
              className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1 text-sm has-checked:border-zinc-900 has-checked:bg-zinc-900 has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-zinc-500 dark:border-zinc-700 dark:has-checked:border-zinc-100 dark:has-checked:bg-zinc-100 dark:has-checked:text-zinc-900"
            >
              <input
                type="checkbox"
                name="skills"
                value={skill.id}
                defaultChecked={selected.has(skill.id)}
                className="sr-only"
              />
              {skill.name}
            </label>
          ))}
        </div>
        <FieldErrors id="skills-error" errors={state?.errors?.skills} />
      </fieldset>

      <SubmitButton pending={pending}>{pending ? "Posting…" : "Post project"}</SubmitButton>
    </form>
  );
}
