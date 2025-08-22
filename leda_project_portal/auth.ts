import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";
import { pool } from "./lib/getPool";
import { transport } from "./lib/email";



export const auth = betterAuth({
    database: pool,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
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