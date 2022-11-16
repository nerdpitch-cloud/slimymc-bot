import { messageMultiplier } from "../events/message-create"
import { dbVariable, VariablesDB } from "./mysql/variables"

export async function refreshDbVariables() {
    let allVars = await VariablesDB.getAll()

    if(allVars) {
        for (let i = 0; i < allVars.length; i++) {
            switch (allVars[i].key) {
                case "xp_multiplier":
                    refreshXpMultiplier(allVars[i])
                    break;
            }
        }
    }
        
}

async function refreshXpMultiplier(variable: dbVariable) {
    let jsonVar = JSON.parse(variable.value)

    messageMultiplier.expires = new Date(jsonVar["expires"] * 1000)
    messageMultiplier.value = Number(jsonVar["value"])
}