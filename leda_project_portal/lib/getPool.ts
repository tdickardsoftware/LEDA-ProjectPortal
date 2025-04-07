// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();
import { Pool } from "pg";

// returns the pool
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
