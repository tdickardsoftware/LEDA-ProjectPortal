import { Pool, QueryResult, QueryResultRow } from "pg";
const pool = new Pool({
    connectionString:process.env.POSTGRES_URL,
})

export const query = <T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> =>{
    return pool.query<T>(text, params);
};

