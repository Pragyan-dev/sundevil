import { redirect } from "next/navigation";

export default async function DashboardStudentRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/faculty/student/${id}`);
}
