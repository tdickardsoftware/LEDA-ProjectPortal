/**
 * Internal auth-check endpoint consumed exclusively by Nginx's auth_request.
 *
 * Returns:
 *   200  – session is valid and user has the Developer role
 *   401  – no session (unauthenticated)
 *   403  – authenticated but not a Developer
 *
 * Nginx forwards the original request cookies automatically via
 * `auth_request_set $auth_cookie $upstream_http_cookie;`
 * so Better-Auth can resolve the session from the cookie header.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";
import { defineAbilitesFor } from "@/lib/abilities";

export async function GET() {
  const session = await getServerSession();

  if (!session?.user) {
    return new NextResponse(null, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role ?? "";
  const ability = defineAbilitesFor(role);

  // Developers can manage "all" — use that as the Developer gate
  if (!ability.can("manage", "all")) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, { status: 200 });
}
