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
            // Execute the database query to fetch payment history with player full name and fiscalYear for a specific ledaId
            const result = await query<PaymentHistory & { fullName: string; fiscalYear: string }>(
                `SELECT h."paymentNbr", h."ledaId", h."type", h."paymentType", h."amount", h."seasonCode", h."comp", h."notes", h."paidOff", h."date",
                CONCAT(COALESCE(p."firstName", ''), ' ', COALESCE(p."middleInitial", ''), ' ', COALESCE(p."lastName", '')) as "fullName",
                s."fiscalYear"
                 FROM maint.leda_maint_player_payment_history h
                 LEFT JOIN public.leda_player_info p ON h."ledaId" = p."ledaId"
                 LEFT JOIN maint.leda_maint_seasons s ON h."seasonCode" = s."seasonCode"
                 WHERE h."ledaId" = $1
                 ORDER BY h."paymentNbr";`,
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
            // Execute the database query to fetch payment history with player full name and fiscalYear
            const result = await query<PaymentHistory & { fullName: string; fiscalYear: string }>(
                `SELECT h."paymentNbr", h."ledaId", h."type", h."paymentType", h."amount", h."seasonCode", h."comp", h."notes", h."paidOff", h."date",
                CONCAT(COALESCE(p."firstName", ''), ' ', COALESCE(p."middleInitial", ''), ' ', COALESCE(p."lastName", '')) as "fullName",
                s."fiscalYear"
                 FROM maint.leda_maint_player_payment_history h
                 LEFT JOIN public.leda_player_info p ON h."ledaId" = p."ledaId"
                 LEFT JOIN maint.leda_maint_seasons s ON h."seasonCode" = s."seasonCode"
                 ORDER BY h."paymentNbr";`
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
            let queryAdd: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let values : any;
            // Check if there are any partial payments for a player if another partial payment is being added
            let unpaidPartPayments = false;
            if (data.type === "Part" && data.paidOff !== false) {
                // SQL query to check for unpaid part payments
                const checkQuery = `SELECT "paymentNbr" FROM maint.leda_maint_player_payment_history WHERE "type" = 'Part'  AND "seasonCode" = $1 AND "ledaId" = $2 AND "paidOff" = false;`
                // Prepare values for the SQL query
                const checkValues = [
                    data.seasonCode,
                    data.ledaId
                ];
                // Check if there are any unpaid part payments for the given ledaId and seasonCode
                const checkResult = await query(checkQuery, checkValues);
                unpaidPartPayments = checkResult.rows.length > 0;
            }

            if ((data.paymentNbr === null || data.paymentNbr === undefined) && !unpaidPartPayments) {
                queryAdd = 'INSERT INTO maint.leda_maint_player_payment_history("ledaId", "type", "paymentType", "amount", "seasonCode", "comp", "notes", "paidOff", "date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);'
                values = [
                    data.ledaId,
                    data.type,
                    data.paymentType,
                    data.amount,
                    data.seasonCode,
                    data.comp,
                    data.notes,
                    data.paidOff,
                    data.date // Note: Ensure this matches the column "paymentDate"
                ];
                if ((data.type === "Part" || data.type === "Memb") && data.paidOff === true) {
                    const getLastPaymentInfoQuery = `SELECT "lastMembershipFeePayment" from public.leda_membership_info WHERE "ledaId" = $1;`
                    const getLastPaymentInfoValues = [
                        data.ledaId
                    ];
                    const getLastPaymentInfoResult = await query(getLastPaymentInfoQuery, getLastPaymentInfoValues);
                    const paymentInfo = getLastPaymentInfoResult.rows[0].lastMembershipFeePayment;
                    if (paymentInfo.includes("UNPAID")) {
                        const getCurrentFiscalYearQuery = `SELECT "fiscalYear" FROM maint.leda_maint_seasons WHERE "seasonCode" = $1;`
                        const getCurrentFiscalYearValues = [data.seasonCode];
                        const getCurrentFiscalYearResult = await query(getCurrentFiscalYearQuery, getCurrentFiscalYearValues);
                        const currentSeasonFiscalYear = getCurrentFiscalYearResult.rows[0]?.fiscalYear;
                        const updateLastPaymentQuery = `UPDATE public.leda_membership_info SET "lastMembershipFeePayment" = $1 WHERE "ledaId" = $2;`
                        const updateLastPaymentValues = [
                            `PAID - ${data.seasonCode} - ${currentSeasonFiscalYear}`,
                            data.ledaId
                        ];
                        await queryPost(updateLastPaymentQuery, updateLastPaymentValues);
                    } else {
                        const lastSeasonCode = paymentInfo.split(" - ")[1];
                        const getLastSeasonCodeDate1Query = `SELECT dates->>'Date1' as date1 FROM maint.leda_maint_seasons WHERE "seasonCode" = $1;`
                        const getLastSeasonCodeDate1Values = [lastSeasonCode];
                        const getLastSeasonCodeDate1Result = await query(getLastSeasonCodeDate1Query, getLastSeasonCodeDate1Values);
                        const lastSeasonCodeDate1 = getLastSeasonCodeDate1Result.rows[0]?.date1;

                        const getCurrentSeasonCodeDate1Query = `SELECT dates->>'Date1' as date1, "fiscalYear" FROM maint.leda_maint_seasons WHERE "seasonCode" = $1;`
                        const getCurrentSeasonCodeDate1Values = [data.seasonCode];
                        const getCurrentSeasonCodeDate1Result = await query(getCurrentSeasonCodeDate1Query, getCurrentSeasonCodeDate1Values);
                        const currentSeasonCodeDate1 = getCurrentSeasonCodeDate1Result.rows[0]?.date1;
                        const currentSeasonFiscalYear = getCurrentSeasonCodeDate1Result.rows[0]?.fiscalYear;
                        if (lastSeasonCodeDate1 && currentSeasonCodeDate1 && new Date(lastSeasonCodeDate1) < new Date(currentSeasonCodeDate1)) {
                            const updateLastPaymentQuery = `UPDATE public.leda_membership_info SET "lastMembershipFeePayment" = $1 WHERE "ledaId" = $2;`
                            const updateLastPaymentValues = [
                                `PAID - ${data.seasonCode} - ${currentSeasonFiscalYear}`,
                                data.ledaId
                            ];
                            await queryPost(updateLastPaymentQuery, updateLastPaymentValues);
                        }
                    }
                }
            } else if (data.type === "Part" && data.paidOff === true) {
                const getPartPaymentNbrQuery = 'SELECT "paymentNbr" FROM maint.leda_maint_player_payment_history WHERE "type" = $1 AND "seasonCode" = $2 AND "ledaId" = $3 AND "paidOff" = false;'
                const getPartPaymentNbrValues = [
                    data.type,
                    data.seasonCode,
                    data.ledaId
                ];
                const result = await query(getPartPaymentNbrQuery, getPartPaymentNbrValues);
                
                // Extract payment numbers from the result
                const paymentNbrs = result.rows.map(row => row.paymentNbr);
                
                // Update all unpaid part payments to paid
                const updatePaidOffQuery = 'UPDATE maint.leda_maint_player_payment_history SET "paidOff" = true WHERE "paymentNbr" = ANY($1);';
                await queryPost(updatePaidOffQuery, [paymentNbrs]);
                
                queryAdd = 'INSERT INTO maint.leda_maint_player_payment_history("ledaId", "type", "paymentType", "amount", "seasonCode", "comp", "notes", "paidOff", "date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);'
                 values = [
                    data.ledaId,
                    data.type,
                    data.paymentType,
                    data.amount,
                    data.seasonCode,
                    data.comp,
                    data.notes,
                    data.paidOff,
                    data.date // Note: Ensure this matches the column "paymentDate"
                    ];
            } else {
                // SQL query for upserting payment history (insert or update on conflict)
                queryAdd = 'INSERT INTO maint.leda_maint_player_payment_history("paymentNbr", "ledaId", "type", "paymentType", "amount", "seasonCode", "comp", "notes", "paidOff", "date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT ("paymentNbr") DO UPDATE SET "ledaId" = $2, "type" = $3, "paymentType" = $4, "amount" = $5, "seasonCode" = $6, "comp" = $7, "notes" = $8, "paidOff" = $9, "date" = $10;'
                values = [
                    data.paymentNbr,
                    data.ledaId,
                    data.type,
                    data.paymentType,
                    data.amount,
                    data.seasonCode,
                    data.comp,
                    data.notes,
                    data.paidOff,
                    data.date // Note: Ensure this matches the column "paymentDate"
                    ];
            }

            // Execute the upsert query
            const results = await queryPost(queryAdd, values);

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
            const queryDel = 'DELETE FROM maint.leda_maint_player_payment_history WHERE "paymentNbr" = $1;'
            
            // Prepare values for the SQL query
            const values = [
                data.paymentNbr,
            ];

            // Execute the delete query
            const results = await queryPost(queryDel, values);

            if ((data.type === "Part" || data.type === "Memb") && data.paidOff === true) {
                // Query the view to get the most recent PAID status for this player
                const paidStatusQuery = `
                    SELECT "seasonCode", "fiscalYear"
                    FROM public.leda_player_paid_status
                    WHERE "ledaId" = $1 AND status = 'PAID'
                    ORDER BY date1 DESC
                    LIMIT 1;
                `;
                const paidStatusResult = await query(paidStatusQuery, [data.ledaId]);
                if (paidStatusResult.rows.length > 0) {
                    const { seasonCode, fiscalYear } = paidStatusResult.rows[0];
                    const updateLastPaymentQuery = `
                        UPDATE public.leda_membership_info
                        SET "lastMembershipFeePayment" = $1
                        WHERE "ledaId" = $2;
                    `;
                    const updateLastPaymentValues = [
                        `PAID - ${seasonCode} - ${fiscalYear}`,
                        data.ledaId
                    ];
                    await queryPost(updateLastPaymentQuery, updateLastPaymentValues);
                } else {
                    // No previous PAID found, set to UNPAID
                    const updateLastPaymentQuery = `
                        UPDATE public.leda_membership_info
                        SET "lastMembershipFeePayment" = 'UNPAID'
                        WHERE "ledaId" = $1;
                    `;
                    await queryPost(updateLastPaymentQuery, [data.ledaId]);
                }
            }

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