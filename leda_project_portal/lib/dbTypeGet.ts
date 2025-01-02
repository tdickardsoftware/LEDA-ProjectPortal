
import { QueryResult, QueryResultRow } from "pg";
import { pool } from "./getPool";

export const query = <T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> =>{
    return pool.query<T>(text, params);
};

