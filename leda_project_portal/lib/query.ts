/**
 * Low-level PostgreSQL query helpers.
 *
 * Provides two functions that acquire a pooled client, run a query,
 * release the client, and propagate errors with a console log.
 * Prefer `queryGet` for SELECT and `queryPost` for INSERT/UPDATE/DELETE.
 */
// Import the database connection pool
import { pool } from "@/lib/getPool";
import { withRetry } from "@/lib/retry";

// Function to execute a SELECT query
export async function queryGet(text: string) {
	return withRetry(async () => {
		const client = await pool.connect();
		try {
			const res = await client.query(text);
			return res;
		} finally {
			client.release();
		}
	});
}

// Function to execute an INSERT/UPDATE/DELETE query
export async function queryPost(text: string, values: unknown[]) {
	return withRetry(async () => {
		const client = await pool.connect();
		try {
			const res = await client.query(text, values);
			return res;
		} finally {
			client.release();
		}
	});
}
