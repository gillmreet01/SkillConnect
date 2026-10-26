"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { requireRole } from "@/lib/dal";
import { db } from "@/lib/db";
import { NewProjectSchema, type ProjectFormState } from "@/lib/definitions";

export async function createProject(_state: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  // Checked here as well as in the page: Server Actions are public endpoints.
  const user = await requireRole("CLIENT");

  const values = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    budget: String(formData.get("budget") ?? ""),
    deadline: String(formData.get("deadline") ?? ""),
    skills: formData.getAll("skills").map(String),
  };
  const parsed = NewProjectSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { title, description, budget, deadline, skills } = parsed.data;

  // Ids come from the browser, so make sure every one is a real skill.
  const known = await db.skill.count({ where: { id: { in: skills } } });
  if (known !== skills.length) {
    return { errors: { skills: ["Choose skills from the list."] }, values };
  }

  const project = await db.project.create({
    data: {
      title,
      description,
      budgetCents: budget,
      deadline,
      clientId: user.id,
      skills: { connect: skills.map((id) => ({ id })) },
    },
    select: { id: true },
  });

  redirect(`/projects/${project.id}`);
}
