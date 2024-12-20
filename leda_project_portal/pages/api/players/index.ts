// /pages/api/players.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { PlayerMemberInfo } from "@/lib/definitions";

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
        const results = req.body as PlayerMemberInfo;

        if (results.ledaId === 0) {
            const next_id = await (
                await queryGet(
                    'SELECT COALESCE(MAX("ledaId"), 0) + 1 AS next_leda_id FROM leda_player_info;'
                )
            ).rows[0].next_leda_id;
            results.ledaId = next_id;
        }

        let query1 = `INSERT INTO public.leda_player_info(
        "ledaId", "lastName", "firstName", "middleInitial", "addressOne", "addressTwo", "city", "state", "zip", "phoneNumber", "otherNumber", "email", "gender", "dateOfBirth")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;
        console.log(query1)
        let values1 = [
            results.ledaId,
            results.lastName,
            results.firstName,
            results.middleInitial,
            results.addressOne,
            results.addressTwo,
            results.city,
            results.state,
            results.zip,
            results.phoneNumber,
            results.otherNumber,
            results.email,
            results.gender,
            results.dateOfBirth,
        ];

        let query2 = `INSERT INTO public.leda_membership_info(
        "ledaId", "establishDate", "badStanding", "badStandingReason", "takeOffMailing", "mailStandings", "formOnFile", "needsMemberCard", "inactiveDate", "lastMembershipFeePayment", "lastTrailsDate", "memberType", "cannotBeCaptainin", "lifetimeMember", "lifetimeMemberReason")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;
        console.log(query2)
        let values2 = [
            results.ledaId,
            results.establishedDate,
            results.badStanding,
            results.badStandingReason,
            results.takeOffMailing,
            results.mailStandings,
            results.formOnFile,
            results.needsMemberCard,
            results.inactiveDate,
            results.lastMembershipFeePayment,
            results.lastTrailsDate,
            results.memberType,
            results.cannotBeCaptain,
            results.lifetimeMember,
            results.lifetimeMemberReason,
        ];

        const result1 = await queryPost(query1, values1);
        const result2 = await queryPost(query2, values2);

        res.status(201).json({ insert1: result1, insert2: result2 });
    } catch (error: any) {
        console.error("Error in PlayerHandler:", error);
        res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
    }
}