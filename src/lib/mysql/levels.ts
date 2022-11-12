import { sendSQLQuery } from "./_base";



interface leaderboardEntry {
    user_id: string,
    xp: number    
}

export class LevelsDB {
    static async addXp(user_id: string, xp: number) {
        return await sendSQLQuery("INSERT INTO levels (user_id, xp) VALUES (?, ?) ON DUPLICATE KEY UPDATE xp = xp + ?", [user_id, xp, xp]);
    }

    static async getXp(user_id: string): Promise<null | number> {
        let res = await sendSQLQuery("SELECT xp FROM levels WHERE user_id = ?", [user_id]);
        if (!Array.isArray(res.result)) throw new Error("res.result was not an array");
        if (!res.result[0][0]) return null;

        return Number(res.result[0][0]["xp"])
    }

    static async getLeaderboard(): Promise<Array<leaderboardEntry>> {
        let res = await sendSQLQuery("SELECT * FROM levels ORDER BY xp DESC LIMIT 10");
        if (!Array.isArray(res.result)) throw new Error("res.result was not an array");

        return res.result[0]
    }
}