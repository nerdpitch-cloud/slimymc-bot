import { createPool, Pool } from "mysql2/promise";
import { Config } from "../../conf/config";

let pool: Pool;

export async function initSQLPool(config: Config) {
	pool = await createPool({
		host: config.mysql.host,
		user: config.mysql.username,
		password: config.mysql.password,
		database: config.mysql.database,
		supportBigNumbers: true,
	});
}
export async function sendSQLQuery(query: string, args: Array<string | number> | null = null) {
	try {
		return await pool.execute(query, args);
	} catch (err) {
		throw err;
	}
}
