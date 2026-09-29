import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/format";

const statusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

const getProject = cache((id: string) =>
  db.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      budgetCents: true,
      deadline: true,
      status: true,
      createdAt: true,
      clientId: true,
      client: { select: { name: true } },
      skills: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      _count: { select: { proposals: true } },
    },
  }),
);

export async function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  await connection();
  const project = await getProject((await params).id);
  return { title: project ? `${project.title} · SkillConnect` : "Project not found · SkillConnect" };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  await connection();
  const [project, user] = await Promise.all([getProject((await params).id), getCurrentUser()]);
  if (!project) notFound();

  const isOwner = user?.id === project.clientId;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <Link href="/projects" className="text-sm text-zinc-500 hover:underline">
        ← All projects
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
        <span className="shrink-0 font-mono text-lg">{formatCents(project.budgetCents)}</span>
      </div>

      <p className="mt-2 text-sm text-zinc-500">
        {statusLabels[project.status]} · posted by {project.client.name} on {dateFormat.format(project.createdAt)}
        {project.deadline && ` · due ${dateFormat.format(project.deadline)}`} · {project._count.proposals}{" "}
        {project._count.proposals === 1 ? "proposal" : "proposals"}
        {isOwner && " · your project"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {project.skills.map((skill) => (
          <Link
            key={skill.id}
            href={`/projects?skill=${encodeURIComponent(skill.name)}`}
            className="rounded-full bg-zinc-100 px-2.5 py-1 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            {skill.name}
          </Link>
        ))}
      </div>

      <h2 className="mt-8 mb-2 text-lg font-medium">Description</h2>
      <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{project.description}</p>
    </main>
  );
}
