/**
 * Browser-side Better Auth client.
 *
 * Extends the default client with username login support and type-safe
 * inference of the custom `role` and `mustResetPassword` user fields.
 * Import `authClient` anywhere client components need to interact with
 * the auth session (sign-in, sign-out, getSession, etc.).
 */
import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
    baseURL: process.env.URL,
    plugins: [
        usernameClient(),
        inferAdditionalFields({
            user: {
                role: {type: "string"},
                mustResetPassword: { type: "boolean" }
            }
        })
    ],
})