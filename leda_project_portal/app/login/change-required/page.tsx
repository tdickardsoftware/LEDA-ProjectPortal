/**
 * Change-required page — shown when the user's password must be updated
 * before they are permitted to access the portal.
 */
import ChangeRequiredPageContent from "@/components/page-content/landing-content/change-required-page-content";
import { Metadata } from "next";

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