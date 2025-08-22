import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";
import { pool } from "./lib/getPool";
import { transport } from "./lib/email";



export const auth = betterAuth({
    database: pool,
    rateLimit: {
        enabled: true,
        // Default window/max for general auth endpoints
        window: 60, // seconds
        max: 100,   // 100 req/min per IP per endpoint
    // Prefer persistent storage so limits hold across instances
    // Uses DB-backed storage instead of memory/secondary-storage
    storage: "database",
        // Stricter rules on sensitive endpoints to reduce brute-force
        customRules: {
            "/sign-in*": { window: 60, max: 5 },            // 5 login attempts/min/IP
            "/sign-up*": { window: 60, max: 3 },            // 3 sign-ups/min/IP
            "/request-password-reset": { window: 60, max: 3 },
            "/change-password": { window: 60, max: 3 },
            "/change-email": { window: 60, max: 3 },
        },
    },
    session: {
        // Shorter sessions with sliding refresh
        // 2 days expiry, refresh window every 12 hours
        expiresIn: 60 * 60 * 24 * 2,
        updateAge: 60 * 60 * 12,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        // Revoke all other sessions after a password reset completes
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
            try {
                await transport.sendMail({
                    from: `Office <${process.env.SMTP_USER}>`,
                    to: user.email,
                    subject: "Reset your password",
                    html: `
                        <p>Hello ${user.name || ""},</p>
                        <p>Click the link below to reset your password:</p>
                        <a href="${url}" target="_blank">${url}</a>
                    `
                })
                console.log("Password reset email sent successfully")
            } catch (error) {
                console.error("Error sending password reset email:", error)
            }
        }
    },
    
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            try {
                await transport.sendMail({
                    from: `Office <${process.env.SMTP_USER}>`,
                    to: user.email,
                    subject: "Verify your email",
                    html: `
                        <p>Hello ${user.name || ""},</p>
                        <p>Click the link below to verify your email:</p>
                        <a href="${url}" target="_blank">${url}</a>
                        <p>If you didn’t request this, you can ignore this email.</p>
                    `
                })
                console.log("Verification email sent successfully")
            } catch (error) {
                console.error("Error sending verification email:", error)
            }
        }
    },
    
    plugins: [
        username(),
        nextCookies()
    ],
    user: {
        deleteUser: {
            enabled: true
        },
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "User",
                input: false
            }
        },
        attrs: {
            role: true
        }
    }
})