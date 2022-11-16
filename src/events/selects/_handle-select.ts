import { SelectMenuInteraction } from "discord.js";
import { Config } from "../../conf/config";
import { removeInteractionFromSelect } from "../remove-infraction";

export async function handleSelectMenu(config: Config, interaction: SelectMenuInteraction) {
    switch(interaction.customId) {
        case "infractions": 
            removeInteractionFromSelect(interaction);
    }
}