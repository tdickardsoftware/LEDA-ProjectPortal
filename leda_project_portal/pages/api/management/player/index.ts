import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Player, PlayerMemberInfo } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import getNextLedaId from "@/lib/getNextLedaId";
import { DatabaseError } from "pg";

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
				const result = await query<PlayerMemberInfo>(
					`
					SELECT 
						m."ledaId",
						m."establishedDate",
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
						m."cannotBeCaptain",
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
						p."dateOfBirth",
						CONCAT(COALESCE(p."firstName", ''), ' ', COALESCE(p."middleInitial", ''), ' ', COALESCE(p."lastName", '')) as "fullName"
					FROM public.leda_membership_info m
					JOIN public.leda_player_info p ON m."ledaId" = p."ledaId"
					WHERE m."ledaId" = $1
				`,
					[ledaId as string]
				);
				if (result.rows.length === 0) {
					res.status(404).json({ message: "Player not found" });
				} else {
					res.status(200).json(result.rows[0]);
				}
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
					FROM public.leda_player_info ORDER BY "ledaId";
				`);
				res.status(200).json(result.rows);
			}
		} catch (error) {
			console.error("Error in PlayerHandler:", error);
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
                    "ledaId", "establishedDate", "badStanding", "badStandingReason", "takeOffMailing", "mailStandings", 
                    "formOnFile", "needsMemberCard", "inactiveDate", "lastMembershipFeePayment", "lastTrailsDate", 
                    "memberType", "cannotBeCaptain", "lifetimeMember", "lifetimeMemberReason"
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
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "A player with the same ledaId already exists",
				});
			} else {
				res.status(500).json({
					message: (error as Error).message || "Server error",
				});
			}
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as Player;
			const query1 = `DELETE FROM public.leda_player_info WHERE "ledaId" = $1`;
			const query2 = `DELETE FROM public.leda_membership_info WHERE "ledaId" = $1`;
			const values = [data.ledaId];
			const result1 = await queryPost(query1, values);
			const result2 = await queryPost(query2, values);
			res.status(200).json({ "result1 ": result1, result2: result2 });
		} catch (error) {
			console.error("Error in PlayerHandler:", error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		console.log("PUT request");
		try {
			const data = req.body as PlayerMemberInfo;
			const query1 = `
				UPDATE public.leda_player_info
				SET 
					"lastName" = $1,
					"firstName" = $2,
					"middleInitial" = $3,
					"addressOne" = $4,
					"addressTwo" = $5,
					city = $6,
					state = $7,
					zip = $8,
					"phoneNumber" = $9,
					"otherNumber" = $10,
					email = $11,
					gender = $12,
					"dateOfBirth" = $13
				WHERE "ledaId" = $14
			`;
			const values1 = [
				data.lastName,
				data.firstName,
				data.middleInitial,
				data.addressOne,
				data.addressTwo,
				data.city,
				data.state,
				data.zip,
				data.phoneNumber,
				data.otherNumber,
				data.email,
				data.gender,
				data.dateOfBirth,
				data.ledaId,
			];

			const query2 = `
				UPDATE public.leda_membership_info
				SET 
					"establishedDate" = $1,
					"badStanding" = $2,
					"badStandingReason" = $3,
					"takeOffMailing" = $4,
					"mailStandings" = $5,
					"formOnFile" = $6,
					"needsMemberCard" = $7,
					"inactiveDate" = $8,
					"lastMembershipFeePayment" = $9,
					"lastTrailsDate" = $10,
					"memberType" = $11,
					"cannotBeCaptain" = $12,
					"lifetimeMember" = $13,
					"lifetimeMemberReason" = $14
				WHERE "ledaId" = $15
			`;
			const values2 = [
				data.establishedDate,
				data.badStanding,
				data.badStandingReason,
				data.takeOffMailing,
				data.mailStandings,
				data.formOnFile,
				data.needsMemberCard,
				data.inactiveDate,
				data.lastMembershipFeePayment,
				data.lastTrailsDate,
				data.memberType,
				data.cannotBeCaptain,
				data.lifetimeMember,
				data.lifetimeMemberReason,
				data.ledaId,
			];

			const result1 = await queryPost(query1, values1);
			const result2 = await queryPost(query2, values2);

			res.status(200).json({ update1: result1, update2: result2 });
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
