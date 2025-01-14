import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Player, PlayerMemberInfo } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import getNextLedaId from "@/lib/getNextLedaId";

/**
 * API handler for managing player information.
 * Supports GET, POST, and DELETE methods.
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		try {
			if (req.query.ledaId) {
				const ledaId = req.query.ledaId;
				const result = await query<PlayerMemberInfo>(`
					SELECT 
						m."ledaId",
						m."establishDate",
						m."badStanding",
						m."badStandingReason",
						m."takeOffMailing",
						m."mailStandings",
						m."formOnFile",
						m."needsMemberCard",
						m."inactiveDate",
						m."lastMembershipFeePayment",
						m."lastTrailsDate",
						m."memberType",
						m."cannotBeCaptainin",
						m."lifetimeMember",
						m."lifetimeMemberReason",
						p."lastName",
						p."firstName",
						p."middleInitial",
						p."addressOne",
						p."addressTwo",
						p.city,
						p.state,
						p.zip,
						p."phoneNumber",
						p."otherNumber",
						p.email,
						p.gender,
						p."dateOfBirth"
					FROM public.leda_membership_info m
					JOIN public.leda_player_info p ON m."ledaId" = p."ledaId"
					WHERE m."ledaId" = $1
				`, [ledaId as string]);
				res.status(200).json(result.rows[0]);
			} else {
				// Fetch player information from the database
				const result = await query<Player>(`
					SELECT 
						"ledaId", 
						CONCAT(COALESCE("firstName", ''), ' ', COALESCE("middleInitial", ''), ' ', COALESCE("lastName", '')) as "fullName", 
						"lastName", "firstName", "middleInitial", "addressOne", "addressTwo", "city", "state", "zip", 
						"phoneNumber", "otherNumber", "email", "gender", 
						TO_CHAR("dateOfBirth", 'mm/dd/yyyy') as "dateOfBirth", 
						'(' || SUBSTRING("phoneNumber" FROM 1 FOR 3) || ')-' || SUBSTRING("phoneNumber" FROM 4 FOR 3) || '-' || SUBSTRING("phoneNumber" FROM 7 FOR 4) AS "phoneNumberFormatted", 
						'(' || SUBSTRING("otherNumber" FROM 1 FOR 3) || ')-' || SUBSTRING("otherNumber" FROM 4 FOR 3) || '-' || SUBSTRING("otherNumber" FROM 7 FOR 4) AS "otherNumberFormatted" 
					FROM public.leda_player_info;
				`);
				res.status(200).json(result.rows);
			}
		} catch (error) {
			res.status(500).json({
				message: "Failed to fetch player information",
				error,
			});
		}
	} else if (req.method === "POST") {
		try {
			const results = req.body as PlayerMemberInfo;

			// Generate a new ledaId if not provided
			if (results.ledaId === 0) {
				results.ledaId = await getNextLedaId("leda_player_info");
			}

			// Insert player information into the database
			const query1 = `
                INSERT INTO public.leda_player_info(
                    "ledaId", "lastName", "firstName", "middleInitial", "addressOne", "addressTwo", "city", "state", "zip", 
                    "phoneNumber", "otherNumber", "email", "gender", "dateOfBirth"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `;
			const values1 = [
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

			// Insert membership information into the database
			const query2 = `
                INSERT INTO public.leda_membership_info(
                    "ledaId", "establishDate", "badStanding", "badStandingReason", "takeOffMailing", "mailStandings", 
                    "formOnFile", "needsMemberCard", "inactiveDate", "lastMembershipFeePayment", "lastTrailsDate", 
                    "memberType", "cannotBeCaptainin", "lifetimeMember", "lifetimeMemberReason"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `;
			const values2 = [
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

			// Execute the queries
			const result1 = await queryPost(query1, values1);
			const result2 = await queryPost(query2, values2);

			res.status(201).json({ insert1: result1, insert2: result2 });
		} catch (error) {
			console.error("Error in PlayerHandler:", error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as Player;
			const query1 = `DELETE FROM public.leda_player_info WHERE "ledaId" = $1`;
			const query2 = `DELETE FROM public.leda_membership_info WHERE "ledaId" = $1`;
			const values = [data.ledaId];
			const result1 = await queryPost(query1, values);
			const result2 = await queryPost(query2, values);
			res.status(200).json({"result1 ":result1,  "result2":result2});
		} catch (error) {
			console.error("Error in PlayerHandler:", error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
