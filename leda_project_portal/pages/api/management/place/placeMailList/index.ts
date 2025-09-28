// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {  MailingList } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await requireApiSession(req, res);
    // Handle POST requests
    if (req.method === "POST") {
        try {
            // Execute the database query to fetch mailing label information
            const result = await query<MailingList>(
                'SELECT "ledaId", name, "addressLineOne", "addressLineTwo", "type" FROM public.leda_place_mailing_list'
            );
            
            if (result.rows.length === 0) {
                return res.status(200).json({ message: "No mailing labels to import" });
            }

            // Batch INSERT operation instead of individual queries
            const values = result.rows.map(row => [
                row.ledaId, 
                row.name, 
                row.addressLineOne, 
                row.addressLineTwo, 
                row.type
            ]);

            // Create parameterized placeholders for batch insert
            const placeholders = values
                .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
                .join(", ");

            const flatValues = values.flat();

            // Single batch INSERT with ON CONFLICT handling
            await query(
                `INSERT INTO public.leda_mailing_labels ("ledaId", name, "addressLineOne", "addressLineTwo", "type")
                 VALUES ${placeholders}
                 ON CONFLICT ("ledaId", name, "addressLineOne", "addressLineTwo", "type") DO NOTHING`,
                flatValues
            );

            return res.status(200).json({ 
                message: "Mailing labels imported successfully", 
                count: result.rows.length 
            });
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({
                message: "Failed to import mailing labels",
                error,
            });
        }
    } else if (req.method === "GET") {
        if (req.query.alreadySelected) {
            try {
                // Format the already selected string for SQL IN clause
                const selectedString = req.query.alreadySelected as string;
                // Split by comma, trim whitespace, and wrap each value in single quotes
                const formattedSelectedString = selectedString
                    .split(",")
                    .map((id) => `'${id.trim()}'`)
                    .join(",");

                const result = await query<MailingList>(`SELECT "ledaId", "name", concat(COALESCE("addressOne", ''::text), ' ', COALESCE("addressTwo", ''::text)) AS "addressLineOne", concat(COALESCE(city, ''::text), ', ', COALESCE(state, ''::text), ' ', COALESCE(zip, ''::text::character varying)) AS "addressLineTwo", 'PLACE' as "type" FROM leda_place_info WHERE "ledaId" NOT IN (${formattedSelectedString})`)

                return res.status(200).json(result.rows);
            } catch (error) {
                // Handle any errors that occur during the query
                res.status(500).json({
                    message: "Failed to fetch place mailing labels",
                    error,
                });
            }
        } else {
            try {
                const result = await query<MailingList>(`SELECT "ledaId", "name", concat(COALESCE("addressOne", ''::text), ' ', COALESCE("addressTwo", ''::text)) AS "addressLineOne", concat(COALESCE(city, ''::text), ', ', COALESCE(state, ''::text), ' ', COALESCE(zip, ''::text::character varying)) AS "addressLineTwo", 'PLACE' as "type" FROM leda_place_info`)

                return res.status(200).json(result.rows);
            } catch (error) {
                // Handle any errors that occur during the query
                res.status(500).json({
                    message: "Failed to fetch place mailing labels",
                    error,
                });
            }  
        }
        
    } else {
        // Respond with a 405 status code for unsupported methods
        res.status(405).json({ error: "Method not allowed" });
    }
}