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

    await InfractionsDB.removeInfraction(Number(punishmentId))

    await interaction.message.edit({ content: "Removed the infraction specified", components: [] })

}