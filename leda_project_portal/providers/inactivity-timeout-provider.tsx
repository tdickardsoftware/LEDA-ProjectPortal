"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Sign out after this many milliseconds of inactivity across ALL tabs
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = "leda_last_activity";

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
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        authClient.getSession().then((result) => {
            setIsLoggedIn(!!result.data?.session);
        });
    }, []);

    useEffect(() => {
        // Only set up the timeout when a session exists
        if (!isLoggedIn) return;

        const recordActivity = () => {
            localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        };

        // When the timer fires, check the shared timestamp from all tabs.
        // If another tab was active more recently, reschedule instead of signing out.
        const scheduleCheck = () => {
            if (timerRef.current) clearTimeout(timerRef.current);

            const lastActivity = parseInt(
                localStorage.getItem(LAST_ACTIVITY_KEY) ?? "0",
                10
            );
            const elapsed = Date.now() - lastActivity;

            if (elapsed >= INACTIVITY_TIMEOUT_MS) {
                authClient.signOut().then(() => {
                    router.push("/login?reason=inactivity");
                });
            } else {
                // A different tab was recently active; wait out the remaining time
                timerRef.current = setTimeout(
                    scheduleCheck,
                    INACTIVITY_TIMEOUT_MS - elapsed
                );
            }
        };

        const resetTimer = () => {
            recordActivity();
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(scheduleCheck, INACTIVITY_TIMEOUT_MS);
        };

        // Initialise the shared timestamp on first load if not already set
        if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
            recordActivity();
        }

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
    }, [isLoggedIn, router]);

    return <>{children}</>;
}
