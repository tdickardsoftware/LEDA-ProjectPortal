/**
 * Reports section layout — enforces page-level access control for all
 * routes under /Portal/Reports before rendering children.
 */
import { requirePageAccess } from "@/lib/require-page-access";

export default async function SectionLayout({ children }: { children: React.ReactNode }) {
  await requirePageAccess("Reports");
  return <>{children}</>;
}
