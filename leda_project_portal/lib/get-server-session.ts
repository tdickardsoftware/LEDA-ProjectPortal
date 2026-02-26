/**
 * Server-side session fetcher for App Router React Server Components.
 *
 * Wraps `auth.api.getSession` in React's `cache()` so the session is only
 * fetched once per server request regardless of how many RSCs call it.
 * Must only be imported from server-only code (pages, layouts, actions).
 */
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/auth";

/**
 * Server-only helper to fetch the current session once per request.
 * Uses React's `cache()` to memoize within a single RSC render.
 */
export const getServerSession = cache(async () => {
  const roHeaders = await headers();
  const hdrs = new Headers();
  for (const [k, v] of roHeaders) hdrs.set(k, v);
  return auth.api.getSession({ headers: hdrs });
});
