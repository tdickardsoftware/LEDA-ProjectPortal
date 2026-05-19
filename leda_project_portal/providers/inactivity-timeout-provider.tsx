"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Sign out after this many milliseconds of inactivity
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click",
] as const;

export default function InactivityTimeoutProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { data: session } = authClient.useSession();

    useEffect(() => {
        // Only set up the timeout when a session exists
        if (!session) return;

        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(async () => {
                await authClient.signOut();
                router.push("/login?reason=inactivity");
            }, INACTIVITY_TIMEOUT_MS);
        };

        // Start the timer and attach listeners
        resetTimer();
        ACTIVITY_EVENTS.forEach((event) =>
            window.addEventListener(event, resetTimer, { passive: true })
        );

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            ACTIVITY_EVENTS.forEach((event) =>
                window.removeEventListener(event, resetTimer)
            );
        };
    }, [session, router]);

    return <>{children}</>;
}
