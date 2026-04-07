import { notFound } from "next/navigation";

import { FacultyStudentDetail } from "@/components/dashboard/FacultyStudentDetail";
import { getDashboardStudent } from "@/lib/dashboard";

export default async function FacultyStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = getDashboardStudent(id);

  if (!student) {
    notFound();
  }

  return <FacultyStudentDetail studentId={id} />;
}
