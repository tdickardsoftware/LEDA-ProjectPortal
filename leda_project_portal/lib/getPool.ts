// eslint-disable-next-line @typescript-eslint/no-require-imports
require ("dotenv").config(".env.preview.local");
import { Pool } from "pg";

const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.PGHOST}/leda_db?sslmode=require`

// returns the pool
export const pool = new Pool({
	connectionString: connectionString,
	ssl: {
	  rejectUnauthorized: false,
	},
});