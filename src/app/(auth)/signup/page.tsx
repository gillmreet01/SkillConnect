import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Sign up · SkillConnect" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Create your account</h1>
      <SignupForm />
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline">
          Log in
        </Link>
      </p>
    </>
  );
}
