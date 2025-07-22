// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {  MailingList } from "@/lib/definitions";
import { queryPost } from "@/lib/query";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle POST requests
    if (req.method === "POST") {
        try {
            // Execute the database query to fetch mailing label information
            const result = await query<MailingList>(
                'SELECT "ledaId", name, "addressLineOne", "addressLineTwo" FROM public.leda_place_mailing_list'
            );
            
            for (const row of result.rows) {
                queryPost(
                    'INSERT INTO public.leda_mailing_labels ("ledaId", name, "addressLineOne", "addressLineTwo") VALUES ($1, $2, $3, $4) ON CONFLICT ("ledaId", "name", "addressLineOne", "addressLineTwo") DO NOTHING',
                    [row.ledaId, row.name, row.addressLineOne, row.addressLineTwo]
                );
            }
            return res.status(200).json({ message: "Mailing labels imported successfully" });
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