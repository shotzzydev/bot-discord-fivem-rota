import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { Command } from "../../base";
import { hexToRgb } from "@magicyan/discord";
import { settings } from "@/settings";

new Command({
    name: "avatar",
    dmPermission: false,
    type: ApplicationCommandType.User,
    async run(interaction) {
        const { targetMember } = interaction;

        if (!targetMember) {
              interaction.reply({
                content: `${interaction.user}, O Usuario selecionado não possui um avatar`
              });
              return;
        };

        interaction.reply({ ephemeral: true,
        embeds: [new EmbedBuilder({
            author: { name: `Avatar de ${targetMember?.displayName}` },
            image:  { url: targetMember.displayAvatarURL({ size: 1024 })   },
            color: hexToRgb(settings.colors.theme.info)
       })]})

    },
})