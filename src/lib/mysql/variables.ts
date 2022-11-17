import { refreshDbVariables } from "../variables";
import { sendSQLQuery } from "./_base";

export interface dbVariable {
    key: string
    value: string
}
export class VariablesDB {
    static async set(name: string, value: string | number) {
        let res = await sendSQLQuery("INSERT INTO variables (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?;", [name, value, value]);
        
        await refreshDbVariables()

        return res;
    }

    static async get(name: string | number): Promise <string | null> {
        let res = await sendSQLQuery("SELECT value FROM variables WHERE name = ?;", [name]);

        if (Array.isArray(res.result)) {
            return res.result[0][0]["value"]
        }

        return null;
    }

    static async getAll(): Promise<Array<dbVariable> | null> {
        let res = await sendSQLQuery("SELECT * FROM variables;");
        
        let allVariables: Array<dbVariable> = []

        if (Array.isArray(res.result)) {
            for (let i = 0; i < res.result.length; i++) {
                allVariables.push({
                    key: String(res.result[0][i]["name"]),
                    value: String(res.result[0][i]["value"])
                })
            }

            return allVariables;
        }

        return null;
    }
}