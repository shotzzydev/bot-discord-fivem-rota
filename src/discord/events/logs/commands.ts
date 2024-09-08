
import { time } from "discord.js";
import { Event } from "@/discord/base";
import { db } from "@/database";

new Event({
    name: "interactionCreate",
    async run(interaction) {
        const { guild } = interaction;

       const data = await db.get(db.guilds, guild?.id || "")

        const logchannel = data?.systems?.logs

        if (interaction.isCommand()) {
            if(logchannel) {
            const log = interaction.guild?.channels.cache.get(logchannel);
            if (!log?.isTextBased()) return;

            const { channel, user, commandName, createdAt, commandType } = interaction;
            const emojis = ['⌨️', '👤', '✉️']
            const text = [
                "usou o comando",
                "usou o contexto de usuário",
                "usou o contexto de mensagem"
            ]

            let content = `${emojis[commandType - 1]} $${time(createdAt, "R")} `;
            content += `**@${user.username}** `;
            content += `__${text[commandType - 1]}__ `;
            content += `\`${commandName}\``;
            if (channel) content += `em ${channel.url}`

            log?.send({ content });
            return;
        }
    }},
})