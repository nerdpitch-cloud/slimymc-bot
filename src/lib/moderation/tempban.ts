import SlimyClient from "../../client";
import { VariablesDB } from "../mysql/variables";

export async function tempbanCheck(client: SlimyClient) {
    let currentTempbansVar = await VariablesDB.get("currentTempbans")
    if (!currentTempbansVar) currentTempbansVar = {
        key: "",
        value: ""
    }

    let currentTempbans = JSON.parse(currentTempbansVar.value)

    for (let key in currentTempbans){
        if(Math.round(Date.now() / 1000) > currentTempbans[key]["expires"]) {
            TempBans.removeMember(key);
            await (await client.guilds.fetch(currentTempbans[key]["guild"])).members.unban(key);
        }
    }
}

export class TempBans {

    private static async _open() {
        let currentTempbansVar = await VariablesDB.get("currentTempbans")
        if (!currentTempbansVar) currentTempbansVar = {
            key: "",
            value: ""
        }

        return JSON.parse(currentTempbansVar.value)
    }

    private static async _write(data: Object) {
        await VariablesDB.set("currentTempbans", JSON.stringify(data))
    }

    public static async genExpiration(duration: number | null) {
        if (!duration) duration = 1
        return Math.round(Date.now() / 1000 + duration * 3600)
    }
    
    public static async addMember(memberId: string, guildId: string, expiresTimestamp: number) {
        let tempBans = await TempBans._open()

        tempBans[memberId] = { "guild": guildId, "expires": expiresTimestamp };

        TempBans._write(tempBans);
    }

    public static async removeMember(memberId: string) {
        let tempBans = await TempBans._open()

        delete tempBans[memberId]
        
        TempBans._write(tempBans);
    }
}