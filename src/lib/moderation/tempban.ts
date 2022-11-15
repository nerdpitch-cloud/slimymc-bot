import SlimyClient from "../../client";
import {promises as fsp} from "fs"

export async function tempbanCheck(client: SlimyClient) {
    let currentTempbans = await fsp.readFile(`${__dirname}/../../commands/tempbans.json`);
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
        let currentTempbans = await fsp.readFile(TempBanFile.filepath);
        return JSON.parse(currentTempbans.toString());
    }

    private static async _write(data: Object) {
        await fsp.writeFile(TempBanFile.filepath, JSON.stringify(data, null, 4));
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