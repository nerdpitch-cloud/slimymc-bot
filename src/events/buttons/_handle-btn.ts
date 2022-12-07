import { ButtonInteraction } from "discord.js";
import { Config } from "../../conf/config";
import { handleVerifyButton } from "./verify";

export async function handleButton(config: Config, interaction: ButtonInteraction) {
	switch (interaction.customId) {
		case "verify":
			handleVerifyButton(interaction, config);
	}
}
