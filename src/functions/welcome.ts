import { settings } from "@/settings";
import { ChannelType, EmbedBuilder, GuildMember, PartialGuildMember, TimestampStyles, time, userMention } from "discord.js";
import { brBuilder, createEmbedAuthor, hexToRgb, replaceText } from "@magicyan/discord";
import { db } from "@/database";

interface globalMessageJoinProps {
    member: GuildMember
    action: "join"
}
interface globalMessageLeaveProps {
    member: GuildMember | PartialGuildMember,
    action: "leave"
}

type globalMessageProps = globalMessageJoinProps | globalMessageLeaveProps

const defaults = {
    messages: {
        join: "Olá ${member},Você acaba de entrar na ${guild.name}\nAtualmente estamos com ${guild.membersCount} membros(s)!",
        leave: "Que pena que você está saindo, ${member}!\nAtualmente temos ${guild.membersCount} membro(s)!",
    },
    colors: {
        join: settings.colors.theme.info,
        leave: settings.colors.theme.info
    },
}

export async function globalMessage({ member, action }: globalMessageProps) {
    const { guild, user } = member;

    const guildData = await db.get(db.guilds, guild.id);
    if (!guildData) return;

    const channel = guild.channels.cache.get(guildData.welcome?.channels?.[action] || "");
    if (channel?.type !== ChannelType.GuildText) return;

    const color = guildData.welcome?.colors?.[action] || defaults.colors[action];
    const text = guildData.welcome?.messages?.[action] || defaults.messages[action];
    const image = guildData.welcome?.image?.[action] 

    const replacedText = replaceText(text, {
        "${member}": userMention(member.id),
        "${member.displayName}": member.displayName,
        "${member.user.username}": member.user.username,
        "${member.user.globalName}": member.user.globalName,
        "${member.id}": member.id,
        "${guild.name}": guild.name,
        "${guild.id}": guild.id,
        "${guild.membersCount}": guild.memberCount,
    });

    const description = brBuilder(
        replacedText.toString(),
        time(new Date(), TimestampStyles.ShortDateTime)
    );

    const suffix = (action == "join") ? " entrou no servido!" : " saiu do servido!"

    const embed = new EmbedBuilder({
        author: createEmbedAuthor({ user, suffix }),
        description, thumbnail: { url: member.displayAvatarURL() },
        color: hexToRgb(color),
    })

    if(image) {
        embed.setImage(image)
    }

    channel.send({ embeds: [embed] })
}   