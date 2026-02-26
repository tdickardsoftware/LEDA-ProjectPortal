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
	user: process.env.POSTGRES_USER,
	host: process.env.PGHOST,
	database: "leda_db",
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
	ssl:
		process.env.NODE_ENV === "production"
			? { rejectUnauthorized: false }
			: undefined,
});
