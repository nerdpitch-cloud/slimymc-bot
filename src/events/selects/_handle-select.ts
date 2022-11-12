import { SelectMenuInteraction } from "discord.js";
import { removeInteractionFromSelect } from "../remove-infraction";

export async function handleSelectMenu(interaction: SelectMenuInteraction) {
    switch(interaction.customId) {
        case "infractions": removeInteractionFromSelect(interaction);
    }
    
}