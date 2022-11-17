import { sendSQLQuery } from "./_base"

interface latestCount {
    user_id: string,
    number: number
}

export class CountingDB {
    public static async addCount(user_id: string) {
        return await sendSQLQuery("INSERT INTO counting (user_id, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1;", [user_id])
    }
}