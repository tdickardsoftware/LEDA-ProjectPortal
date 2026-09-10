/**
 * Maintenance section layout — enforces page-level access control for all
 * routes under /Portal/Maintenance before rendering children.
 */
import { AuthGate } from "@/components/auth-gate";

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate subject="Maintenance">{children}</AuthGate>;
}
