import { Command } from "@/discord/base";
import { settings } from "@/settings";
import { hexToRgb } from "@magicyan/discord";
import { ApplicationCommandType, EmbedBuilder, TextChannel } from "discord.js";

new Command({
    name: `lock`,
    description: "Trava um canal de texto para usuários não mandarem messagens.",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: "Administrator",
    async run(interaction) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name })
            .setTitle('Sucesso Canal Trancado🔒')
            .setColor(hexToRgb(settings.colors.theme.secondary))
            .setDescription(`Este chat foi trancado com sucesso por: ${interaction.user}`);

        interaction.reply({ embeds: [embed] }).then((msg: any) => {
            const channel = interaction.channel as TextChannel;
            channel.permissionOverwrites.edit(interaction.guild?.id as string, { SendMessages: false }).catch((e: any) => {
                interaction.editReply('❌ Ops, algo deu errado ao tentar trancar este chat.');
            });
        })
    },
})