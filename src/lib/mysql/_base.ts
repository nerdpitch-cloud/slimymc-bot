import { createPool, Pool, RowDataPacket, OkPacket, ResultSetHeader, FieldPacket } from "mysql2/promise"
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
export async function sendSQLQuery(query: string, args: Array<string | number>) {
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

