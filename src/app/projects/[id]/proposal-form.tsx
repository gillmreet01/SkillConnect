"use client";

import { useActionState } from "react";
import { submitProposal } from "@/app/actions/proposals";
import { FormField, SubmitButton, TextAreaField } from "@/components/form-field";

export function ProposalForm({ projectId, budgetDollars }: { projectId: string; budgetDollars: number }) {
  const [state, action, pending] = useActionState(submitProposal, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <TextAreaField
        label="Cover letter"
        name="coverLetter"
        rows={5}
        defaultValue={state?.values?.coverLetter}
        errors={state?.errors?.coverLetter}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Your bid (USD)"
          name="bid"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          hint={`The client's budget is $${budgetDollars.toLocaleString("en-US")}.`}
          defaultValue={state?.values?.bid}
          errors={state?.errors?.bid}
        />
        <FormField
          label="Estimated days"
          name="days"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          defaultValue={state?.values?.days}
          errors={state?.errors?.days}
        />
      </div>
      {state?.message && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}
      <SubmitButton pending={pending}>{pending ? "Sending…" : "Send proposal"}</SubmitButton>
    </form>
  );
}
