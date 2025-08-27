// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { EmailOneTimeToken } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		try {
            if (req.query.email) {
                // Execute the database query to fetch season code information
                const result = await query<EmailOneTimeToken>(
                    'SELECT "email", "token", "creationDateTime", "expirationDateTime" FROM public.ot_email_signup WHERE "email" = $1',
                    [req.query.email as string]
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } else {
                res.status(400).json({ error: "Email is required" });
            }
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch email one-time tokens",
				error,
			});
		}
    } else if (req.method === "POST") {
        try {
            // Only admins or authenticated flows should create tokens
            await requireApiSession(req, res);
            if (req.query.email) {
                const email = String(req.query.email).trim().toLowerCase();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    return res.status(400).json({ error: "Invalid email" });
                }

                const creationDateTime = new Date();
                const expirationDateTime = new Date(creationDateTime.getTime() + 48 * 60 * 60 * 1000);

                const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
                if (!secret) {
                    return res.status(500).json({ error: "JWT secret not configured" });
                }

                const { SignJWT } = await import("jose");
                const creationSec = Math.floor(creationDateTime.getTime() / 1000);
                const expSec = Math.floor(expirationDateTime.getTime() / 1000);
                const token = await new SignJWT({ email, creationDateTime: creationDateTime.toISOString(), expirationDateTime: expirationDateTime.toISOString() })
                    .setProtectedHeader({ alg: "HS256" })
                    .setIssuedAt(creationSec)
                    .setExpirationTime(expSec)
                    .sign(new TextEncoder().encode(secret));

                // Insert consistent record using the same creation/expiration used for the JWT payload
                await query<EmailOneTimeToken>(
                    'INSERT INTO public.ot_email_signup ("email", "token", "creationDateTime", "expirationDateTime") VALUES ($1, $2, $3, $4)',
                    [email, token, creationDateTime.toISOString(), expirationDateTime.toISOString()]
                );

                // Respond with created token and metadata
                res.status(201).json({ token, email, creationDateTime: creationDateTime.toISOString(), expirationDateTime: expirationDateTime.toISOString() });
            } else {
                // If no email is provided, return an error
                res.status(400).json({ error: "Email is required" });
            }
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({
                message: "Failed to create email one-time token",
                error,
            });
        }
    } else if (req.method === "DELETE") {
        try {
            const email = typeof req.query.email === 'string' ? req.query.email : undefined;
            if (!email) {
                return res.status(400).json({ error: "Email is required" });
            }
            await query(
                'DELETE FROM public.ot_email_signup WHERE "email" = $1',
                [email]
            );
            res.status(200).json({ ok: true });
        } catch (error) {
            res.status(500).json({ message: "Failed to delete token(s)", error });
        }
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}