import Link from "next/link";
import { acceptProposal, rejectProposal, withdrawProposal } from "@/app/actions/proposals";
import { formatCents } from "@/lib/format";
import { ProposalForm } from "./proposal-form";

export const proposalStatusLabels = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Not selected",
  WITHDRAWN: "Withdrawn",
} as const;

type Status = keyof typeof proposalStatusLabels;

const buttonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="mb-3 text-lg font-medium">{title}</h2>
      {children}
    </section>
  );
}

export type OwnProposal = {
  id: string;
  coverLetter: string;
  bidCents: number;
  estimatedDays: number;
  status: Status;
};

// What a freelancer sees: their own proposal, or the form to send one.
export function FreelancerSection({
  project,
  proposal,
}: {
  project: { id: string; status: string; budgetCents: number };
  proposal: OwnProposal | null;
}) {
  if (proposal) {
    return (
      <Section title="Your proposal">
        <p className="text-sm text-zinc-500">
          {proposalStatusLabels[proposal.status]} · {formatCents(proposal.bidCents)} · {proposal.estimatedDays}{" "}
          {proposal.estimatedDays === 1 ? "day" : "days"}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{proposal.coverLetter}</p>
        {proposal.status === "PENDING" && (
          <form action={withdrawProposal.bind(null, proposal.id)} className="mt-4">
            <button type="submit" className={buttonClass}>
              Withdraw proposal
            </button>
          </form>
        )}
      </Section>
    );
  }

  if (project.status !== "OPEN") {
    return (
      <Section title="Send a proposal">
        <p className="text-zinc-500">This project is no longer accepting proposals.</p>
      </Section>
    );
  }

  return (
    <Section title="Send a proposal">
      <ProposalForm projectId={project.id} budgetDollars={project.budgetCents / 100} />
    </Section>
  );
}

export function SignedOutSection() {
  return (
    <Section title="Send a proposal">
      <p className="text-zinc-600 dark:text-zinc-400">
        <Link href="/login" className="underline">
          Log in
        </Link>{" "}
        or{" "}
        <Link href="/signup" className="underline">
          sign up
        </Link>{" "}
        as a freelancer to send a proposal.
      </p>
    </Section>
  );
}

export type ReceivedProposal = OwnProposal & {
  freelancer: { name: string; freelancerProfile: { headline: string } | null };
};

// What the owning client sees: every proposal, with accept / reject on the pending ones.
export function ClientSection({ projectOpen, proposals }: { projectOpen: boolean; proposals: ReceivedProposal[] }) {
  return (
    <Section title={`Proposals (${proposals.length})`}>
      {proposals.length === 0 ? (
        <p className="text-zinc-500">No proposals yet.</p>
      ) : (
        <ul className="space-y-4">
          {proposals.map((proposal) => (
            <li key={proposal.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{proposal.freelancer.name}</p>
                  {proposal.freelancer.freelancerProfile?.headline && (
                    <p className="text-sm text-zinc-500">{proposal.freelancer.freelancerProfile.headline}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm">{formatCents(proposal.bidCents)}</p>
                  <p className="text-xs text-zinc-500">
                    {proposal.estimatedDays} {proposal.estimatedDays === 1 ? "day" : "days"}
                  </p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {proposal.coverLetter}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-zinc-500">{proposalStatusLabels[proposal.status]}</span>
                {projectOpen && proposal.status === "PENDING" && (
                  <div className="ml-auto flex gap-2">
                    <form action={rejectProposal.bind(null, proposal.id)}>
                      <button type="submit" className={buttonClass}>
                        Reject
                      </button>
                    </form>
                    <form action={acceptProposal.bind(null, proposal.id)}>
                      <button
                        type="submit"
                        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      >
                        Accept &amp; hire
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
