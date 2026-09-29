import Link from "next/link";
import { formatCents } from "@/lib/format";

export type ProjectCardData = {
  id: string;
  title: string;
  description: string;
  budgetCents: number;
  skills: { id: string; name: string }[];
  client: { name: string };
  _count: { proposals: number };
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <li className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-medium">
          <Link href={`/projects/${project.id}`} className="hover:underline">
            {project.title}
          </Link>
        </h3>
        <span className="shrink-0 font-mono text-sm">{formatCents(project.budgetCents)}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {project.skills.map((skill) => (
          <span key={skill.id} className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
            {skill.name}
          </span>
        ))}
        <span className="ml-auto text-zinc-500">
          {project.client.name} · {project._count.proposals} proposals
        </span>
      </div>
    </li>
  );
}

export const projectCardSelect = {
  id: true,
  title: true,
  description: true,
  budgetCents: true,
  skills: { select: { id: true, name: true }, orderBy: { name: "asc" } },
  client: { select: { name: true } },
  _count: { select: { proposals: true } },
} as const;
