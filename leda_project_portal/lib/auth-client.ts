import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
    baseURL: process.env.URL,
    plugins: [
        usernameClient(),
        inferAdditionalFields({
            user: {
                role: {type: "string"}
            }
        })
    ],
})