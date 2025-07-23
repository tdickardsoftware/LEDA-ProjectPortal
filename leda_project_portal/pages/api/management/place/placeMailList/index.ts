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
                'SELECT "ledaId", name, "addressLineOne", "addressLineTwo", "type" FROM public.leda_place_mailing_list'
            );
            
            for (const row of result.rows) {
                queryPost(
                    'INSERT INTO public.leda_mailing_labels ("ledaId", name, "addressLineOne", "addressLineTwo", "type") VALUES ($1, $2, $3, $4, $5) ON CONFLICT ("ledaId", "name", "addressLineOne", "addressLineTwo", "type") DO NOTHING',
                    [row.ledaId, row.name, row.addressLineOne, row.addressLineTwo, row.type]
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

                const result = await query<MailingList>(`SELECT "ledaId", "name", concat(COALESCE("addressOne", ''::text), ' ', COALESCE("addressTwo", ''::text)) AS "addressLineOne", concat(COALESCE(city, ''::text), ', ', COALESCE(state, ''::text), ' ', COALESCE(zip, ''::text::character varying)) AS "addressLineTwo", "PLACE" as "type" FROM leda_place_info WHERE "ledaId" IN (${formattedSelectedString})`)

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
                const result = await query<MailingList>(`SELECT "ledaId", "name", concat(COALESCE("addressOne", ''::text), ' ', COALESCE("addressTwo", ''::text)) AS "addressLineOne", concat(COALESCE(city, ''::text), ', ', COALESCE(state, ''::text), ' ', COALESCE(zip, ''::text::character varying)) AS "addressLineTwo", "PLACE" as "type" FROM leda_place_info`)

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