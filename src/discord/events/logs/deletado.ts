import { EmbedBuilder, TextChannel } from "discord.js";
import { settings } from "@/settings";
import { Event } from "@/discord/base";
import { hexToRgb } from "@magicyan/discord";
import { db } from "@/database";

new Event({
    name: "messageDelete",
    once: false,
    run: async (newMessage) => {
        if (!newMessage.guild || !newMessage.author) return;
        if (newMessage.author.bot || newMessage.system) return;

        const { guild } = newMessage;

        const data = await db.get(db.guilds, guild.id)
        const logchannel = data?.systems?.logs;

        if (logchannel) {
            const logChannel = newMessage.guild.channels.cache.get(logchannel);


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
                .setTitle("Mensagem Deletada")
                .setThumbnail(newMessage.author.displayAvatarURL())
                .addFields(
                    { name: "Autor", value: newMessage.author.username },
                    { name: "Canal", value: `<#${newMessage.channel instanceof TextChannel ? newMessage.channel.id : "Canal Desconhecido"}>` },
                    { name: "Mensagem", value: newMessage.content || "Mensagem vazia" },
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
});
