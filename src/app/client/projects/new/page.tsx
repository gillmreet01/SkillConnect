import type { Metadata } from "next";
import { requireRole } from "@/lib/dal";
import { db } from "@/lib/db";
import { NewProjectForm } from "./new-project-form";

export const metadata: Metadata = { title: "Post a project · SkillConnect" };

export default async function NewProjectPage() {
  await requireRole("CLIENT");
  const skills = await db.skill.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Post a project</h1>
      <p className="mt-1 mb-8 text-zinc-600 dark:text-zinc-400">
        Describe the work and freelancers with the right skills can find it.
      </p>
      <NewProjectForm skills={skills} />
    </main>
  );
}
