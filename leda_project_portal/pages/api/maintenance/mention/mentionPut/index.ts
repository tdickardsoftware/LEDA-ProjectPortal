import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { Mention } from "@/lib/definitions";

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

export default async function MentionHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        console.log(req.body);
        const results = req.body as Mention;

        let query = `INSERT INTO maint.leda_maint_mentions(
                    "mentionCode", "desc", "points", "mentionBasis")
                    VALUES ($1, $2, $3, $4);`;
        let values = [
            results.mentionCode,
            results.desc,
            results.points,
            results.mentionBasis
        ];

        const result = await queryPost(query, values);

        res.status(201).json({ insert1: result});
    } catch (error: any) {
        console.error("Error in Mention Handler:", error);
        res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
    }
}