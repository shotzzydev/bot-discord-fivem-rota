import { Command } from "@/discord/base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

export default new Command({
    name: "ban",
    description: "Bane algum que desespetou as regras do servido.",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["BanMembers"],
    options: [{
        name: "membro",
        description: "Selecione o membro que será banido do servido",
        type: ApplicationCommandOptionType.User,
        required: true
    },
    {
        name: "motivo",
        description: "Informe o motivo do banimento do usuario",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    async run(interaction) {
        const { options } = interaction
        const user = options.getUser("membro", true);
        const motivo = options.getString("motivo", true);

        const member = interaction.guild.members.cache.get(user.id);

        member?.ban

        interaction.reply({
            content: `O usuario ${user} foi banido pelo motivo: ${motivo} com sucesso ✅`,
            ephemeral: true
        })
    },
})