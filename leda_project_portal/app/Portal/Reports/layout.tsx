import { requirePageAccess } from "@/lib/require-page-access";

export default async function SectionLayout({ children }: { children: React.ReactNode }) {
  await requirePageAccess("Reports");
  return <>{children}</>;
}
