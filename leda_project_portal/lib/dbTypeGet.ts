
import { QueryResult, QueryResultRow } from "pg";
import { pool } from "./getPool";

export const query = <T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> =>{
    // Execute the query and return the result casted as the type
    return pool.query<T>(text, params);
};

