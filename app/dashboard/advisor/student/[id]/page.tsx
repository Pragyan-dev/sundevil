import { notFound } from "next/navigation";

import { AdvisorStudentDetail } from "@/components/dashboard/AdvisorStudentDetail";
import { getDashboardStudent } from "@/lib/dashboard";

export default async function AdvisorStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = getDashboardStudent(id);

  if (!student) {
    notFound();
  }

  return <AdvisorStudentDetail studentId={id} />;
}
