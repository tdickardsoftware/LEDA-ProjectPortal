// imports
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Place } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import getNextLedaId from "@/lib/getNextLedaId";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";
// handler function
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// handle get method
	if (req.method === "GET") {
		if (req.query.ledaId) {
			try {
				const result = await query<Place>(
					`SELECT "ledaId", "name", CONCAT(COALESCE("addressOne", ''), ' ', COALESCE("addressTwo", ''), ', ', COALESCE("city", ''), ' ', COALESCE("state", ''), ', ', COALESCE("zip", '')) as "addressFull", "addressOne", "addressTwo", "city", "state", "zip", "phoneNumber", "otherNumber", "email", "website", TO_CHAR("establishDate", 'mm/dd/yyyy') as "establishDate", "memo", "numberOfBoards", "sendMailings", "regularSponsor", "currentSponsor", "issues", "lastBarFeePayment", "lastSanctioningDate", "contactId", "placeType" FROM public.leda_place_info WHERE "ledaId" = $1;`,
					[req.query.ledaId as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch places ",
					error,
				});
			}
		} else {
			try {
				// get data from database
				const result = await query<Place>(
					`SELECT "ledaId", "name", CONCAT(COALESCE("addressOne", ''), ' ', COALESCE("addressTwo", ''), ', ', COALESCE("city", ''), ' ', COALESCE("state", ''), ', ', COALESCE("zip", '')) as "addressFull", "addressOne", "addressTwo", "city", "state", "zip", "phoneNumber", "otherNumber", "email", "website", TO_CHAR("establishDate", 'mm/dd/yyyy') as "establishDate", "memo", "numberOfBoards", "sendMailings", "regularSponsor", "currentSponsor", "issues", "lastBarFeePayment", "lastSanctioningDate", "contactId", "placeType" FROM public.leda_place_info ORDER BY "ledaId";`
				);
				// set status to 200 and send data
				res.status(200).json(result.rows);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch places ",
					error,
				});
			}
		}
		// handle post method
	} else if (req.method === "POST") {
		try {
			// get data from request body and set it to fit the place type
			const results = req.body as Place;
			// if leda id is 0, automatically get the next available leda id
			if (results.ledaId === 0) {
				results.ledaId = await getNextLedaId("leda_place_info");
			}
			// insert query
			const query = `INSERT INTO public.leda_place_info("ledaId", name, "addressOne", "addressTwo", "city", "state", "zip", "phoneNumber", "otherNumber", "email", "website", "establishDate", "memo", "numberOfBoards", "sendMailings", "regularSponsor", "currentSponsor", "issues", "lastBarFeePayment", "lastSanctioningDate", "contactId", "placeType")
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22);`;
			// values to insert
			const values = [
				results.ledaId,
				results.name,
				results.addressOne,
				results.addressTwo,
				results.city,
				results.state,
				results.zip,
				results.phoneNumber,
				results.otherNumber,
				results.email,
				results.website,
				results.establishDate,
				results.memo,
				results.numberOfBoards,
				results.sendMailings,
				results.regularSponsor,
				results.currentSponsor,
				results.issues,
				results.lastBarFeePayment,
				results.lastSanctioningDate,
				results.contactId,
				results.placeType,
			];
			// insert data
			const result = await queryPost(query, values);
			// send response
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "A place with the same ledaId already exists",
				});
			} else {
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
		// handle invalid method
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as Place;
			const query = `DELETE FROM public.leda_place_info WHERE "ledaId" = $1;`;
			const values = [data.ledaId];
			const result = await queryPost(query, values);
			res.status(200).json(result);
		} catch (error) {
			console.error("Error in PlayerHandler:", error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		try {
			const data = req.body as Place;
			const query = `UPDATE public.leda_place_info
				SET 
					name = $2,
					"addressOne" = $3,
					"addressTwo" = $4,
					city = $5,
					state = $6,
					zip = $7,
					"phoneNumber" = $8,
					"otherNumber" = $9,
					email = $10,
					website = $11,
					"establishDate" = $12,
					memo = $13,
					"numberOfBoards" = $14,
					"sendMailings" = $15,
					"regularSponsor" = $16,
					"currentSponsor" = $17,
					issues = $18,
					"lastSanctioningDate" = $19,
					"contactId" = $20,
					"placeType" = $21
				WHERE "ledaId" = $1;`;
			const values = [
				data.ledaId,
				data.name,
				data.addressOne,
				data.addressTwo,
				data.city,
				data.state,
				data.zip,
				data.phoneNumber,
				data.otherNumber,
				data.email,
				data.website,
				data.establishDate,
				data.memo,
				data.numberOfBoards,
				data.sendMailings,
				data.regularSponsor,
				data.currentSponsor,
				data.issues,
				data.lastSanctioningDate,
				data.contactId,
				data.placeType,
			];
			const result = await queryPost(query, values);
			res.status(200).json(result);
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
