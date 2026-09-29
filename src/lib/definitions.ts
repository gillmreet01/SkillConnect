import * as z from "zod";

export const roles = ["CLIENT", "FREELANCER"] as const;
export type Role = (typeof roles)[number];

// Trim and lowercase before checking the format, so " A@b.co " is accepted.
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email." }));

export const SignupSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }).max(80),
  email: emailField,
  password: z
    .string()
    .min(8, { error: "Be at least 8 characters long." })
    .max(72, { error: "Be at most 72 characters long." }) // bcrypt ignores bytes past 72
    .regex(/[a-zA-Z]/, { error: "Contain at least one letter." })
    .regex(/[0-9]/, { error: "Contain at least one number." }),
  role: z.enum(roles, { error: "Choose whether you're hiring or freelancing." }),
});

export const LoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: "Enter your password." }),
});

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export const NewProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { error: "Title must be at least 5 characters." })
    .max(120, { error: "Title must be at most 120 characters." }),
  description: z
    .string()
    .trim()
    .min(20, { error: "Describe the project in at least 20 characters." })
    .max(5000, { error: "Description must be at most 5,000 characters." }),
  // Entered in whole dollars, stored as cents.
  budget: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Enter a whole-dollar amount." })
    .transform(Number)
    .pipe(
      z
        .number()
        .min(5, { error: "Budget must be at least $5." })
        .max(1_000_000, { error: "Budget must be at most $1,000,000." }),
    )
    .transform((dollars) => dollars * 100),
  // Optional. An empty date input arrives as "".
  deadline: z
    .string()
    .trim()
    .refine((value) => value === "" || (isoDate.test(value) && !Number.isNaN(Date.parse(value))), {
      error: "Enter a valid date.",
    })
    .transform((value) => (value === "" ? null : new Date(`${value}T00:00:00Z`)))
    .refine((date) => date === null || date.getTime() >= startOfTodayUtc(), {
      error: "Deadline must be today or later.",
    }),
  skills: z
    .array(z.string())
    .transform((ids) => [...new Set(ids)])
    .pipe(
      z
        .array(z.string())
        .min(1, { error: "Pick at least one skill." })
        .max(8, { error: "Pick at most 8 skills." }),
    ),
});

function startOfTodayUtc() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export type ProjectFormState =
  | {
      errors?: Partial<Record<"title" | "description" | "budget" | "deadline" | "skills", string[]>>;
      message?: string;
      values?: { title?: string; description?: string; budget?: string; deadline?: string; skills?: string[] };
    }
  | undefined;

export type FormState =
  | {
      errors?: Partial<Record<"name" | "email" | "password" | "role", string[]>>;
      message?: string;
      // Echo back non-secret fields so the form keeps them after an error.
      values?: { name?: string; email?: string; role?: string };
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  role: Role;
  expiresAt: Date;
};
