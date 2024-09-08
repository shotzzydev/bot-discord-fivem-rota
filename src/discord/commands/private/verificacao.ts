import { db } from "@/database";
import { Command, Component, Modal } from "@/discord/base";
import { settings } from "@/settings";
import { hexToRgb } from "@magicyan/discord";
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelType, Collection, ComponentType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, italic, time } from "discord.js";

const members: Collection<string, string> = new Collection();

const verifyModal = new ModalBuilder({
    customId: "verify-code-modal",
    title: "Verificação",
    components: [
        new ActionRowBuilder<TextInputBuilder>({ components: [
            new TextInputBuilder({
                customId: "verify-code-input",
                label: "Código de verificação",
                placeholder: "Insira o código de verificação",
                style: TextInputStyle.Short,
                required
            })
        ] 
        }) 
    ]
}) 

new Command({
    name: "verificação",
    description: "Sistema de verificação",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    options: [
        {
            name: "canal",
            description: "Selecione o canal onde os membros realizaram sua verificação",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required
        },
        {
            name: "cargo",
            description: "Selecione o cargo que será atribuido ao membro após a verificação",
            type: ApplicationCommandOptionType.Role,
            required
        }
    ],
    async run(interaction) {
        const { options, guild } = interaction;

        const channel = options.getChannel("canal", true, [ChannelType.GuildText]);
        const role = options.getRole("cargo", true);

        db.upset(db.guilds, guild.id, {
            systems: {
                verification: role.id
            }
        })

        const embed = new EmbedBuilder({
            description: "Para acessar os demais canais do servidor, clique no botão **Verificar** abaixo.",
            color: hexToRgb(settings.colors.theme.info),
            fields: [
                {
                    name: "Instruções:",
                    value: "` 1 ` Clique no botão **Verificar** abaixo.\n` 2 ` Siga as instruções para concluir o processo.",
                },
                {
                    name: "Nota:",
                    value: "A verificação é necessária para garantir um ambiente seguro para todos os membros.",
                },
            ],
        });
        

        const button = new ButtonBuilder({
            customId: "system-verify-button",
            style: ButtonStyle.Success,
            label: "Verificar",
            emoji: "<:1132317445105926274:1143250874186072165>"
        })

        const row = new ActionRowBuilder<ButtonBuilder>({ components: [button] })

        channel.send({
            embeds: [embed],
            components: [row]
        });

        interaction.reply({
            ephemeral,
            content: `Sistema de verificação configurado com sucesso no canal: `
        })
        return;
    },
})

new Component({
    customId: "system-verify-button",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        const { member, guild } = interaction

        const data = await db.get(db.guilds, guild.id);

        const role = interaction.guild.roles.cache.get(data?.systems?.verification || "");
        if (!role) {
            interaction.reply({
                ephemeral,
                content: `Não foi possivel verificar você cargo da verificação não configurado`
            })
            return;
        }

        if(member.roles.cache.has(role.id)){
            interaction.reply({
                ephemeral,
                content: "Você já está verificado!"
            })
            return;
        }

        if(members.has(member.id)) {
            interaction.showModal(verifyModal)
            return;
        }

        const code = randomText();
        const timestamp = new Date(Date.now() + 30000);

        await interaction.reply({
            ephemeral,
            embeds: [
                new EmbedBuilder({
                    title: "Sistema de verificação",
                    description: `Você precisará digitar o codigo a seguir: ||${code}||
                    Copie e cole no formulário que será exibido
                    
                    ${italic(`O código expira ${time(timestamp, "R")} `)}
                    > Clique no botão abaixo para verificar`,
                    color: hexToRgb(settings.colors.theme.info)
                })
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>({components: [
                    new ButtonBuilder({customId: "verify-code-button", label: "Verificar", style: ButtonStyle.Success})
                ]})
            ]
        })

        members.set(member.id, code);
        setTimeout(() => members.delete(member.id), 30_000);
        return;
    },
})

function altenateCapitals(str: string){
    return [...str].map((char, i) => char[`to${i % 2 ? "Upper": "Lower"}Case`]()).join("")
}

function randomText(){
    return altenateCapitals(Math.random().toString(36).substring(2, 8))
}

new Component({
    customId: "verify-code-button",
    cache: "cached", type: ComponentType.Button,
    async run(interaction) {
        const { guild, member } = interaction;

        const data = await db.get(db.guilds, guild.id);
        
        const role = interaction.guild.roles.cache.get(data?.systems?.verification || "");
        if (!role) {
            interaction.update({
                content: `Não foi possivel verificar você cargo da verificação não configurado!`,
                embeds: [],
                components: []
            })
            return;
        }

        if(member.roles.cache.has(role.id)){
            interaction.update({
                content: "Você já está verificado!",
                embeds: [],
                components: []
            })
            return;
        }

        if(!members.has(member.id)){
            interaction.update({ content: `Apeter no botão verificar novamente!`,
            embeds: [],
            components: []
        })
        return;
        }

        interaction.showModal(verifyModal);
    },
})
new Modal({
    customId: "verify-code-modal",
    cache: "cached",
    async run(interaction) {
        const { member, guild, fields } = interaction;
        const code = members.get(member.id);
        const inputCode = fields.getTextInputValue("verify-code-input");

        const data = await db.get(db.guilds, guild.id);

        if (!code || code !== inputCode){
            interaction.reply({
                ephemeral,
                content: "Código inválido ou expirado! realizer a verificação novamente!"
            })
            return;
        }

        const role = interaction.guild.roles.cache.get(data?.systems?.verification || "");
        if (!role) {
            interaction.reply({
                content: `Não foi possivel verificar você cargo da verificação não configurado!`,
                embeds: [],
                components: []
            })
            return;
        }

        members.delete(member.id);
        await member.roles.add(role);

        interaction.reply({ 
            ephemeral,
            content: `Você foi verificado com sucesso! \nRecebeu o cargo ${role}`
        })
    },
})