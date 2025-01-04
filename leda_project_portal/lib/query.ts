// Import the database connection pool
import { pool } from "@/lib/getPool";

// Function to execute a SELECT query
export async function queryGet(text: string) {
    try {
        // Execute the query and return the result
        const res = await pool.query(text);
        return res;
    } catch (error) {
        // Log and rethrow any errors
        console.error("Error executing query:", error);
        throw error;
    }
}

// Function to execute an INSERT/UPDATE/DELETE query
export async function queryPost(text: string, values: any) {
    try {
        // Execute the query with the provided values and return the result
        const res = await pool.query(text, values);
        return res;
    } catch (error) {
        // Log and rethrow any errors
        console.error("Error executing query:", error);
        throw error;
    }
}