import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ProjectCard, projectCardSelect } from "@/components/project-card";
import { db } from "@/lib/db";
import { buildProjectWhere, parseProjectFilters } from "@/lib/projects";

export const metadata: Metadata = { title: "Browse projects · SkillConnect" };

const PAGE_SIZE = 50;

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  // Render per request so the list reflects the current database.
  await connection();

  const filters = parseProjectFilters(await searchParams);
  const where = buildProjectWhere(filters);
  const [projects, total, skills] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      select: projectCardSelect,
    }),
    db.project.count({ where }),
    db.skill.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const isFiltered = filters.skills.length > 0 || filters.minDollars !== undefined || filters.maxDollars !== undefined;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Browse projects</h1>

      {/* A plain GET form: filters live in the URL, so results are shareable and need no JavaScript. */}
      <form action="/projects" className="mt-6 space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <fieldset>
          <legend className="text-sm font-medium">Skills</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1 text-sm has-checked:border-zinc-900 has-checked:bg-zinc-900 has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-zinc-500 dark:border-zinc-700 dark:has-checked:border-zinc-100 dark:has-checked:bg-zinc-100 dark:has-checked:text-zinc-900"
              >
                <input
                  type="checkbox"
                  name="skill"
                  value={skill.name}
                  defaultChecked={filters.skills.includes(skill.name)}
                  className="sr-only"
                />
                {skill.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="block font-medium">Min budget ($)</span>
            <input
              type="number"
              name="min"
              min={0}
              inputMode="numeric"
              defaultValue={filters.minDollars}
              className="mt-1 w-32 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </label>
          <label className="text-sm">
            <span className="block font-medium">Max budget ($)</span>
            <input
              type="number"
              name="max"
              min={0}
              inputMode="numeric"
              defaultValue={filters.maxDollars}
              className="mt-1 w-32 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Apply filters
          </button>
          {isFiltered && (
            <Link href="/projects" className="py-2 text-sm text-zinc-500 hover:underline">
              Clear
            </Link>
          )}
        </div>
      </form>

      <p className="mt-8 mb-4 text-sm text-zinc-500" aria-live="polite">
        {total} open {total === 1 ? "project" : "projects"}
        {total > projects.length && ` · showing the ${projects.length} newest`}
      </p>

      {projects.length === 0 ? (
        <p className="text-zinc-500">No projects match these filters.</p>
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
