import { time , ChatInputCommandInteraction , SlashCommandBuilder, EmbedBuilder, codeBlock, Embed } from "discord.js";
import SlimyClient from "../client";
import { convertUTCDateToLocalDate } from "../lib/date";
import { addEmbedFooter } from "../lib/embed-footer";
import { handleUnexpectedError } from "../lib/errors/handler";
import { punishmentTextFromId } from "../lib/moderation/moderation";
import { InfractionsDB } from "../lib/mysql/infractions";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("infractions")
		.setDescription("View/Manage member's infractions!")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("view")
                .setDescription("View member's infractions")
                .addUserOption((option) =>
                    option 
                        .setName("member")
                        .setDescription("Member who's history of infractions you want to view")
                        .setRequired(true)
                )
        )

        .addSubcommand((subcommand) => 
            subcommand
                .setName("remove")
                .setDescription("Remove member's latest infraction from the database")
                .addUserOption((option) =>
                option 
                    .setName("member")
                    .setDescription("Member who's latest infraction you want to remove")
                    .setRequired(true)
            )
            
    ),
                    

	async execute(client: SlimyClient, interaction: ChatInputCommandInteraction) {
        let subCommand = interaction.options.getSubcommand()

		let target = interaction.options.getUser("member");
        if(!target) throw new Error("target was null");

        if (subCommand == "view") {
            let allInfractions = await InfractionsDB.getInfractions(target.id)
            if (!allInfractions.success) return handleUnexpectedError(client, allInfractions.result);

            let infractionsSrc = ""

            let infractionsEmbed = new EmbedBuilder()
                .setColor(0x3075ff)
                .setTitle("View infractions")
                .setTimestamp()
                await addEmbedFooter(client, infractionsEmbed)

            for (let i = 0; i < allInfractions.result.length; i++) {
                let curr = allInfractions.result[i]
                let date_issued = await convertUTCDateToLocalDate(curr.date_issued)

                let punishmentStr = await punishmentTextFromId(curr.punishment)
                infractionsSrc += `**${punishmentStr.charAt(0).toUpperCase() + punishmentStr.slice(1)}** - ${time(date_issued, "F")} - ${curr.reason}\n`
            }

            infractionsEmbed.setDescription(`Infractions of <@${target.id}>\n\n${infractionsSrc}`)

            interaction.reply( {embeds: [infractionsEmbed] })
        } else if (subCommand == "remove") {
            let dbRes = await InfractionsDB.removeInfraction(target.id)
            if (!dbRes.success) return handleUnexpectedError(client, dbRes.result);

            interaction.reply(`Removed the last infraction of <@${target.id}>`);
        }
	},
};
