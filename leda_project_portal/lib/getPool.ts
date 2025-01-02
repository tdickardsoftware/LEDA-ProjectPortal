import { Pool } from "pg";
// returns the pool
export const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});