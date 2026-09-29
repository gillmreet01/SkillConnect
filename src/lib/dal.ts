import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Role } from "@/lib/definitions";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

// Data access layer: every page or action that needs the signed-in user goes
// through here. The cookie is only trusted after the user is found in the
// database, so deleted accounts lose access immediately.

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) redirect("/dashboard");
  return user;
}

export function dashboardPath(role: Role) {
  return role === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard";
}
