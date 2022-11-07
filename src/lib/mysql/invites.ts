import { sendSQLQuery } from "./_base"

interface leaderboardType {
    [key: string]: number
}

export class InvitesDB {
    static async getAll(): Promise<leaderboardType> {
        let queryRes = await sendSQLQuery("SELECT inviter_id FROM invites;")
        if (!Array.isArray(queryRes.result)) throw new Error("queryRes.result was not an array")
        if (!Array.isArray(queryRes.result[0])) throw new Error("res.result[0] was not an array");

        const leaderboard: leaderboardType = {}

        for (let i = 0; i < queryRes.result[0].length; i++) {
            let curr = queryRes.result[0][i]
            if (leaderboard[curr["inviter_id"]]) {
                leaderboard[curr["inviter_id"]] = leaderboard[curr["inviter_id"]] + 1
            } else {
                leaderboard[curr["inviter_id"]] = 1
            }
        }

        return leaderboard;

    }

    static async addInvite(inviterId: string, userId: string) {
        await sendSQLQuery("INSERT INTO invites (inviter_id, user_id) VALUES (?, ?)", [inviterId, userId])
    }

    static async removeInvite(userId: string) {
        await sendSQLQuery("DELETE FROM invites WHERE user_id = ?", [userId])
    }
}