import { connection } from "next/server";
import Link from "next/link";
import { ProjectCard, projectCardSelect } from "@/components/project-card";
import { db } from "@/lib/db";

export default async function Home() {
  // Render per request so the list reflects the current database.
  await connection();

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: projectCardSelect,
    }),
    db.project.count({ where: { status: "OPEN" } }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <section className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Find work. Hire talent.</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Clients post projects. Freelancers send proposals. The work gets done.
        </p>
      </section>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-medium">Latest open projects</h2>
        <Link href="/projects" className="text-sm hover:underline">
          Browse all {total} →
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-zinc-500">No open projects yet.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ul>
      )}
    </main>
  );
}
