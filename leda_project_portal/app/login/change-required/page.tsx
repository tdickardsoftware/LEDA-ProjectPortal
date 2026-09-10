/**
 * Change-required page — shown when the user's password must be updated
 * before they are permitted to access the portal.
 */
import ChangeRequiredPageContent from "@/components/page-content/landing-content/change-required-page-content";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: "Password Update Required",
};

export default function Page() {
  return (
    <main>
      <ChangeRequiredPageContent />
    </main>
  );
}