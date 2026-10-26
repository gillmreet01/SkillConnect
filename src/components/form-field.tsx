type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  hint?: string;
  errors?: string[];
} & Pick<React.ComponentProps<"input">, "min" | "step" | "inputMode">;

export const inputClass =
  "mt-1 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300";

export function FieldErrors({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors) return null;
  return (
    <ul id={id} className="mt-1 space-y-0.5 text-sm text-red-600 dark:text-red-400">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

export function FormField({ label, name, type = "text", defaultValue, autoComplete, hint, errors, ...inputProps }: FormFieldProps) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={errors ? true : undefined}
        aria-describedby={errors ? errorId : undefined}
        className={inputClass}
        {...inputProps}
      />
      <FieldErrors id={errorId} errors={errors} />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 6,
  errors,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  errors?: string[];
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        aria-invalid={errors ? true : undefined}
        aria-describedby={errors ? errorId : undefined}
        className={inputClass}
      />
      <FieldErrors id={errorId} errors={errors} />
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      {children}
    </button>
  );
}
