import { createPool } from "mysql2/promise"
import { Pool } from "mysql2/promise"
import { host, username, password, database } from "../../conf/mysql.json"

var pool: Pool;

export async function initSQLPool() {
    pool = await createPool({
        host: host,
        user: username,
        password: password,
        database: database
    });
}
export async function sqlQuery(query: string) {
    return await pool.query(query, function (error: Error, result: string) {
        if (error) throw error;
        return result;
    });
}

