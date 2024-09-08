import { EmbedBuilder, TextChannel } from "discord.js";
import { settings } from "@/settings";
import { Event } from "@/discord/base";
import { hexToRgb } from "@magicyan/discord";
import { db } from "@/database";

new Event({
    name: "voiceStateUpdate",
    run: async (oldState, newState) => {
        const { guild } = newState

        const data = await db.get(db.guilds,  guild.id)

        if (data) {
            const logchannel = data?.systems?.logs;
            const logChannel = logchannel ? oldState.guild.channels.cache.get(logchannel) : null;

            if (!oldState.channelId && newState.channelId) {
                const user = newState.member?.user;

                const formatTwoDigits = (number: number) => number.toString().padStart(2, '0');
                const currentDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

                const day = formatTwoDigits(currentDate.getDate());
                const month = formatTwoDigits(currentDate.getMonth() + 1);
                const year = currentDate.getFullYear();
                const hours = formatTwoDigits(currentDate.getHours());
                const minutes = formatTwoDigits(currentDate.getMinutes());
                const seconds = formatTwoDigits(currentDate.getSeconds());

                const formattedDate = `Dia: ${day}/${month}/${year} - Horas: ${hours}:${minutes}:${seconds}`;

                const embed = new EmbedBuilder()
                    .setColor(hexToRgb(settings.colors.theme.info))
                    .setTitle("Entrou canal de voz")
                    .setThumbnail(user?.displayAvatarURL() || null)
                    .addFields(
                        { name: "Autor", value: `${user?.username}` },
                        { name: "Canal", value: `${newState.channel?.url}` }
                    )
                    .setFooter({
                        text: `${formattedDate}`,
                        iconURL: guild.iconURL() || undefined
                    })

                if (logChannel instanceof TextChannel) {
                    logChannel.send({ embeds: [embed] });
                }
            }

            if (oldState.channelId && !newState.channelId) {
                const user = oldState.member?.user;

                const formatTwoDigits = (number: number) => number.toString().padStart(2, '0');
                const currentDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

                const day = formatTwoDigits(currentDate.getDate());
                const month = formatTwoDigits(currentDate.getMonth() + 1);
                const year = currentDate.getFullYear();
                const hours = formatTwoDigits(currentDate.getHours());
                const minutes = formatTwoDigits(currentDate.getMinutes());
                const seconds = formatTwoDigits(currentDate.getSeconds());

                const formattedDate = `Dia: ${day}/${month}/${year} - Horas: ${hours}:${minutes}:${seconds}`;

                const embed = new EmbedBuilder()
                    .setColor(hexToRgb(settings.colors.theme.info))
                    .setThumbnail(user?.displayAvatarURL() || null)
                    .setTitle("Saiu canal de voz")
                    .addFields(
                        { name: "Autor", value: `${user?.username}` },
                        { name: "Canal", value: `${oldState.channel?.url}` }
                    )
                    .setFooter({
                        text: `${formattedDate}`,
                        iconURL: guild.iconURL() || undefined
                    })

                if (logChannel instanceof TextChannel) {
                    logChannel.send({ embeds: [embed] });
                }
            }
        }
    },
});
