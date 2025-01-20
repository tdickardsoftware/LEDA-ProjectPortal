import { QueryResult, QueryResultRow } from "pg";
import getPool from "./getPool";

export async function query<T extends QueryResultRow>(
	text: string,
	params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> {
	// Execute the query and return the result casted as the type
	return await (await getPool()).query<T>(text, params);
}
