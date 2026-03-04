/**
 * API route for managing place (bar/venue) payment history.
 *
 * GET  - Returns all place payment records; optionally filtered by ledaId.
 *        Joins leda_place_info and leda_maint_seasons for display fields.
 * POST - Inserts or updates a payment record. Handles Part/Bar payment logic:
 *        marks paidOff status, updates leda_place_info.lastBarFeePayment, and
 *        cascades to audit views via leda_place_paid_status.
 * DELETE - Removes a payment record by paymentNbr and re-evaluates lastBarFeePayment.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PaymentHistory } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/payment/placePayment");

// --- Helper Functions ---

/** Returns the fiscal year string for a given season code. */
async function getFiscalYear(seasonCode: string) {
	const result = await query(
		`SELECT "fiscalYear" FROM maint.leda_maint_seasons WHERE "seasonCode" = $1;`,
		[seasonCode]
	);
	return result.rows[0]?.fiscalYear;
}

/** Updates leda_place_info.lastBarFeePayment to "PAID - <seasonCode> - <fiscalYear>" for the given place. */
async function updateLastBarFeePayment(ledaId: string, seasonCode: string) {
	const fiscalYear = await getFiscalYear(seasonCode);
	if (fiscalYear) {
		await queryPost(
			`UPDATE public.leda_place_info SET "lastBarFeePayment" = $1 WHERE "ledaId" = $2;`,
			[`PAID - ${seasonCode} - ${fiscalYear}`, ledaId]
		);
	}
}

/** Resets leda_place_info.lastBarFeePayment to 'UNPAID' when no paid season remains. */
async function setBarFeeUnpaid(ledaId: string) {
	await queryPost(
		`UPDATE public.leda_place_info SET "lastBarFeePayment" = 'UNPAID' WHERE "ledaId" = $1;`,
		[ledaId]
	);
}

/**
 * Returns the most recently paid season record for a place.
 * Optionally excludes a specific season code (used when reverting a payment).
 */
async function getLastPaidBarSeasonInfo(
	ledaId: string,
	excludeSeasonCode?: string
) {
	const queryStr = `
        SELECT "seasonCode", "fiscalYear"
        FROM public.leda_place_paid_status
        WHERE "ledaId" = $1 AND status = 'PAID'
        ${excludeSeasonCode ? `AND "seasonCode" != $2` : ""}
        ORDER BY date1 DESC
        LIMIT 1;
    `;
	const values = excludeSeasonCode ? [ledaId, excludeSeasonCode] : [ledaId];
	const result = await query(queryStr, values);
	return result.rows[0];
}

/**
 * Bulk-marks all unpaid Part payments for a place/season as paidOff = true.
 * Returns the array of updated paymentNbr values.
 */
async function markAllUnpaidPartsPaid(
	type: string,
	seasonCode: string,
	ledaId: string
) {
	const result = await query(
		`SELECT "paymentNbr" FROM maint.leda_maint_place_payment_history WHERE "type" = $1 AND "seasonCode" = $2 AND "ledaId" = $3 AND "paidOff" = false;`,
		[type, seasonCode, ledaId]
	);
	const paymentNbrs = result.rows.map((row) => row.paymentNbr);
	if (paymentNbrs.length > 0) {
		await queryPost(
			`UPDATE maint.leda_maint_place_payment_history SET "paidOff" = true WHERE "paymentNbr" = ANY($1);`,
			[paymentNbrs]
		);
	}
	return paymentNbrs;
}

// --- Main Handler ---

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	if (req.method === "GET") {
		log.info({ method: "GET", ledaId: req.query.ledaId }, "Fetch place payment history request");
		if (req.query.ledaId) {
			try {
				const result = await query<
					PaymentHistory & { fullName: string; fiscalYear: string }
				>(
					`SELECT h."paymentNbr", h."ledaId", h."type", h."paymentType", h."amount", h."seasonCode", h."comp", h."notes", h."paidOff", h."date",
                        p."name" AS "fullName",
                        s."fiscalYear"
                     FROM maint.leda_maint_place_payment_history h
                     JOIN public.leda_place_info p ON h."ledaId" = p."ledaId"
                     JOIN maint.leda_maint_seasons s ON h."seasonCode" = s."seasonCode"
                     WHERE h."ledaId" = $1
                     ORDER BY h."paymentNbr";`,
					[req.query.ledaId as string]
				);
				log.info({ ledaId: req.query.ledaId, count: result.rows.length }, "Fetched place payment history by ledaId");
				res.status(200).json(result.rows);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch place payment history by ledaId");
				res.status(500).json({
					message: "Failed to fetch payment history for ledaId",
					error,
				});
			}
		} else {
			try {
				const result = await query<
					PaymentHistory & { fullName: string; fiscalYear: string }
				>(
					`SELECT h."paymentNbr", h."ledaId", h."type", h."paymentType", h."amount", h."seasonCode", h."comp", h."notes", h."paidOff", h."date",
                        p."name" AS "fullName",
                        s."fiscalYear"
                     FROM maint.leda_maint_place_payment_history h
                     JOIN public.leda_place_info p ON h."ledaId" = p."ledaId"
                     JOIN maint.leda_maint_seasons s ON h."seasonCode" = s."seasonCode"
                     ORDER BY h."paymentNbr";`
				);
				log.info({ count: result.rows.length }, "Fetched all place payment history");
				res.status(200).json(result.rows);
			} catch (error) {
				log.error({ err: error }, "Failed to fetch all place payment history");
				res.status(500).json({
					message: "Failed to fetch payment history",
					error,
				});
			}
		}
		return;
	} else if (req.method === "POST") {
		log.info({ method: "POST", ledaId: req.body?.ledaId }, "Create place payment request");
		try {
			const data = req.body as PaymentHistory;
			// Defensive: if amount is blank, treat it as $0.00.
			data.amount = String((data as unknown as { amount?: unknown }).amount ?? "")
				.trim();
			if (data.amount === "") data.amount = "0.00";
			let queryAdd: string | undefined;
			let values: (string | number | boolean | Date)[] | undefined;

			// Check for unpaid partial payments if adding another partial payment
			let unpaidPartPayments = false;
			if (data.type === "Part" && data.paidOff !== false) {
				const checkResult = await query(
					`SELECT "paymentNbr" FROM maint.leda_maint_place_payment_history WHERE "type" = 'Part' AND "seasonCode" = $1 AND "ledaId" = $2 AND "paidOff" = false;`,
					[data.seasonCode, data.ledaId]
				);
				unpaidPartPayments = checkResult.rows.length > 0;
			}

			// Insert new payment if no paymentNbr and no unpaid partials
			if (
				(data.paymentNbr === null || data.paymentNbr === undefined) &&
				!unpaidPartPayments
			) {
				queryAdd = `INSERT INTO maint.leda_maint_place_payment_history("ledaId", "type", "paymentType", "amount", "seasonCode", "comp", "notes", "paidOff", "date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
				values = [
					data.ledaId,
					data.type,
					data.paymentType,
					data.amount,
					data.seasonCode,
					data.comp,
					data.notes,
					data.paidOff,
					data.date,
				];

				// If this is a paid membership or part payment, update lastBarFeePayment
				if (
					(data.type === "Part" || data.type === "Bar") &&
					data.paidOff === true
				) {
					const getLastPaymentInfoResult = await query(
						`SELECT "lastBarFeePayment" FROM public.leda_place_info WHERE "ledaId" = $1;`,
						[data.ledaId]
					);
					const paymentInfo =
						getLastPaymentInfoResult.rows[0]?.lastBarFeePayment ||
						"";

					if (paymentInfo.includes("UNPAID")) {
						await updateLastBarFeePayment(
							data.ledaId.toString(),
							data.seasonCode
						);
					} else {
						// Only update if this season is after the last paid season
						const lastSeasonCode = paymentInfo.split(" - ")[1];
						const [lastSeason, currentSeason] = await Promise.all([
							query(
								`SELECT dates->>'Date1' as date1 FROM maint.leda_maint_seasons WHERE "seasonCode" = $1;`,
								[lastSeasonCode]
							),
							query(
								`SELECT dates->>'Date1' as date1 FROM maint.leda_maint_seasons WHERE "seasonCode" = $1;`,
								[data.seasonCode]
							),
						]);
						const lastSeasonCodeDate1 = lastSeason.rows[0]?.date1;
						const currentSeasonCodeDate1 =
							currentSeason.rows[0]?.date1;

						if (
							lastSeasonCodeDate1 &&
							currentSeasonCodeDate1 &&
							new Date(lastSeasonCodeDate1) <
								new Date(currentSeasonCodeDate1)
						) {
							await updateLastBarFeePayment(
								data.ledaId.toString(),
								data.seasonCode
							);
						}
					}
				}
			} else if (
				data.paymentNbr !== null &&
				data.paymentNbr !== undefined &&
				data.type === "Part" &&
				data.paidOff === false
			) {
				// Unpay a part payment
				const getPartPaymentPaidStatusResult = await query(
					`SELECT "paymentNbr" FROM maint.leda_maint_place_payment_history WHERE "type" = 'Part' AND "seasonCode" = $1 AND "ledaId" = $2 AND "paidOff" = true AND "paymentNbr" = $3;`,
					[data.seasonCode, data.ledaId, data.paymentNbr]
				);
				let results;
				if (getPartPaymentPaidStatusResult.rows.length > 0) {
					results = await queryPost(
						`UPDATE maint.leda_maint_place_payment_history SET "paidOff" = false WHERE "seasonCode" = $1 AND "ledaId" = $2 and "type" = 'Part'`,
						[data.seasonCode, data.ledaId]
					);

					const pastPaid = await getLastPaidBarSeasonInfo(
						data.ledaId.toString(),
						data.seasonCode
					);
					if (pastPaid) {
						await updateLastBarFeePayment(
							data.ledaId.toString(),
							pastPaid.seasonCode
						);
					} else {
						await setBarFeeUnpaid(data.ledaId.toString());
					}
				}
				res.status(200).json(results);
				return;
			} else if (data.type === "Part" && data.paidOff === true) {
				// Mark all unpaid part payments as paid and insert/update payment
				await markAllUnpaidPartsPaid(
					data.type,
					data.seasonCode,
					data.ledaId.toString()
				);
				await updateLastBarFeePayment(
					data.ledaId.toString(),
					data.seasonCode
				);

				if (data.paymentNbr === null || data.paymentNbr === undefined) {
					queryAdd = `INSERT INTO maint.leda_maint_place_payment_history("ledaId", "type", "paymentType", "amount", "seasonCode", "comp", "notes", "paidOff", "date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
					values = [
						data.ledaId,
						data.type,
						data.paymentType,
						data.amount,
						data.seasonCode,
						data.comp,
						data.notes,
						data.paidOff,
						data.date,
					];
				} else {
					// Upsert if paymentNbr exists
					queryAdd = `INSERT INTO maint.leda_maint_place_payment_history("paymentNbr", "ledaId", "type", "paymentType", "amount", "seasonCode", "comp", "notes", "paidOff", "date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT ("paymentNbr") DO UPDATE SET "ledaId" = $2, "type" = $3, "paymentType" = $4, "amount" = $5, "seasonCode" = $6, "comp" = $7, "notes" = $8, "paidOff" = $9, "date" = $10;`;
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
						data.date,
					];
				}
			} else {
				// Upsert payment history (insert or update on conflict)
				queryAdd = `INSERT INTO maint.leda_maint_place_payment_history("paymentNbr", "ledaId", "type", "paymentType", "amount", "seasonCode", "comp", "notes", "paidOff", "date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT ("paymentNbr") DO UPDATE SET "ledaId" = $2, "type" = $3, "paymentType" = $4, "amount" = $5, "seasonCode" = $6, "comp" = $7, "notes" = $8, "paidOff" = $9, "date" = $10;`;
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
					data.date,
				];
			}

			if (queryAdd && values) {
				const results = await queryPost(queryAdd, values);
				log.info({ ledaId: req.body?.ledaId, type: req.body?.type }, "Upserted place payment");
				res.status(201).json(results);
			} else {
				res.status(200).json({ message: "No operation performed." });
			}
		} catch (error) {
			log.error({ err: error }, "Failed to upsert place payment history");
			res.status(500).json({
				message: "Failed to upsert payment history information",
				error,
			});
		}
		return;
	} else if (req.method === "DELETE") {
		log.info({ method: "DELETE", paymentNbr: req.body?.paymentNbr }, "Delete place payment request");
		try {
			const data = req.body as PaymentHistory;
			const queryDel = `DELETE FROM maint.leda_maint_place_payment_history WHERE "paymentNbr" = $1;`;
			const values = [data.paymentNbr];
			const results = await queryPost(queryDel, values);

			// If deleting a paid membership or part payment, update lastBarFeePayment
			if (
				(data.type === "Part" || data.type === "Memb") &&
				data.paidOff === true
			) {
				const paidStatus = await getLastPaidBarSeasonInfo(
					data.ledaId.toString()
				);
				if (paidStatus) {
					await updateLastBarFeePayment(
						data.ledaId.toString(),
						paidStatus.seasonCode
					);
				} else {
					await setBarFeeUnpaid(data.ledaId.toString());
				}
			}

			res.status(200).json(results);
		} catch (error) {
			log.error({ err: error }, "Failed to delete place payment");
			res.status(500).json({
				message: "Failed to delete payment history information",
				error,
			});
		}
		return;
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.setHeader("Allow", ["GET", "POST", "DELETE"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
