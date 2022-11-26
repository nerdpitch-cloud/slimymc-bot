import SlimyClient from "../../client";
import { VariablesDB } from "../mysql/variables";

export async function tempbanCheck(client: SlimyClient) {
    let currentTempbandsVar = await VariablesDB.get("currentTempbans")
    if (!currentTempbandsVar) currentTempbandsVar = ""

    let currentTempbans = JSON.parse(currentTempbandsVar)


    for (let key in currentTempbans){
        if(Math.round(Date.now() / 1000) > currentTempbans[key]["expires"]) {
            TempBanFile.removeMember(key);
            await (await client.guilds.fetch(currentTempbans[key]["guild"])).members.unban(key);
        }
    }
}

export class TempBanFile {
    private static filepath = `${__dirname}/../../commands/tempbans.json`

    private static async _open() {
        let currentTempbans = await VariablesDB.get("currentTempbans")
        if (!currentTempbans) currentTempbans = ""

        return JSON.parse(currentTempbans)
    }

    private static async _write(data: Object) {
        await VariablesDB.set("currentTempbans", JSON.stringify(data))
    }

    public static async genExpiration(duration: number | null) {
        if (!duration) duration = 1
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