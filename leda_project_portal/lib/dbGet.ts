// Imports
import { Pool } from "pg";
// Define Pool
const pool = new Pool({
    connectionString:process.env.POSTGRES_URL,
})
// define function that gets the data *without type*
export default async function QueryGet(text:string) {
    try {
        const res = await pool.query(text)
        return res
    } catch (error) {
        console.error("Error executing query:", error);
        throw error
    }
}