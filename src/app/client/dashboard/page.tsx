import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/format";

export const metadata: Metadata = { title: "Client dashboard · SkillConnect" };

const statusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export default async function ClientDashboardPage() {
  const user = await requireRole("CLIENT");

  const projects = await db.project.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      budgetCents: true,
      status: true,
      _count: { select: { proposals: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name}</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">Your posted projects</p>
        </div>
        <Link
          href="/client/projects/new"
          className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Post a project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-8 text-zinc-500">You haven&apos;t posted any projects yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {projects.map((project) => (
            <li key={project.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">
                  <Link href={`/projects/${project.id}`} className="hover:underline">
                    {project.title}
                  </Link>
                </p>
                <p className="text-sm text-zinc-500">
                  {statusLabels[project.status]} · {project._count.proposals} proposals
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm">{formatCents(project.budgetCents)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
