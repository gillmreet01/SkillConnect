import { describe, expect, it } from "vitest";
import { LoginSchema, NewProjectSchema, SignupSchema } from "@/lib/definitions";

const validSignup = {
  name: "Aisha Khan",
  email: "  Aisha@Example.com ",
  password: "password123",
  role: "CLIENT",
};

describe("SignupSchema", () => {
  it("accepts valid input and normalizes the email", () => {
    const result = SignupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("aisha@example.com");
  });

  it("rejects weak passwords", () => {
    for (const password of ["short1", "onlyletters", "12345678"]) {
      expect(SignupSchema.safeParse({ ...validSignup, password }).success).toBe(false);
    }
  });

  it("rejects passwords longer than bcrypt can hash", () => {
    const password = "a1".repeat(37);
    expect(SignupSchema.safeParse({ ...validSignup, password }).success).toBe(false);
  });

  it("only allows the client and freelancer roles", () => {
    expect(SignupSchema.safeParse({ ...validSignup, role: "ADMIN" }).success).toBe(false);
    expect(SignupSchema.safeParse({ ...validSignup, role: "FREELANCER" }).success).toBe(true);
  });
});

describe("LoginSchema", () => {
  it("requires an email and a password", () => {
    expect(LoginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(LoginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(LoginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
});

describe("NewProjectSchema", () => {
  const valid = {
    title: "  Landing page for a coffee startup ",
    description: "Responsive marketing site with a pricing section.",
    budget: "600",
    deadline: "",
    skills: ["a", "b", "a"],
  };

  it("trims text, converts dollars to cents and dedupes skills", () => {
    const result = NewProjectSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      title: "Landing page for a coffee startup",
      budget: 60000,
      deadline: null,
      skills: ["a", "b"],
    });
  });

  it("rejects bad budgets", () => {
    for (const budget of ["", "abc", "4", "12.5", "-10", "2000000"]) {
      expect(NewProjectSchema.safeParse({ ...valid, budget }).success, budget).toBe(false);
    }
  });

  it("requires between one and eight skills", () => {
    expect(NewProjectSchema.safeParse({ ...valid, skills: [] }).success).toBe(false);
    const nine = Array.from({ length: 9 }, (_, i) => `s${i}`);
    expect(NewProjectSchema.safeParse({ ...valid, skills: nine }).success).toBe(false);
  });

  it("accepts a future deadline and rejects past or malformed ones", () => {
    const future = NewProjectSchema.safeParse({ ...valid, deadline: "2999-01-01" });
    expect(future.data?.deadline).toEqual(new Date("2999-01-01T00:00:00Z"));
    expect(NewProjectSchema.safeParse({ ...valid, deadline: "2000-01-01" }).success).toBe(false);
    expect(NewProjectSchema.safeParse({ ...valid, deadline: "next week" }).success).toBe(false);
  });

  it("rejects too-short titles and descriptions", () => {
    expect(NewProjectSchema.safeParse({ ...valid, title: "Hi" }).success).toBe(false);
    expect(NewProjectSchema.safeParse({ ...valid, description: "too short" }).success).toBe(false);
  });
});
