/**
 * Management section layout — enforces page-level access control for all
 * routes under /Portal/Management before rendering children.
 */
import { AuthGate } from "@/components/auth-gate";

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate subject="Management">{children}</AuthGate>;
}
