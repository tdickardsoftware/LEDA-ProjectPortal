import { MentionPlayerHistory } from "@/lib/definitions";
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { queryPost } from "@/lib/query";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        try {
            const data = req.body as MentionPlayerHistory
            const query = `INSERT INTO public.leda_player_mention_history("ledaId", "mentionCode", "mentionDesc", "mentionPoints", "seasonCode", "weekNum", notes, "creationDate", "mentionId", "count") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`
            const values = [
                data.ledaId,
                data.mentionCode,
                data.mentionDesc,
                data.mentionPoints,
                data.seasonCode,
                data.weekNum,
                data.notes,
                new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})),
                data.mentionId,
                data.count
            ]

            const result = await queryPost(query, values)
            res.status(200).json({
                message: "Mention history added successfully",
                result,
            })
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to add mention history",
                error,
            })
        }
    } else if (req.method === "GET") {
        if (req.query.ledaId) {
            try {
                const ledaId = req.query.ledaId as string
                const result = await query<MentionPlayerHistory>(
                    `SELECT "ledaId", "mentionCode", "mentionDesc", "mentionPoints", "seasonCode", "weekNum", notes, "creationDate", "mentionId", "count" FROM public.leda_player_mention_history WHERE "ledaId" = $1 ORDER BY "creationDate" DESC;`, [ledaId])
                res.status(200).json(result.rows)
            } catch (error) {
                res.status(500).json({
                    message: "Failed to fetch mention history",
                    error,
                })
            }
        }
    } else if (req.method === "PUT") {
        try {
            const data = req.body as MentionPlayerHistory
            const query = `UPDATE public.leda_player_mention_history SET "mentionCode" = $1, "mentionDesc" = $2, "mentionPoints" = $3, notes = $6, "creationDate" = $8, "count" = $10 WHERE "mentionId" = $7 and "seasonCode" = $5 and "weekNum" = $6 and "ledaId" = $9;`
            const values = [
                data.mentionCode,
                data.mentionDesc,
                data.mentionPoints,
                data.seasonCode,
                data.weekNum,
                data.notes,
                data.mentionId,
                new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})),
                data.ledaId,
                data.count
            ]

            const result = await queryPost(query, values)
            res.status(200).json({
                message: "Mention history updated successfully",
                result,
            })
        } catch (error) {
            res.status(500).json({
                message: "Failed to update mention history",
                error,
            })
        }
    } else if (req.method === "DELETE") {
        try {
            const data = req.body as MentionPlayerHistory
            const query = `DELETE FROM public.leda_player_mention_history WHERE "mentionId" = $1 and "seasonCode" = $2 and "weekNum" = $3 and "ledaId" = $4;`
            const values = [
                data.mentionId,
                data.seasonCode,
                data.weekNum,
                data.ledaId
            ]

            const result = await queryPost(query, values)
            res.status(200).json({
                message: "Mention history deleted successfully",
                result,
            })
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete mention history",
                error,
            })
        }
    } else {
        res.status(405).json({
            message: "Method not allowed",
        })
    }
}
