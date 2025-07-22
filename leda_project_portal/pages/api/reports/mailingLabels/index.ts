// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {  MailingList } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle GET requests
    if (req.method === "GET") {
        try {
            // Execute the database query to fetch mailing label information
            const result = await query<MailingList>(
                'SELECT "ledaId", name, "addressLineOne", "addressLineTwo" FROM public.leda_mailing_labels'
            );
            // Respond with the query result
            res.status(200).json(result.rows);
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({
                message: "Failed to fetch mailing labels",
                error,
            });
        }
    } else {
        // Respond with a 405 status code for unsupported methods
        res.status(405).json({ error: "Method not allowed" });
    }
}