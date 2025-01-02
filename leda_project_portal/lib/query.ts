import { pool } from "@/lib/getPool";

export async function queryGet(text: string) {
    try {
        const res = await pool.query(text);
        return res;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

export async function queryPost(text: string, values: any) {
    try {
        const res = await pool.query(text, values);
        return res;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}