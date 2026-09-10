/**
 * Activities section layout — enforces page-level access control for all
 * routes under /Portal/Activities before rendering children.
 */
import { AuthGate } from "@/components/auth-gate";

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate subject="Activities">{children}</AuthGate>;
}
