import { notFound, redirect } from "next/navigation";

import { MessagesClient } from "@/components/dashboard/MessagesClient";
import type { DashboardRole } from "@/lib/types";

const validRoles = new Set<DashboardRole>(["faculty", "advisor"]);

export default async function DashboardMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; student?: string }>;
}) {
  const { role, student } = await searchParams;

  if (!role) {
    redirect("/dashboard/messages?role=faculty");
  }

  if (!validRoles.has(role as DashboardRole)) {
    notFound();
  }

  return <MessagesClient role={role as DashboardRole} selectedStudentId={student ?? null} />;
}
