import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { pool } from "./lib/getPool";

export const auth = betterAuth({
    database: pool,
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        username(),
        nextCookies()
    ],
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "User",
                input: false
            }
        }
    }
})