// eslint-disable-next-line @typescript-eslint/no-require-imports
require ("dotenv").config(".env.preview.local");
import { Pool } from "pg";

// returns the pool
export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
	  rejectUnauthorized: false,
	},
});
