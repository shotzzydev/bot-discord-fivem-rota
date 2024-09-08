import { Command } from "@/discord/base";
import { ApplicationCommandOptionType, ApplicationCommandType, parseEmoji } from "discord.js";

new Command({
    name: "add",
    description: "Add emoji(s) on server",
    defaultMemberPermissions: "Administrator",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [
        {
            name: "emoji",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Add one or more emojis simultaneously",
            options: [
                {
                    name: "emojis",
                    description: "Adicione um ou mais emojis simultaneamente",
                    type: ApplicationCommandOptionType.String,
                    required,
                }
            ]
        }],
    async run(interaction) {
        const { options, guild } = interaction;

        await interaction.deferReply({
            ephemeral,
        })

        const emoji = options.getString("emojis", true);
        const emojiRegex = /<a?:(.*?):(\d+)>/g;
        const emojiMatches = emoji.match(emojiRegex);

        if (!emojiMatches) {
            return interaction.editReply({ content: "No valid emojis found in your input." });
        }

        for (const emojiString of emojiMatches) {
            const parsed = parseEmoji(emojiString);
            if (parsed) {
                const link = `https://cdn.discordapp.com/emojis/${parsed.id}${parsed.animated ? '.gif' : '.png'}`

                guild.emojis.create({
                    attachment:  link,
                    name: `${parsed.id}`,
                })

                interaction.editReply({
                    content: `Emoji adicionado com sucesso: ${emoji}`,
                })
            }
        }
    }
})