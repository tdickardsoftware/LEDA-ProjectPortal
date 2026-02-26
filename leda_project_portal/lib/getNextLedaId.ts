/**
 * Utility to generate the next available LEDA ID for a given table.
 *
 * LEDA IDs are sequential integers used as primary keys throughout the
 * database. This function queries the current MAX and returns MAX + 1,
 * defaulting to 1 when the table is empty (via COALESCE).
 */
import { queryGet } from "@/lib/query";

/**
 * Returns the next unused `ledaId` for the specified PostgreSQL table.
 * Not safe for concurrent inserts without a transaction — use only
 * in single-writer contexts or within a transaction.
 */
export default async function getNextLedaId(tableName: string) {
	// returns the next available ledaId for the specified table
	return parseInt(
		await (
			await queryGet(
				`SELECT COALESCE(MAX("ledaId"), 0) + 1 AS next_leda_id FROM ${tableName};`
			)
		).rows[0].next_leda_id
	);
}
