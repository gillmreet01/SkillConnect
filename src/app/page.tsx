import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/format";

export default async function Home() {
  // Render per request so the list reflects the current database.
  await connection();

  const projects = await db.project.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true } },
      skills: { select: { id: true, name: true } },
      _count: { select: { proposals: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">SkillConnect</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Clients post projects. Freelancers send proposals. The work gets done.
        </p>
      </header>

      <h2 className="mb-4 text-lg font-medium">Open projects ({projects.length})</h2>

      {projects.length === 0 ? (
        <p className="text-zinc-500">No open projects yet.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-medium">{project.title}</h3>
                <span className="shrink-0 font-mono text-sm">
                  {formatCents(project.budgetCents)}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {project.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                {project.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800"
                  >
                    {skill.name}
                  </span>
                ))}
                <span className="ml-auto text-zinc-500">
                  {project.client.name} · {project._count.proposals} proposals
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
