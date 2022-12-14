import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	inlineCode,
	PermissionFlagsBits,
	PermissionsBitField,
	SlashCommandBuilder,
	time,
	User,
} from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { addEmbedFooter } from "../lib/embed-footer";
import { userMissingPermissions } from "../lib/errors/common/permissions";
import { LevelsDB } from "../lib/mysql/levels";
import { VariablesDB } from "../lib/mysql/variables";
import { xpToLevel } from "../lib/xp";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("level")
		.setDescription("Chatting level")
		.addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Get the level leaderboard"))
		.addSubcommand((subcommand) =>
			subcommand
				.setName("user")
				.setDescription("Get your level or another member's level")
				.addUserOption((option) => option.setName("user").setDescription("User who's level you want to view").setRequired(false))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("give-xp")
				.setDescription("Give xp to a user")
				.addUserOption((option) => option.setName("user").setDescription("User who'd you like to add the xp to").setRequired(true))
				.addNumberOption((option) => option.setName("xp").setDescription("The amount of xp you'd like to give the user").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("set-multiplier")
				.setDescription("Set xp multiplier")
				.addNumberOption((option) => option.setName("multiplier").setDescription("The multiplier to xp").setRequired(true))
		)
		.setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: ChatInputCommandInteraction) {
		const subCommand = interaction.options.getSubcommand();

		switch (subCommand) {
			case "leaderboard":
				const leaderboard = await LevelsDB.getAll();

				const leaderboardEmbed = new EmbedBuilder().setColor(0x77b94d).setTitle("Level leaderboard").setTimestamp();
				await addEmbedFooter(client, leaderboardEmbed);

				let embedDescription = "Showing top 10 levels";

				for (let i = 0; i < 10; i++) {
					embedDescription += `\n**${i + 1} • **${inlineCode(`lvl ${String(await xpToLevel(leaderboard[i].xp))}`)}** • **<@${
						leaderboard[i].userId
					}>`;
				}

				leaderboardEmbed.setDescription(embedDescription);

				interaction.reply({ embeds: [leaderboardEmbed] });

				break;

			case "user":
				let user = interaction.options.getUser("user");
				if (!user) {
					user = interaction.user;
				}

				const xp = await LevelsDB.getXp(user.id);
				if (!xp) return interaction.reply(`Failed to get the level of ${user.tag}`);

				const level = await xpToLevel(xp);
				const levelEmbed = new EmbedBuilder()
					.setColor(0x77b94d)
					.setTitle(`Rank of ${user.tag}`)
					.setDescription(`Current level is ${inlineCode(String(level))}`)
					.setTimestamp();
				await addEmbedFooter(client, levelEmbed);

				interaction.reply({ embeds: [levelEmbed] });

				break;

			case "give-xp":
				if (interaction.member?.permissions instanceof PermissionsBitField) {
					const user = interaction.options.getUser("user");
					const xpToAdd = interaction.options.get("xp")?.value;

					if (interaction.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
						if (user instanceof User && xpToAdd) {
							LevelsDB.addXp(user.id, Number(xpToAdd));
							interaction.reply(`Added ${xpToAdd} xp to <@${user.id}>`);
						}
					} else {
						userMissingPermissions(client, interaction, "add xp");
					}
				}

				break;

			case "set-multiplier":
				if (interaction.member?.permissions instanceof PermissionsBitField) {
					const xpMultiplier = interaction.options.get("multiplier")?.value;

					if (interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
						if (xpMultiplier) {
							const expires = Math.round(new Date().getTime() / 1000 + 86400);
							await VariablesDB.set("xp_multiplier", `{"expires": ${expires}, "value": ${xpMultiplier}}`);

							interaction.reply(`Set multipler to ${xpMultiplier}, expires at ${time(expires, "F")}`);
						}
					} else {
						userMissingPermissions(client, interaction, "set xp multiplier");
					}
				}

				break;
		}
	},
};
