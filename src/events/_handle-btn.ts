import { ButtonInteraction } from "discord.js";
import SlimyClient from "../client";
import { handleVerifyButton } from "../lib/verify";

export async function handleButton(client: SlimyClient, interaction: ButtonInteraction) {
    switch(interaction.customId) {
        case "verify": handleVerifyButton(interaction);
    }
    
}