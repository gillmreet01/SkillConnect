import type { Prisma } from "@/generated/prisma/client";

export type SearchParams = Record<string, string | string[] | undefined>;

export type ProjectFilters = {
  skills: string[];
  // Whole or fractional dollars, as typed in the filter form.
  minDollars?: number;
  maxDollars?: number;
};

const MAX_SKILL_FILTERS = 20;

function all(value: string | string[] | undefined) {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function dollars(value: string | string[] | undefined) {
  const raw = all(value)[0]?.trim();
  if (!raw) return undefined;
  const number = Number(raw);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

// Lenient on purpose: a hand-edited URL with a bad value drops that filter
// instead of erroring.
export function parseProjectFilters(params: SearchParams): ProjectFilters {
  const skills = [...new Set(all(params.skill).map((name) => name.trim()).filter(Boolean))].slice(
    0,
    MAX_SKILL_FILTERS,
  );
  return { skills, minDollars: dollars(params.min), maxDollars: dollars(params.max) };
}

// Projects matching any selected skill, within the budget range.
export function buildProjectWhere({ skills, minDollars, maxDollars }: ProjectFilters): Prisma.ProjectWhereInput {
  const hasBudget = minDollars !== undefined || maxDollars !== undefined;
  return {
    status: "OPEN",
    ...(skills.length > 0 && { skills: { some: { name: { in: skills } } } }),
    ...(hasBudget && {
      budgetCents: {
        ...(minDollars !== undefined && { gte: Math.round(minDollars * 100) }),
        ...(maxDollars !== undefined && { lte: Math.round(maxDollars * 100) }),
      },
    }),
  };
}
