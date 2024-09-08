import { Command } from "@/discord/base";
import { ApplicationCommandType, EmbedBuilder, TextChannel } from "discord.js";

new Command({
    name: "unlock",
    description: "Destrancar um canal que está privado",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: "Administrator",
    async run(interaction) {
        const channel = interaction.channel as TextChannel;

        let embed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name })
            .setTitle('Canal Destrancado🔓')
            .setColor("Green")
            .setDescription(`Este chat foi destrancado com sucesso por: ${interaction.user}`);

        interaction.reply({ embeds: [embed] }).then((msg: any) => {
            channel.permissionOverwrites.edit(interaction.guild?.id as string, { SendMessages: true }).catch((e: any) => {
                interaction.editReply({ content: '❌ Ops, algo deu errado ao tentar trancar este chat.' });
            });
        });
    }
},
)