import { SelectMenuInteraction, time } from "discord.js";
import { InfractionsDB } from "../lib/mysql/infractions";

interface removeInteractionArgs {
    user_id: string
    punishment: number
    reason: string
    issued_at: Date
}
export async function removeInteractionFromSelect(interaction: SelectMenuInteraction) {
    let punishmentId = interaction.values[0].split("_")[1]

    let dbQuery = await InfractionsDB.removeInfraction(Number(punishmentId))
    if (!dbQuery.success) throw new Error("DB query failed")

    await interaction.message.edit({ content: "Removed the infraction specified", components: [] })

}