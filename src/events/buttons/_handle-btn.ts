import { ButtonInteraction } from "discord.js";
import { handleVerifyButton } from "./verify";

export async function handleButton(interaction: ButtonInteraction) {
    switch(interaction.customId) {
        case "verify": handleVerifyButton(interaction);
    }
    
}