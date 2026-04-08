import { notFound } from "next/navigation";

import { ScholarshipDetailClient } from "@/components/ScholarshipDetailClient";
import { scholarships } from "@/lib/data";
import { createScholarshipCoachRecords } from "@/lib/scholarship-coach-core";
import { scholarshipCoachMetadata } from "@/lib/scholarship-coach-data";

export function generateStaticParams() {
  return createScholarshipCoachRecords(scholarships, scholarshipCoachMetadata).map((scholarship) => ({
    id: scholarship.id,
  }));
}

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exists = createScholarshipCoachRecords(scholarships, scholarshipCoachMetadata).some(
    (scholarship) => scholarship.id === id,
  );

  if (!exists) {
    notFound();
  }

  return <ScholarshipDetailClient scholarshipId={id} scholarships={scholarships} />;
}
