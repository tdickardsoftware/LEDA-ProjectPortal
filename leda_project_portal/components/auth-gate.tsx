/**
 * Runs `requirePageAccess` behind a `<Suspense>` boundary so the session read
 * (headers()/cookies()) doesn't block the route's static shell under Cache Components.
 */
import { Suspense, type ReactNode } from "react";
import { Spinner } from "@/components/ui/skeleton";
import { requirePageAccess } from "@/lib/require-page-access";
import type { Subjects } from "@/lib/abilities";

export function AuthGate({ subject, children }: { subject: Subjects; children: ReactNode }) {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<Gate subject={subject}>{children}</Gate>
		</Suspense>
	);
}

async function Gate({ subject, children }: { subject: Subjects; children: ReactNode }) {
	await requirePageAccess(subject);
	return <>{children}</>;
}
