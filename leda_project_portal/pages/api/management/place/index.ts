import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { Place } from '@/lib/definitions';
import { queryGet, queryPost } from '@/lib/query';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const result = await query<Place>(`SELECT "ledaId", "name", CONCAT(COALESCE("addressOne", ''), ' ', COALESCE("addressTwo", ''), ', ', COALESCE("city", ''), ' ', COALESCE("state", ''), ', ', COALESCE("zip", '')) as "addressFull", "addressOne", "addressTwo", "city", "state", "zip", "phoneNumber", "otherNumber", "email", "website", TO_CHAR("establishDate", 'mm/dd/yyyy') as "establishDate", "memo", "numberOfBoards", "sendMailings", "regularSponsor", "currentSponsor", "issues", "lastBarFeePayment", "lastSanctioningDate", "contactId", "placeType" FROM public.leda_place_info;`);
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch genders' });
        }
    } else if (req.method === 'POST') {
        try {
            const results = req.body as Place;
        
            if (results.ledaId === 0) {
                const next_id = await (
                    await queryGet('SELECT COALESCE(MAX("ledaId"), 0) + 1 AS next_leda_id FROM leda_place_info;')
                ).rows[0].next_leda_id;
                results.ledaId = next_id;
            }
        
            const query = `INSERT INTO public.leda_place_info("ledaId", name, "addressOne", "addressTwo", "city", "state", "zip", "phoneNumber", "otherNumber", "email", "website", "establishDate", "memo", "numberOfBoards", "sendMailings", "regularSponsor", "currentSponsor", "issues", "lastBarFeePayment", "lastSanctioningDate", "contactId", "placeType")
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22);`;
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
                results.placeType
            ];
            const result = await queryPost(query, values);
            res.status(201).json({ insert1: result});
        } catch (error: any) {
            console.error("Error in PlayerHandler:", error);
            res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}