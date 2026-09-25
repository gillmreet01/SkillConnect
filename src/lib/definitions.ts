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
