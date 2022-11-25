import SlimyClient from "../../client";
import {promises as fsp} from "fs"
import { VariablesDB } from "../mysql/variables";

export async function tempbanCheck(client: SlimyClient) {
    let currentTempbandsVar = await VariablesDB.get("currentTempbans")
    if (!currentTempbandsVar) throw new Error("currentTempbans not found in db")

    let currentTempbans = JSON.parse(currentTempbandsVar)
    let currentTempbansObj = JSON.parse(currentTempbans.toString());


    for (let key in currentTempbansObj){
        if(Math.round(Date.now() / 1000) > currentTempbansObj[key]["expires"]) {
            TempBanFile.removeMember(key);
            await (await client.guilds.fetch(currentTempbansObj[key]["guild"])).members.unban(key);
        }
    }
}

export class TempBanFile {
    private static filepath = `${__dirname}/../../commands/tempbans.json`

    private static async _open() {
        let currentTempbans = await VariablesDB.get("currentTempbans")
        if (!currentTempbans) throw new Error("currentTempbans not found in db")

        return JSON.parse(currentTempbans)
    }

    private static async _write(data: Object) {
        await VariablesDB.set("currentTempbans", JSON.stringify(data))
    }

    public static async genExpiration(duration: number) {
        return Math.round(Date.now() / 1000 + duration * 3600)
    }
    
    public static async addMember(memberId: string, guildId: string, expiresTimestamp: number) {
        let tempBans = await TempBanFile._open()

        tempBans[memberId] = { "guild": guildId, "expires": expiresTimestamp };

        TempBanFile._write(tempBans);
    }

    public static async removeMember(memberId: string) {
        let tempBans = await TempBanFile._open()

        delete tempBans[memberId]

        TempBanFile._write(tempBans);
    }
}