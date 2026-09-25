import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in · SkillConnect" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Log in</h1>
      <LoginForm />
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        New here?{" "}
        <Link href="/signup" className="font-medium underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
