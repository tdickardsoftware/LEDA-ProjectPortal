// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PaymentHistory } from "@/lib/definitions";
import { queryPost } from "@/lib/query";

export default async function handler(  
    req: NextApiRequest,
    res: NextApiResponse
) {
    if  (req.method === "GET") {
        if (req.query.ledaId) {
            try {
                // Execute the database query to fetch payment history information for a specific ledaId
                const result = await query<PaymentHistory>(
                    'SELECT "paymentNbr", "ledaId", "type", "paymentType", "amount", "seasonCode", "paymentDate" FROM maint.leda_maint_player_payment_history WHERE "ledaId" = $1 ORDER BY "paymentNbr";',
                    [req.query.ledaId as string]
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } catch (error) {
                // Handle any errors that occur during the query
                res.status(500).json({ message: "Failed to fetch payment history for ledaId", error });
            }
        } else {
            try {
                // Execute the database query to fetch payment history information
                const result = await query<PaymentHistory>(
                    'SELECT "paymentNbr", "ledaId", "type", "paymentType", "amount", "seasonCode", "paymentDate" FROM maint.leda_maint_player_payment_history ORDER BY "paymentNbr";'
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } catch (error) {
                // Handle any errors that occur during the query
                res.status(500).json({ message: "Failed to fetch payment history", error });
            }
        }
    } else if (req.method === "POST") {
        try {
            // Parse the request body as PaymentHistory type
            const data = req.body as PaymentHistory;

            // SQL query for upserting payment history (insert or update on conflict)
            const query = 'INSERT INTO maint.leda_maint_player_payment_history("paymentNbr", "ledaId", "type", "paymentType", "amount", "seasonCode", "paymentDate") VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT ("paymentNbr") DO UPDATE SET "ledaId" = $2, "type" = $3, "paymentType" = $4, "amount" = $5, "seasonCode" = $6, "paymentDate" = $7;'

            // Prepare values for the SQL query
            const values = [
            data.paymentNbr,
            data.ledaId,
            data.type,
            data.paymentType,
            data.amount,
            data.seasonCode,
            data.date // Note: Ensure this matches the column "paymentDate"
            ];

            // Execute the upsert query
            const results = await queryPost(query, values);

            // Respond with the result of the upsert operation
            res.status(201).json(results);
        } catch (error) {
            // Log and respond with error if upsert fails
            console.error("Error in POST handler:", error);
            res.status(500).json({
            message: "Failed to upsert payment history information",
            error,
            });
        }
    } else if (req.method === "DELETE") {
        try {
            // Parse the request body as PaymentHistory type
            const data = req.body as PaymentHistory;

            // SQL query for deleting payment history by paymentNbr
            const query = 'DELETE FROM maint.leda_maint_player_payment_history WHERE "paymentNbr" = $1;'
            
            // Prepare values for the SQL query
            const values = [
                data.paymentNbr,
            ];

            // Execute the delete query
            const results = await queryPost(query, values);

            // Respond with the result of the delete operation
            res.status(200).json(results);
        } catch (error) {
            // Log and respond with error if delete fails
            console.error("Error in DELETE handler:", error);
            res.status(500).json({
                message: "Failed to delete payment history information",
                error,
            });
        }
    } else {
        // Handle unsupported HTTP methods
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}