/**
 * Low-level PostgreSQL query helpers.
 *
 * Provides two functions that acquire a pooled client, run a query,
 * release the client, and propagate errors with a console log.
 * Prefer `queryGet` for SELECT and `queryPost` for INSERT/UPDATE/DELETE.
 */
// Import the database connection pool
import { pool } from "@/lib/getPool";

// Function to execute a SELECT query
export async function queryGet(text: string) {
	try {
		const client = await pool.connect();
		// Execute the query and return the result
		const res = await client.query(text);
		client.release();
		return res;
	} catch (error) {
		// Log and rethrow any errors
		console.error("Error executing query:", error);
		throw error;
	}
}

// Function to execute an INSERT/UPDATE/DELETE query
export async function queryPost(text: string, values: unknown[]) {
	try {
		const client = await pool.connect();
		// Execute the query with the provided values and return the result
		const res = await client.query(text, values);
		client.release();
		return res;
	} catch (error) {
		// Log and rethrow any errors
		console.error("Error executing query:", error);
		throw error;
	}
}
