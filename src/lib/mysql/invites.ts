import { InviteEntry } from "./types";
import { sendSQLQuery } from "./_base"

export class InvitesDB {
    private static async _formatInvites(invites: Array<any>): Promise<Array<InviteEntry>> {
        let res: Array<InviteEntry> = []

        for (let i = 0; i < invites.length; i++) {

            res.push({
                inviterId: String(invites[i]["inviter_id"]),
                userId: String(invites[i]["user_id"])
            })
        }
        
        return res

    }
    static async getAll() {
        let res = await sendSQLQuery("SELECT inviter_id FROM invites;")
        if (!Array.isArray(res[0])) throw new Error("res[0] was not an array");

        return await InvitesDB._formatInvites(res[0])

    }

    static async addInvite(inviterId: string, userId: string) {
        return await sendSQLQuery("INSERT INTO invites (inviter_id, user_id) VALUES (?, ?);", [inviterId, userId])
    }

    static async removeInvite(userId: string) {
        return await sendSQLQuery("DELETE FROM invites WHERE user_id = ?;", [userId])
    }
}