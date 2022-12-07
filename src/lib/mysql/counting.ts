import { CountingEntry } from "./types";
import { sendSQLQuery } from "./_base";

export class CountingDB {
	private static async _FormatCount(count: Array<any>): Promise<Array<CountingEntry>> {
		let formatted: Array<CountingEntry> = [];
		for (let i = 0; i < count.length; i++) {
			formatted.push({
				userId: count[i].user_id,
				count: count[i].count,
			});
		}

		return formatted;
	}
	public static async addCount(user_id: string) {
		return await sendSQLQuery("INSERT INTO counting (user_id, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1;", [user_id]);
	}

	public static async getAll() {
		let res = await sendSQLQuery("SELECT * FROM counting ORDER BY count DESC");
		if (!Array.isArray(res[0])) throw new Error("res[0] was not an array");

		return await this._FormatCount(res[0]);
	}
}
