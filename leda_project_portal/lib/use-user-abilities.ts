import { useState, useEffect, useCallback, useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { defineAbilitesFor } from "@/lib/abilities";
import { useQuery } from "@tanstack/react-query";

interface User {
    name: string;
    email: string;
    username: string;
    role: "Developer" | "Office Admin" | "User";
    emulatedRole?: "Office Admin" | "User";
    originalRole?: "Developer" | "Office Admin";
}

export function useUserAbilities() {
    const [emulatedRole, setEmulatedRole] = useState<User["emulatedRole"] | undefined>(undefined);

    // Load emulated role from sessionStorage once (client-only).
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("emulatedRole") as User["emulatedRole"] | null;
            if (stored) setEmulatedRole(stored);
        } catch {
            // no-op
        }
    }, []);

    const {
        data: session,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["auth", "session"],
        queryFn: () => authClient.getSession(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const user = useMemo<User | null>(() => {
        if (!session || isError) return null;
        const userData = session?.data?.user as any;
        if (!userData) return null;

        const userRole = (["Developer", "Office Admin", "User"].includes(userData.role)
            ? userData.role
            : "User") as User["role"];

        const fullUser: User = {
            name: userData.name || "",
            email: userData.email || "",
            username: userData.username || "",
            role: userRole,
        };

        if (emulatedRole) {
            fullUser.emulatedRole = emulatedRole;
            fullUser.originalRole = userRole === "Developer" || userRole === "Office Admin" ? userRole : undefined;
        }

        return fullUser;
    }, [emulatedRole, isError, session]);

    const ability = defineAbilitesFor(user ? user.emulatedRole ?? user.role : "User");

    const emulateRole = useCallback((role: User['emulatedRole'] | null) => {
        if (role) {
            sessionStorage.setItem("emulatedRole", role);
            // Persist to cookie so server-side auth can honor emulation
            try {
                const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
                // 1 day duration; adjust as needed
                document.cookie = `emulatedRole=${encodeURIComponent(role)}; Path=/; SameSite=Lax${secure}; Max-Age=86400`;
            } catch { /* no-op */ }
            setEmulatedRole(role);
        } else {
            sessionStorage.removeItem("emulatedRole");
            // Clear cookie when stopping emulation
            try {
                const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
                document.cookie = `emulatedRole=; Path=/; SameSite=Lax${secure}; Max-Age=0`;
            } catch { /* no-op */ }
            setEmulatedRole(undefined);
        }
        // A page reload might be the simplest way to ensure all components re-evaluate abilities.
        window.location.reload();
    }, []);

    return { user, ability, loading: isLoading, emulateRole };
}
