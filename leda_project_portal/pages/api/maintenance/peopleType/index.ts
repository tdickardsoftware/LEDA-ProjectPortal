// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet';
import { PeopleType } from '@/lib/definitions';
import { queryPost } from '@/lib/query';

// Define the API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle GET requests
    if (req.method === 'GET') {
        try {
            // Execute the database query to fetch people type information
            const result = await query<PeopleType>('SELECT "peopleTypeCode", "desc" FROM maint.leda_maint_people_types;');
            // Respond with the query result
            res.status(200).json(result.rows);
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({ error: 'Failed to fetch people type' });
        }
    } 
    // Handle POST requests
    else if (req.method === 'POST') {
        try {
            console.log(req.body);
            const results = req.body as PeopleType;

            // Define the query to insert a new people type
            const query = `INSERT INTO maint.leda_maint_people_types(
                        "peopleTypeCode", "desc")
                        VALUES ($1, $2);`;
            const values = [
                results.peopleTypeCode,
                results.desc
            ];

            // Execute the insert query
            const result = await queryPost(query, values);

            // Respond with the result of the insert operation
            res.status(201).json({ insert1: result });
        } catch (error: any) {
            // Handle any errors that occur during the insert operation
            console.error("Error in PeopleTypeHandler:", error);
            res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
        }
    } 
    // Respond with a 405 status code for unsupported methods
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}