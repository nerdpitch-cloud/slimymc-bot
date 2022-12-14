import { ButtonInteraction } from "discord.js";
import { Config } from "../../conf/config";
import {
	handleClaimTicketButton,
	handleCloseTicketButton,
	handleCreateTicketButton,
} from "./ticket";
import { handleVerifyButton } from "./verify";

export async function handleButton(
	config: Config,
	interaction: ButtonInteraction
) {
	switch (interaction.customId) {
		case "verify":
			return handleVerifyButton(interaction, config);

		case "create_ticket_report":
		case "create_ticket_store":
		case "create_ticket_applications":
		case "create_ticket_other":
			return handleCreateTicketButton(interaction, config);

		case "close_ticket":
			return handleCloseTicketButton(interaction, config);
		case "claim_ticket":
			return handleClaimTicketButton(interaction, config);
	}
}
