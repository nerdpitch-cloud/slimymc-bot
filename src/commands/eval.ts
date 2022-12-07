import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Evaluate js code snippets")

		.addStringOption((option) =>
			option
				.setName("code")
				.setDescription("The code to evaluate")
				.setRequired(true)
		)

		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
        
	async execute(client: SlimyClient, config: Config, interaction: CommandInteraction) {
        if (interaction.user.id != "289411795423199232") {
			return await interaction.reply({
				content: "You don't have permission to use this command",
				ephemeral: true
			});
		}

		let code = interaction.options.get("code", true);


		if (!code.value || typeof code.value !== "string" ) {
			return await interaction.reply({
				content: "You must provide a code snippet to evaluate",
				ephemeral: true
			});
		}

		try {
			let res = String((eval(code.value))).slice(0, 1990);
			
			res = res.replace(
				config.discord.token, 
				"<TOKEN>"
				).replace(
					config.mysql.password,
					"<MYSQL PASSWORD>"
				);

			await interaction.reply(`\`\`\`${res}\`\`\``);

		} catch (e) {
			await interaction.reply(`\`\`\`${String(e).slice(0, 1990)}\`\`\``);
		}
    }
};
