import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { Season } from "@/lib/definitions";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

async function queryPost(text: string, values: any) {
    try {
        const res = await pool.query(text, values);
        return res;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

export default async function SeasonHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        console.log(req.body);
        const results = req.body as Season;

        let query = `INSERT INTO maint.leda_maint_seasons(
                    "seasonCode", "fiscalYear", "dates", "desc", "isCurrentSeason")
                    VALUES ($1, $2, $3, $4, $5);`;
        let values = [
            results.seasonCode,
            results.fiscalYear,
            results.dates,
            results.desc,
            results.isCurrentSeason,
        ];

        const result = await queryPost(query, values);

        res.status(201).json({ insert1: result});
    } catch (error: any) {
        console.error("Error in SeasonHandler:", error);
        res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
    }
}