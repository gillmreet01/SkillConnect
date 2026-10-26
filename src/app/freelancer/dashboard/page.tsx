import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/format";

export const metadata: Metadata = { title: "Freelancer dashboard · SkillConnect" };

const statusLabels = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Not selected",
  WITHDRAWN: "Withdrawn",
} as const;

export default async function FreelancerDashboardPage() {
  const user = await requireRole("FREELANCER");

  const proposals = await db.proposal.findMany({
    where: { freelancerId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      bidCents: true,
      estimatedDays: true,
      status: true,
      project: { select: { id: true, title: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Your proposals ·{" "}
        <Link href="/projects" className="underline">
          browse projects
        </Link>
      </p>

      {proposals.length === 0 ? (
        <p className="mt-8 text-zinc-500">You haven&apos;t sent any proposals yet. Find a project to bid on.</p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {proposals.map((proposal) => (
            <li key={proposal.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">
                  <Link href={`/projects/${proposal.project.id}`} className="hover:underline">
                    {proposal.project.title}
                  </Link>
                </p>
                <p className="text-sm text-zinc-500">
                  {statusLabels[proposal.status]} · {proposal.estimatedDays}{" "}
                  {proposal.estimatedDays === 1 ? "day" : "days"}
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm">{formatCents(proposal.bidCents)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
