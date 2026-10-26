"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/dal";
import { db } from "@/lib/db";
import { ProposalSchema, type ProposalFormState } from "@/lib/definitions";

// Server Actions are public endpoints: each one re-checks who is calling and
// that the row it touches belongs to them, whatever the page showed.

export async function submitProposal(_state: ProposalFormState, formData: FormData): Promise<ProposalFormState> {
  const user = await requireRole("FREELANCER");

  const values = {
    coverLetter: String(formData.get("coverLetter") ?? ""),
    bid: String(formData.get("bid") ?? ""),
    days: String(formData.get("days") ?? ""),
  };
  const parsed = ProposalSchema.safeParse({ ...values, projectId: String(formData.get("projectId") ?? "") });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { projectId, coverLetter, bid, days } = parsed.data;

  const project = await db.project.findUnique({ where: { id: projectId }, select: { status: true } });
  if (!project) return { message: "That project no longer exists.", values };
  if (project.status !== "OPEN") return { message: "This project is no longer accepting proposals.", values };

  try {
    await db.proposal.create({
      data: { projectId, freelancerId: user.id, coverLetter, bidCents: bid, estimatedDays: days },
    });
  } catch (error) {
    // One proposal per freelancer per project (unique index).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { message: "You've already sent a proposal for this project.", values };
    }
    throw error;
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function withdrawProposal(proposalId: string) {
  const user = await requireRole("FREELANCER");

  // Only your own pending proposal; anything else matches nothing.
  const { count } = await db.proposal.updateMany({
    where: { id: proposalId, freelancerId: user.id, status: "PENDING" },
    data: { status: "WITHDRAWN" },
  });
  if (count === 1) revalidatePath("/", "layout");
}

export async function rejectProposal(proposalId: string) {
  const user = await requireRole("CLIENT");

  const { count } = await db.proposal.updateMany({
    where: { id: proposalId, status: "PENDING", project: { clientId: user.id } },
    data: { status: "REJECTED" },
  });
  if (count === 1) revalidatePath("/", "layout");
}

// Hiring: accept one proposal, start the project, and close out the rest.
export async function acceptProposal(proposalId: string) {
  const user = await requireRole("CLIENT");

  const accepted = await db.$transaction(async (tx) => {
    const proposal = await tx.proposal.findFirst({
      where: { id: proposalId, status: "PENDING", project: { clientId: user.id } },
      select: { projectId: true, freelancerId: true },
    });
    if (!proposal) return false;

    // The status condition makes this a compare-and-set: of two concurrent
    // accepts, the second finds the project already taken and changes nothing.
    const claimed = await tx.project.updateMany({
      where: { id: proposal.projectId, clientId: user.id, status: "OPEN" },
      data: { status: "IN_PROGRESS", freelancerId: proposal.freelancerId },
    });
    if (claimed.count !== 1) return false;

    await tx.proposal.update({ where: { id: proposalId }, data: { status: "ACCEPTED" } });
    await tx.proposal.updateMany({
      where: { projectId: proposal.projectId, status: "PENDING", id: { not: proposalId } },
      data: { status: "REJECTED" },
    });
    return true;
  });

  if (accepted) revalidatePath("/", "layout");
}
