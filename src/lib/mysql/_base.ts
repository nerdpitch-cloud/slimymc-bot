import { createPool, Pool } from "mysql2/promise"
import { host, username, password, database } from "../../conf/mysql.json"

var pool: Pool;

export async function initSQLPool() {
    pool = await createPool({
        host: host,
        user: username,
        password: password,
        database: database,
        supportBigNumbers: true
    });

}
export async function sendSQLQuery(query: string, args: Array<string | number> | null = null) {
    try {
        let res = await pool.execute(query, args);

        return {
            success: true,
            result: res
        }

    } catch (err) {
        return {
            success: false,
            result: err
        }
    }
}

