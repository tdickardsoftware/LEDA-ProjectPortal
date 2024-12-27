// /pages/api/players.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { Team } from "@/lib/definitions";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

async function queryGet(text: string) {
    try {
        const res = await pool.query(text);
        return res;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

async function queryPost(text: string, values: any) {
    try {
        const res = await pool.query(text, values);
        return res;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

export default async function PlayerHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        console.log(req.body);
        const results = req.body as Team;

        if (results.ledaId === 0) {
            const next_id = await (
                await queryGet(
                    'SELECT COALESCE(MAX("ledaId"), 0) + 1 AS next_leda_id FROM leda_team_info;'
                )
            ).rows[0].next_leda_id;
            results.ledaId = next_id;
        }

        let query = `INSERT INTO public.leda_team_info(
	                "ledaId", "teamName", "establishedDate", memo, "lastTeamFeePayment")
	                VALUES ($1, $2, $3, $4, $5);`;
        let values = [
            results.ledaId,
            results.teamName,
            results.establishedDate,
            results.memo,
            results.lastTeamFeePayment
        ];

        const result = await queryPost(query, values);

        res.status(201).json({ insert1: result});
    } catch (error: any) {
        console.error("Error in PlayerHandler:", error);
        res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
    }
}