"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import * as z from "zod";
import { Prisma } from "@/generated/prisma/client";
import { dashboardPath } from "@/lib/dal";
import { db } from "@/lib/db";
import { LoginSchema, SignupSchema, type FormState } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";

// Compared against when the email doesn't exist, so a failed login takes the
// same time whether or not the account is real.
const DUMMY_HASH = "$2b$10$lRHXnuctI8qjSSg5dfghberWmzk9cEpPdgemXkdhZc0vmleLcSrem";

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? ""),
  };
  const parsed = SignupSchema.safeParse({ ...values, password: formData.get("password") });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { name, email, password, role } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        // Freelancers get an empty profile to fill in later.
        ...(role === "FREELANCER" && {
          freelancerProfile: { create: { headline: "", bio: "" } },
        }),
      },
      select: { id: true, role: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { email: ["An account with this email already exists."] }, values };
    }
    throw error;
  }

  await createSession(user.id, user.role);
  redirect(dashboardPath(user.role));
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = LoginSchema.safeParse({ ...values, password: formData.get("password") });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true, passwordHash: true },
  });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    return { message: "Invalid email or password.", values };
  }

  await createSession(user.id, user.role);
  redirect(dashboardPath(user.role));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
