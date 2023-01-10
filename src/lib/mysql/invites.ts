import { InviteEntry, InvitesLeaderboardEntry } from "./types";
import { sendSQLQuery } from "./_base";

export class InvitesDB {
	private static async _formatInvites(invites: Array<any>): Promise<Array<InviteEntry>> {
		const res: Array<InviteEntry> = [];

		for (let i = 0; i < invites.length; i++) {
			res.push({
				inviterId: String(invites[i]["inviter_id"]),
				userId: String(invites[i]["user_id"]),
			});
		}

		return res;
	}
	static async getAll() {
		const res = await sendSQLQuery("SELECT * FROM invites;");
		if (!Array.isArray(res[0])) throw new Error("res[0] was not an array");

		return await InvitesDB._formatInvites(res[0]);
	}

	static async addInvite(inviterId: string, userId: string) {
		return await sendSQLQuery("INSERT INTO invites (inviter_id, user_id) VALUES (?, ?);", [inviterId, userId]);
	}

	static async removeInvite(userId: string) {
		return await sendSQLQuery("DELETE FROM invites WHERE user_id = ?;", [userId]);
	}

	static async getLeaderboard() {
		const allInvites = await InvitesDB.getAll();

		const leaderboardDict: { [inviterId: string]: number } = {};

		for (let i = 0; i < allInvites.length; i++) {
			leaderboardDict[allInvites[i].inviterId] = Number(leaderboardDict[allInvites[i].inviterId]) + 1 || 1;
		}

		const leaderboardArr = Object.keys(leaderboardDict).map((key) => {
			return [key, leaderboardDict[key]];
		});

		leaderboardArr
			.sort((first, second) => {
				return Number(first[1]) - Number(second[1]);
			})
			.reverse();

		const leaderboard: Array<InvitesLeaderboardEntry> = [];
		for (let i = 0; i < leaderboardArr.length; i++) {
			leaderboard.push({
				userId: String(leaderboardArr[i][0]),
				invites: Number(leaderboardArr[i][1]),
			});
		}

		return leaderboard;
	}
}
