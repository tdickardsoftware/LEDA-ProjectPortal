import { QueryResult, QueryResultRow } from "pg";
import { pool } from "./getPool";

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
