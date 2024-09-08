import { Command } from "@/discord/base";
import { ApplicationCommandOptionType, ApplicationCommandType, GuildMember } from "discord.js";

new Command({
    name: "limpar",
    description: "Limpar messagem do chat",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    defaultMemberPermissions: "Administrator",
    options: [{
        name: "quantidade",
        description: "O total de messagem a serem excluídas",
        type: ApplicationCommandOptionType.Integer,
        required: true,
    },
    {
        name: "autor",
        description: "Limpar memsagens de apenas um membro",
        type: ApplicationCommandOptionType.User,
        required: false,
    }],
    async run(interaction) {
        const { channel, options } = interaction;

        if (!interaction.memberPermissions.has("Administrator")) {
            interaction.reply({
                content: "Você não tem permissões necessária para executar este comando",
                ephemeral: true
            })
            return;
        };

        await interaction.deferReply({ ephemeral: true });

        const amount = Math.min(options.getInteger("quantidade", true), 100);
        const mention = options.getMember("autor") as GuildMember | null;

        if (!channel) {
            interaction.editReply({ content: "Não é possivel limpar as messagens!" });
            return;
        }

        const mesagens = await channel.messages.fetch();

        if (mention) {
            const mesagens = channel.messages.cache.filter(m => m.author.id == mention.id).first(amount);
            if (mesagens.length < 1) {
                interaction.editReply({ content: `Não foi encontrada nunhuma mensagem recente de ${mention}` })
                return
            }

            channel.bulkDelete(mesagens, true)
                .then(cleared => interaction.editReply({
                    content: `Foram limpas ${cleared.size} messagens de ${mention}!`
                }))
                .catch((err) => interaction.editReply({
                    content: `Ocorreu um erro ao tentar limpar mensagens dm ${mention}!  \n${err}`
                }))
            return;
        };

        channel.bulkDelete(mesagens.first(amount), true)
            .then(cleared => interaction.editReply({
                content: `Foram limpas ${cleared.size} messagens em ${channel}!`
            }))
            .catch(() => interaction.editReply({
                content: `Ocorreu um erro ao tentar limpar mensagens em ${channel}!`
            }))
    },
})