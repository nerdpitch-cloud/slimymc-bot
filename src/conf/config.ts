
import prod from "../conf/prod.json"


export class Enviroment {
    static PROD = "prod"
    static DEV = "dev"
}

export class Config {
    readonly discord: {
        token: string,
        clientId: string,
        guildId: string
    }
    readonly log: {
        modlogChannelId: string,
        errorlogChannelId: string,
        userlogChannelId: string,
        inviteLogsId: string
    }
    readonly mysql: {
        host: string,
        username: string,
        password: string,
        database: string,
    }
    readonly verify: {
        verifyChannelId: string,
        verifyMessageId: string,
        verifyRoleId: string,
        recommendedChannels: Array<string>
    }
    constructor(enviroment: Enviroment ) {
        if (enviroment == Enviroment.PROD) {
            this.discord = prod.discord
            this.log = prod.log
            this.mysql = prod.mysql
            this.verify = prod.verify
        } else {
            // handle DEV
            this.discord = prod.discord
            this.log = prod.log
            this.mysql = prod.mysql
            this.verify = prod.verify

        }

    }
}