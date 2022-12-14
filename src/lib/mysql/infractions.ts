import { Punishment } from "../moderation/moderation";
import { InfractionEntry } from "./types";
import { sendSQLQuery } from "./_base";

export class InfractionsDB {
	private static async _formmatInfractions(infractionsArr: Array<any>): Promise<Array<InfractionEntry>> {
		const res: Array<InfractionEntry> = [];

		for (let i = 0; i < infractionsArr.length; i++) {
			res.push({
				punishment_id: Number(infractionsArr[i]["punishment_id"]),
				user_id: String(infractionsArr[i]["user_id"]),
				punishment: Number(infractionsArr[i]["punishment"]),
				reason: String(infractionsArr[i]["reason"]),
				date_issued: new Date(infractionsArr[i]["date_issued"]),
			});
		}

		return res;
	}

	public static async addInfraction(userId: string, punishment: Punishment, reason: string) {
		return await sendSQLQuery("INSERT INTO infractions (user_id, punishment, reason) VALUES (?, ?, ?);", [userId, punishment.id, reason]);
	}

	public static async removeInfraction(punishmentId: number) {
		return await sendSQLQuery("DELETE FROM infractions WHERE punishment_id = ?", [punishmentId]);
	}

	public static async getAllInfractions(userId: string): Promise<Array<InfractionEntry>> {
		const res = await sendSQLQuery("SELECT * FROM infractions WHERE user_id = ? ORDER BY date_issued DESC;", [userId]);
		if (!Array.isArray(res[0])) throw new Error("res[0] was not an array");

		const formattedRes = await InfractionsDB._formmatInfractions(res[0]);

		return formattedRes;
	}

	public static async getRecentInfractions(userId: string): Promise<Array<InfractionEntry>> {
		const res = await sendSQLQuery("SELECT * FROM `infractions` WHERE user_id = ? AND date_issued >= CURRENT_TIMESTAMP -30;", [userId]);
		if (!Array.isArray(res[0])) throw new Error("res[0] was not an array");

		const formattedRes = await InfractionsDB._formmatInfractions(res[0]);

		return formattedRes;
	}
}
