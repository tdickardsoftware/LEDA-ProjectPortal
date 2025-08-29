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