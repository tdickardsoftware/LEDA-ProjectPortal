/**
 * API Route: /api/auth/[...all]
 *
 * Catch-all handler that delegates all authentication requests to the
 * better-auth library. Handles sign-in, sign-out, session management,
 * and any other auth-related endpoints exposed by the configured provider.
 */
import { toNodeHandler } from "better-auth/node"
import { auth } from "@/auth"
 
// Disallow body parsing, we will parse it manually
export const config = { api: { bodyParser: false } }
 
export default toNodeHandler(auth.handler)