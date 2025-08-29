import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { defineAbilitesFor } from "@/lib/abilities";

interface User {
    name: string;
    email: string;
    username: string;
    role: "Developer" | "Office Admin" | "User";
    emulatedRole?: "Office Admin" | "User";
    originalRole?: "Developer" | "Office Admin";
}

export function useUserAbilities() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [, setEmulatedRole] = useState<User['emulatedRole'] | undefined>(undefined);

    useEffect(() => {
        async function fetchUser() {
            try {
                setLoading(true);
                const session = await authClient.getSession();
                const userData = session?.data?.user;
                if (userData) {
                    const storedEmulatedRole = sessionStorage.getItem("emulatedRole") as User['emulatedRole'] | null;
                    const userRole = (["Developer", "Office Admin", "User"].includes(userData.role) ? userData.role : "User") as User["role"];

                    const fullUser: User = {
                        name: userData.name || "",
                        email: userData.email || "",
                        username: userData.username || "",
                        role: userRole,
                    };

                    if (storedEmulatedRole) {
                        fullUser.emulatedRole = storedEmulatedRole;
                        fullUser.originalRole = userRole === "Developer" || userRole === "Office Admin" ? userRole : undefined;
                        setEmulatedRole(storedEmulatedRole);
                    }
                    
                    setUser(fullUser);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

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
            setUser(prevUser => prevUser
                ? {
                    ...prevUser,
                    emulatedRole: role,
                    originalRole: prevUser.role === "User" ? undefined : prevUser.role
                }
                : null
            );
        } else {
            sessionStorage.removeItem("emulatedRole");
            // Clear cookie when stopping emulation
            try {
                const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
                document.cookie = `emulatedRole=; Path=/; SameSite=Lax${secure}; Max-Age=0`;
            } catch { /* no-op */ }
            setEmulatedRole(undefined);
            setUser(prevUser => prevUser ? { ...prevUser, emulatedRole: undefined, originalRole: undefined } : null);
        }
        // A page reload might be the simplest way to ensure all components re-evaluate abilities.
        window.location.reload();
    }, []);

    return { user, ability, loading, emulateRole };
}
