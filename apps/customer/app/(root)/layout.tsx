import { ReactNode } from "react";
// import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardShell from "./DashboardShell";

// DashboardShell is a Client Component (useState for logout dialog,
// usePathname for active nav items). The layout file itself stays a
// Server Component — Next.js passes {children} through automatically.

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
