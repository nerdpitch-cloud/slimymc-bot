import { Punishment } from "../moderation/moderation"
import { sendSQLQuery } from "./_base"

interface Infraction {
    user_id: string
    punishment: number
    reason: string
    date_issued: Date
}

interface GetInfractionsRes {
    success: boolean
    result: Array<Infraction>
}

export class InfractionsDB {
    private static async _formatGetInfractions(infractionsArr: Array<any>): Promise<Array<Infraction>> {
        let res: Array<Infraction> = []

        for (let i = 0; i < infractionsArr.length; i++) {

            res.push({
                user_id: String(infractionsArr[i]["user_id"]),
                punishment: Number(infractionsArr[i]["punishment"]),
                reason: String(infractionsArr[i]["reason"]),
                date_issued: new Date(infractionsArr[i]["date_issued"])
            })
        }
        
        return res
    }

    public static async addInfraction(userId: string, punishment: Punishment, reason: string | null = null) {
        if (!reason) reason = "not provided"
        return await sendSQLQuery("INSERT INTO infractions (user_id, punishment, reason) VALUES (?, ?, ?);", [userId, punishment.id, reason])
    }

    public static async removeInfraction(userId: string) {
        return await sendSQLQuery("DELETE FROM infractions WHERE user_id = ? ORDER BY date_issued DESC LIMIT 1;", [userId])
    }

    public static async getInfractions(userId: string): Promise<GetInfractionsRes> {
        let res = await sendSQLQuery("SELECT * FROM infractions WHERE user_id = ? ORDER BY date_issued DESC", [userId])
        if(!res.success) throw new Error(String(res.result));
        if (!Array.isArray(res.result)) throw new Error("res.result was not an array");
        if (!Array.isArray(res.result[0])) throw new Error("res.result[0] was not an array");
        
        let formattedRes = await InfractionsDB._formatGetInfractions(res.result[0])

        return {
            success: res.success, 
            result: formattedRes
        }
    }
}