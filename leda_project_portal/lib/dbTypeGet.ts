/**
 * Generic typed query wrapper for the PostgreSQL pool.
 *
 * Provides a thin typed layer over the raw `pg` client query so callers
 * can specify the expected row shape via a type parameter and receive a
 * fully-typed `QueryResult<T>` back.
 */
import { QueryResult, QueryResultRow } from "pg";
import { pool } from "./getPool";

/**
 * Executes a parameterised SQL query and returns a typed `QueryResult<T>`.
 *
 * @param text   - The SQL string (use $1, $2 … for placeholders).
 * @param params - Optional ordered array of parameter values.
 */
export async function query<T extends QueryResultRow>(
	text: string,
	params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> {
	const client = await pool.connect();
	// Execute the query and return the result casted as the type
	const results = await client.query<T>(text, params);
	client.release();
	return results;
}
