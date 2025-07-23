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
                'SELECT "ledaId", name, "addressLineOne", "addressLineTwo", "type" FROM public.leda_mailing_labels'
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
    } else if (req.method === "POST") {
        try {
            const mailingLabels: MailingList[] = req.body;
            if (!Array.isArray(mailingLabels) || mailingLabels.length === 0) {
                return res.status(400).json({ error: "Request body must be a non-empty array of mailing labels" });
            }

            const values = mailingLabels.map(label => [
                label.ledaId,
                label.name,
                label.addressLineOne,
                label.addressLineTwo,
                label.type
            ]);

            const placeholders = values
                .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
                .join(", ");

            const flatValues = values.flat();

            await query(
                `INSERT INTO public.leda_mailing_labels ("ledaId", name, "addressLineOne", "addressLineTwo", "type")
                 VALUES ${placeholders}
                 ON CONFLICT ("ledaId", name, "addressLineOne", "addressLineTwo", "type") DO NOTHING`,
                flatValues
            );

            res.status(200).json({ success: true });
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({
                message: "Failed to import mailing labels",
                error,
            });
        }
    } else if (req.method === "DELETE") {
        try {
            const { ledaId, name, addressLineOne, addressLineTwo } = req.body;
            if (!ledaId || !name || !addressLineOne) {
                return res.status(400).json({ error: "ledaId, name, and addressLineOne are required" });
            }
            await query(
                `DELETE FROM public.leda_mailing_labels
                 WHERE "ledaId" = $1 AND name = $2 AND "addressLineOne" = $3 AND "addressLineTwo" IS NOT DISTINCT FROM $4`,
                [ledaId, name, addressLineOne, addressLineTwo ?? null]
            );
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete mailing label",
                error,
            });
        }
    } else {
        // Respond with a 405 status code for unsupported methods
        res.status(405).json({ error: "Method not allowed" });
    }
}