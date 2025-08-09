import { betterAuth } from "better-auth";
import { pool } from "./lib/getPool";

export const auth = betterAuth({
    database: pool
})