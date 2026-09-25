import { describe, expect, it } from "vitest";
import { LoginSchema, SignupSchema } from "@/lib/definitions";

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
