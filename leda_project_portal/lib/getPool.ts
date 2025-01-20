import { Pool } from "pg";
// returns the pool
export const pool = new Pool({
	host: process.env.POSTGRES_HOST,
	database: "leda_db",
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
	ssl: {
		rejectUnauthorized: true,
	},
});
