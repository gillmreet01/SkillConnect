import { redirect } from "next/navigation";
import { dashboardPath, requireUser } from "@/lib/dal";

// Sends each user to the dashboard for their role.
export default async function DashboardPage() {
  const user = await requireUser();
  redirect(dashboardPath(user.role));
}
