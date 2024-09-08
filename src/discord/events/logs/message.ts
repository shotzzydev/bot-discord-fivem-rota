import { EmbedBuilder, TextChannel } from "discord.js";
import { Event } from "@/discord/base";
import { settings } from "@/settings";
import { hexToRgb } from "@magicyan/discord";
import { db } from "@/database";

new Event({
    name: "messageUpdate",
    async run(oldMessage, newMessage) {
        if (!newMessage.guild || !newMessage.author) return;
        if (newMessage.author.bot || newMessage.system) return;

        const { guild } = newMessage;

        const data = await db.get(db.guilds, guild.id)
        const logchannel = data?.systems?.logs;

        if (logchannel) {
            const logChannel = newMessage.guild.channels.cache.get(logchannel);

            const embed = new EmbedBuilder()
                .setTitle("Mensagem Editada")
                .setThumbnail(newMessage.author.displayAvatarURL())
                .setColor(hexToRgb(settings.colors.theme.info))
                .addFields(
                    { name: "Autor", value: newMessage.author.username },
                    { name: "Canal", value: `<#${newMessage.channel instanceof TextChannel ? newMessage.channel.id : "Canal Desconhecido"}>` },
                    { name: "Mensagem Anterior", value: String(oldMessage.content) },
                    { name: "Mensagem Atualizada", value: String(newMessage.content) }
                )
                .setTimestamp();

            if (logChannel instanceof TextChannel) {
                logChannel.send({ embeds: [embed] });
            }
        }
    },
})