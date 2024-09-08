import { db } from "@/database";
import { Event } from "@/discord/base";
import { settings } from "@/settings";
import { hexToRgb } from "@magicyan/discord";
import { EmbedBuilder } from "discord.js";

new Event({
    name: "messageCreate",
    async run(message) {
        if (message.author?.bot) return;
        if (message.author?.id === message.guild?.ownerId) return;
        if (message.member?.permissions.has('Administrator')) return;
        const { guild } = message;

        if (guild) {
            const data = await db.get(db.guilds, guild.id);
            const canal = data?.systems?.suggestions;

            if (message.channel.id === canal) {
                const embed = new EmbedBuilder({
                    title: "Uma Nova Sugestão foi Recebida",
                    thumbnail: {
                        url: `${message.author.avatarURL() || undefined}`
                    },
                    description: `**Autor:** ${message.author}\n\n**Sugestão:**\n\`\`\`\n${message.content}\n\`\`\``,
                    color: hexToRgb(settings.colors.theme.info),
                    footer: {
                        text: `ID do Autor: ${message.author.id}"`,
                    }
                })

                    .setTimestamp();

                message.channel.send({ embeds: [embed] })
                    .then(async (sentMessage) => {

                        const emoji_certo = "<:1132317445105926274:1143250874186072165>";
                        const emoji_tantofaz = "<:success:1143265511556259993>";
                        const emoji_errado = "<:1132317002602647583:1143250853462024293>";

                        await sentMessage.react(emoji_certo).catch(() => { });
                        await sentMessage.react(emoji_tantofaz).catch(() => { });
                        await sentMessage.react(emoji_errado).catch(() => { });

                        sentMessage.startThread({
                            name: "Debater Sugestão",
                        });
                        message.delete().catch(console.error);
                    })
                    .catch(console.error);
            }
        }
    }
});