import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { PaymentType } from "@/lib/definitions";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

async function queryPost(text: string, values: any) {
    try {
        const res = await pool.query(text, values);
        return res;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

export default async function PaymentTypeHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        console.log(req.body);
        const results = req.body as PaymentType;

        let query = `INSERT INTO maint.leda_maint_payment_types(
                    "paymentType", "desc")
                    VALUES ($1, $2);`;
        let values = [
            results.paymentType,
            results.desc
        ];

        const result = await queryPost(query, values);

        res.status(201).json({ insert1: result});
    } catch (error: any) {
        console.error("Error in PaymentTypeHandler:", error);
        res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
    }
}