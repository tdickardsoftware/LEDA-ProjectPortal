import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { defineAbilitesFor, type Subjects } from "@/lib/abilities";
import { getServerSession } from "@/lib/get-server-session";

/**
 * Guard for App Router pages/layouts.
 * Ensures the current user (respecting emulated role when allowed)
 * can `manage` the given subject; otherwise redirects to /Portal.
 */
export async function requirePageAccess(subject: Subjects) {
  const session = await getServerSession();

  if (!session) {
    // Middleware should have redirected already, but double-safeguard
    redirect("/login");
  }

  // Extract real role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (((session as any)?.data?.user?.role as string | undefined) ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((session as any)?.user?.role as string | undefined) ??
    "User") as string;

  // Support role emulation via cookie for privileged roles
  const jar = await cookies();
  const emulatedRole = jar.get("emulatedRole")?.value;
  const allowedToEmulate = role === "Developer" || role === "Office Admin";

  let effectiveRole = role;
  if (allowedToEmulate && emulatedRole) {
    if (
      (role === "Developer" && (emulatedRole === "Office Admin" || emulatedRole === "User")) ||
      (role === "Office Admin" && emulatedRole === "User")
    ) {
      effectiveRole = emulatedRole;
    }
  }

  const ability = defineAbilitesFor(effectiveRole);
  if (!ability.can("manage", subject)) {
    redirect("/Portal");
  }

  return { session, role: effectiveRole } as const;
}
