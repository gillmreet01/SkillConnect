import { describe, expect, it } from "vitest";
import { buildProjectWhere, parseProjectFilters } from "@/lib/projects";

describe("parseProjectFilters", () => {
  it("reads one or many skills and drops duplicates and blanks", () => {
    expect(parseProjectFilters({ skill: "React" }).skills).toEqual(["React"]);
    expect(parseProjectFilters({ skill: ["React", " Figma ", "React", ""] }).skills).toEqual(["React", "Figma"]);
  });

  it("parses budget bounds and ignores invalid ones", () => {
    expect(parseProjectFilters({ min: "100", max: "500.5" })).toMatchObject({ minDollars: 100, maxDollars: 500.5 });
    const bad = parseProjectFilters({ min: "abc", max: "-5" });
    expect(bad.minDollars).toBeUndefined();
    expect(bad.maxDollars).toBeUndefined();
    expect(parseProjectFilters({ min: "" }).minDollars).toBeUndefined();
  });

  it("keeps a bound of zero", () => {
    expect(parseProjectFilters({ min: "0" }).minDollars).toBe(0);
  });
});

describe("buildProjectWhere", () => {
  it("only ever matches open projects", () => {
    expect(buildProjectWhere({ skills: [] })).toEqual({ status: "OPEN" });
  });

  it("filters by any of the selected skills", () => {
    expect(buildProjectWhere({ skills: ["React", "Figma"] })).toEqual({
      status: "OPEN",
      skills: { some: { name: { in: ["React", "Figma"] } } },
    });
  });

  it("converts the budget range to cents", () => {
    expect(buildProjectWhere({ skills: [], minDollars: 100, maxDollars: 250.5 })).toEqual({
      status: "OPEN",
      budgetCents: { gte: 10000, lte: 25050 },
    });
    expect(buildProjectWhere({ skills: [], maxDollars: 300 })).toEqual({
      status: "OPEN",
      budgetCents: { lte: 30000 },
    });
  });
});
