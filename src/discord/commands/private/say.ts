import { Command } from "@/discord/base";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "discord.js";

new Command({
    name: "say",
    description: "Faça o bot enviar uma messagem sua.",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: "Administrator",
    dmPermission,
    options: [
        {
            name: "messagem",
            description: "Informe a messagem que será enviada pelo bot",
            type: ApplicationCommandOptionType.String,
            required
        },
        {
            name: "canal",
            description: "Selecione o canal onde será enviada a messagem",
            type: ApplicationCommandOptionType.Channel,
            required
        }
    ],
    async run(interaction) {
        const { options } = interaction;
        const canal = options.getChannel("canal", true, [ChannelType.GuildText]);
        const messagem = options.getString("messagem", true);

        canal.send({ content: `${messagem}` })
        interaction.reply({
            ephemeral,
            content: `Sua messagem foi enviada com sucesso no canal: ${canal}`,
        })
        return;
    }
})