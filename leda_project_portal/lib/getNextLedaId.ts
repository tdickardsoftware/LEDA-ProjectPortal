import { queryGet } from "@/lib/query";

export default async function getNextLedaId(tableName: string) {
    return parseInt(await(await queryGet(`SELECT COALESCE(MAX("ledaId"), 0) + 1 AS next_leda_id FROM ${tableName};`)).rows[0].next_leda_id);
}