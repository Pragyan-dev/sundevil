import { ScholarshipCoach } from "@/components/ScholarshipCoach";
import { scholarships } from "@/lib/data";

export default function ScholarshipsPage() {
  return <ScholarshipCoach scholarships={scholarships} />;
}
