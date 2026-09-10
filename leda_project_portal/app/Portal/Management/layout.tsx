/**
 * Management section layout — enforces page-level access control for all
 * routes under /Portal/Management before rendering children.
 */
import { requirePageAccess } from "@/lib/require-page-access";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function SectionLayout({ children }: { children: React.ReactNode }) {
  await requirePageAccess("Management");
  return <>{children}</>;
}
