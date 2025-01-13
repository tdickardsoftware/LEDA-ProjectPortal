// imports
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Place } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import getNextLedaId from "@/lib/getNextLedaId";
// handler function
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// handle get method
	if (req.method === "GET") {
		try {
			// get data from database
			const result = await query<Place>(
				`SELECT "ledaId", "name", CONCAT(COALESCE("addressOne", ''), ' ', COALESCE("addressTwo", ''), ', ', COALESCE("city", ''), ' ', COALESCE("state", ''), ', ', COALESCE("zip", '')) as "addressFull", "addressOne", "addressTwo", "city", "state", "zip", "phoneNumber", "otherNumber", "email", "website", TO_CHAR("establishDate", 'mm/dd/yyyy') as "establishDate", "memo", "numberOfBoards", "sendMailings", "regularSponsor", "currentSponsor", "issues", "lastBarFeePayment", "lastSanctioningDate", "contactId", "placeType" FROM public.leda_place_info;`
			);
			// set status to 200 and send data
			res.status(200).json(result.rows);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch places ", error });
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
			console.error("Error in PlayerHandler:", error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			}); // Send error info in JSON
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
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
