import { DashboardDemoProvider } from "@/components/dashboard/DashboardDemoProvider";
import { dashboardData } from "@/lib/data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardDemoProvider initialData={dashboardData}>{children}</DashboardDemoProvider>;
}
