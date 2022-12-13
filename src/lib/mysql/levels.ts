import { LevelsEntry } from "./types";
import { sendSQLQuery } from "./_base";

export class LevelsDB {
	private static async _formatLevel(level: Array<any>): Promise<number | null> {
		try {
			return Number(level[0]["xp"]);
		} catch (err) {
			return null;
		}
	}

	private static async _formatLevels(levels: Array<any>): Promise<Array<LevelsEntry>> {
		const res: Array<LevelsEntry> = [];

		for (let i = 0; i < levels.length; i++) {
			res.push({
				userId: String(levels[i]["user_id"]),
				xp: Number(levels[i]["xp"]),
			});
		}

		return res;
	}
	static async addXp(user_id: string, xp: number) {
		return await sendSQLQuery("INSERT INTO levels (user_id, xp) VALUES (?, ?) ON DUPLICATE KEY UPDATE xp = xp + ?;", [user_id, xp, xp]);
	}

	static async getXp(user_id: string) {
		const res = await sendSQLQuery("SELECT * FROM levels WHERE user_id = ?;", [user_id]);
		if (!Array.isArray(res[0])) throw new Error("res[0] was not an array");

		return await LevelsDB._formatLevel(res[0]);
	}

	static async getAll() {
		const res = await sendSQLQuery("SELECT * FROM levels ORDER BY xp DESC;");
		if (!Array.isArray(res[0])) throw new Error("res[0] was not an array");

		return await LevelsDB._formatLevels(res[0]);
	}
}
