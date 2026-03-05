/**
 * PostgreSQL connection pool singleton.
 *
 * Reads credentials from environment variables (POSTGRES_USER, PGHOST,
 * POSTGRES_PASSWORD). SSL is enforced in production with self-signed
 * certificate support; disabled in development.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();
import { Pool } from "pg";

// Singleton pool instance shared across all server-side queries
export const pool = new Pool({
	connectionString: process.env.POSTGRES_URL_LEDADB || process.env.POSTGRES_URL,
	ssl:
		process.env.POSTGRES_SSL === "true"
			? { rejectUnauthorized: true }
			: false,
});
