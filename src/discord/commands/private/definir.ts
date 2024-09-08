import { db } from "@/database";
import { Command } from "@/discord/base";
import { settings } from "@/settings";
import { createLinkButton, createModalInput, hexToRgb } from "@magicyan/discord";
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ChannelType, Collection, Component, EmbedBuilder, StringSelectMenuBuilder, TextInputStyle } from "discord.js";
import * as mysql from 'mysql2/promise';
import { Stats } from 'fivem-stats';

const globalActionData: Collection<string, "join" | "leave"> = new Collection();

new Command({
    name: "definir",
    description: "Todos os sistemas do servidor de FiveM do bot.",
    dmPermission,
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: "Administrator",
    options: [
        {
            name: "boasvindas",
            description: "Configurar sistema boasvindas",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "canais",
                    description: "Configure o canal onde as mensagens de registro de entrada e saída no servidor serão enviadas.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "entrada",
                            description: "Escolha o canal onde as mensagens de registro de quando alguém entra no servidor serão enviadas.",
                            type: ApplicationCommandOptionType.Channel,
                            channelTypes: [ChannelType.GuildText],
                            required
                        },
                        {
                            name: "saida",
                            description: "Escolha o canal onde as mensagens de registro de quando alguém sair no servidor serão enviadas.",
                            type: ApplicationCommandOptionType.Channel,
                            channelTypes: [ChannelType.GuildText],
                            required
                        }
                    ]
                },
                {
                    name: "cargo",
                    description: "Alterar cargo do sistema boasvindas",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: "cargo",
                        description: "Escolha o cargo que os membros receberam ao entrar no servidor.",
                        type: ApplicationCommandOptionType.Role,
                        required
                    }]
                },
                {
                    name: "messagem",
                    description: "Alterar a messagem do sistema de boas-vindas",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "ação",
                            description: "Escolha a ação",
                            type: ApplicationCommandOptionType.String,
                            choices: [
                                { name: "Entrar", value: "join" },
                                { name: "Sair", value: "leave" }
                            ],
                            required
                        },
                    ]
                },
                {
                    name: "cor",
                    description: "Escolha a ação",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "ação",
                            description: "Escolha a ação",
                            type: ApplicationCommandOptionType.String,
                            choices: [
                                { name: "Entrar", value: "join" },
                                { name: "Sair", value: "leave" }
                            ],
                            required
                        },
                        {
                            name: "cor",
                            description: "Digite a cor hexadecimal. Exemplo: #434d88",
                            type: ApplicationCommandOptionType.String,
                            required
                        }
                    ]
                },
                {
                    name: "imagem",
                    description: "Adicione uma imagem para a mensagem de boas-vindas.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: "ação",
                        description: "Escolha a ação",
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            { name: "Entrar", value: "join" },
                            { name: "Sair", value: "leave" },
                        ],
                        required
                    },
                    {
                        name: "imagem",
                        description: "Escolha a imagem",
                        type: ApplicationCommandOptionType.Attachment,
                        required
                    }]
                }
            ]
        },
        {
            name: "ticket",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Configure o sistema de ticket no servidor.",
            options: [{
                name: "canal",
                description: "Selecione o canal para o qual a embed de ticket será enviada.",
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildText],
                required,
            },
            {
                name: "categoria-doações",
                description: "Selecione a categoria onde os tickets de doações serão criados.",
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildCategory],
                required,
            },
            {
                name: "categoria-suporte",
                description: "Selecione a categoria onde os tickets de suporte serão criados.",
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildCategory],
                required,
            },
            {
                name: "categoria-fac",
                description: "Selecione a categoria onde os tickets de fac serão criados.",
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildCategory],
                required,
            },
            {
                name: "categoria-denúncia",
                description: "Selecione a categoria onde os tickets de denúncia serão criados.",
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildCategory],
                required,
            },
            {
                name: "categoria-ouvidoria",
                description: "Selecione a categoria onde os tickets de denúncia serão criados.",
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildCategory],
                required,
            },
            {
                name: "atendimento-doações",
                description: "Selecione o cargo que terá acesso aos tickets criados de doações.",
                type: ApplicationCommandOptionType.Role,
                required,
            },
            {
                name: "atendimento-suporte",
                description: "Selecione o cargo que terá acesso aos tickets criados de suporte.",
                type: ApplicationCommandOptionType.Role,
                required,
            },
            {
                name: "atendimento-fac",
                description: "Selecione o cargo que terá acesso aos tickets criados de fac.",
                type: ApplicationCommandOptionType.Role,
                required,
            },
            {
                name: "atendimento-denuncias",
                description: "Selecione o cargo que terá acesso aos tickets criados de denúncia.",
                type: ApplicationCommandOptionType.Role,
                required,
            },
            {
                name: "atendimento-ouvidoria",
                description: "Selecione o cargo que terá acesso aos tickets criados da ouvidoria relacionada a policia.",
                type: ApplicationCommandOptionType.Role,
                required,
            },
            {
                name: "canal-transcripts",
                description: "Selecione o canal para o qual os transcripts dos tickets finalizados serão enviados.",
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildText],
                required,
            },
            {
                name: "imagem",
                description: "Selecione a imagem que deseja colocar na embed do ticket.",
                type: ApplicationCommandOptionType.String,
                required: false,
            }]
        },
        {
            name: "sugestões",
            description: "Configure o sistema de sugestões de no servido",
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "canal",
                description: "Selecione o canal onde as as pessoas porderão da suas sugestões",
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildText],
                required
            }]
        },
        {
            name: "logs",
            description: "Configure o sistema de auditoria do servido",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [{
                name: "discord",
                description: "SIstema de loggs do discord",
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: "canal",
                    description: "Selecioner onde as logs serão enviada",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText],
                    required: true
                }]
            }]
        },
        {
            name: "bot",
            description: "Configura o bot",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "O novo nome do bot",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "avatar",
                    description: "A URL da nova imagem de avatar do bot",
                    type: ApplicationCommandOptionType.Attachment,
                    required: false
                },
                {
                    name: "cor-embeds",
                    description: "Infome uma cor para as embeds exemplo: #b14165",
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        },
    ],
    async run(interaction) {
        const { options, guild, member, client } = interaction;

        const group = options.getSubcommandGroup(false);
        const subCommand = options.getSubcommand(true);

        if (subCommand !== "messagem") {
            await interaction.deferReply({
                ephemeral
            });
        }

        switch (group) {
            case "boasvindas": {
                switch (subCommand) {
                    case "canais": {
                        const welcome = options.getChannel("entrada", true);
                        const goodbye = options.getChannel("saida", true);

                        await db.upset(db.guilds, guild.id, {
                            welcome: {
                                channels: {
                                    join: welcome.id,
                                    leave: goodbye.id
                                },
                            }
                        });

                        interaction.editReply({
                            content: `os canais de entradas agora é entrada: ${welcome}, saida: ${goodbye}`
                        });
                        return;
                    }
                    case "cargo": {
                        const role = options.getRole("cargo", true);

                        await db.upset(db.guilds, guild.id, {
                            welcome: { role: role.id }
                        });

                        interaction.editReply({
                            content: `O cargo padrão ao entrar no servidor agora é ${role}!`
                        })
                        return;
                    }
                    case "messagem": {
                        const action = options.getString("ação", true) as "join" | "leave";

                        const current = await db.get(db.guilds, guild.id);

                        globalActionData.set(member.id, action);

                        interaction.showModal({
                            customId: "definir-boasvindas-messagem-modal",
                            title: "Messagem do sistema de boas-vindas",
                            components: [
                                createModalInput({
                                    customId: "definir-boasvindas-messagem-input",
                                    label: "Messagem",
                                    placeholder: "Digite a messagem",
                                    style: TextInputStyle.Paragraph,
                                    value: current?.welcome?.messages?.[action]
                                })
                            ]
                        });

                        const modalInteraction = await interaction.awaitModalSubmit({ time: 30_000, filter: (i) => i.user.id === interaction.user.id }).catch(() => null);
                        if (!modalInteraction) return;

                        let { fields } = modalInteraction;
                        let message = fields.getTextInputValue("definir-boasvindas-messagem-input");

                        db.upset(db.guilds, guild.id, {
                            welcome: {
                                messages: { [action]: message }
                            }
                        });
                        modalInteraction.reply({
                            ephemeral,
                            content: `Messagem do sistema de boasvidas foi alterado com sucesso! ação alterada: **${action}**`,
                        })
                        return;
                    }
                    case "cor": {
                        const action = options.getString("ação", true) as "join" | "leave";
                        const color = options.getString("cor", true);

                        const actionDisplay = action == "join" ? "entrar" : "sair";

                        if (isNaN(hexToRgb(color))) {
                            interaction.editReply({
                                content: `${interaction.user.globalName}, você inseriu uma cor inválida! Este comando sá aceita cores hexadecimais.`
                            });
                            return;
                        }

                        await db.upset(db.guilds, guild.id, {
                            welcome: { colors: { [action]: color } }
                        });

                        const embed = new EmbedBuilder({
                            color: hexToRgb(color),
                            description: `${hexToRgb(color)}`
                        });
                        interaction.editReply({
                            content: `Cor da ação de ${actionDisplay} do sistema boasvindas foi alterada com sucesso!`,
                            embeds: [embed]
                        })
                        return;
                    }
                    case "imagem": {
                        const action = options.getString("ação", true) as "join" | "leave";
                        const image = options.getAttachment("imagem", true);

                        const actionDisplay = action == "join" ? "entrar" : "sair";

                        await db.upset(db.guilds, guild.id, {
                            welcome: { image: { [action]: image.url } }
                        });

                        interaction.editReply({
                            content: `a imagem ao ${actionDisplay} foi alterada com sucesso!`
                        })
                        return;
                    }
                }
            }
            case "logs": {
                switch (subCommand) {
                    case "discord": {
                        const channel = options.getChannel("canal", true)

                        db.upset(db.guilds, guild.id, {
                            systems: { logs: channel.id }
                        });

                        interaction.editReply({
                            content: `O canal de logs foi definido com sucesso no canal ${channel}`,
                        })
                        return;
                    }
                }
            }
        }
        switch (subCommand) {
            case "ticket": {
                const channel = options.getChannel("canal", true, [ChannelType.GuildText])
                const donations_cat = options.getChannel("categoria-doações", true)
                const support_cat = options.getChannel("categoria-suporte", true)
                const fac_cat = options.getChannel("categoria-fac", true)
                const report_cat = options.getChannel("categoria-denúncia", true)
                const ombudsman_cat = options.getChannel("categoria-ouvidoria", true)
                const doacoes_role = options.getRole("atendimento-doações", true)
                const support_role = options.getRole("atendimento-suporte", true)
                const fac_role = options.getRole("atendimento-fac", true)
                const report_role = options.getRole("atendimento-denuncias", true)
                const ombudsman_role = options.getRole("atendimento-ouvidoria", true)
                const transcripts = options.getChannel("canal-transcripts", true)
                const imagem = options.getString("imagem", false)

                db.upset(db.guilds, guild.id, {
                    ticket: {
                        donations_cat: donations_cat.id,
                        support_cat: support_cat.id,
                        fac_cat: fac_cat.id,
                        report_cat: report_cat.id,
                        ombudsman_cat: ombudsman_cat.id,
                        donation_role: doacoes_role.id,
                        support_role: support_role.id,
                        fac_role: fac_role.id,
                        report_role: report_role.id,
                        ombudsman_role: ombudsman_role.id,
                        transcripts: transcripts.id,
                    }
                });

                const embed = new EmbedBuilder({
                    author: {
                        name: `Seja bem-vindo a Corregedoria Interna do ${interaction.guild.name}`,
                    },
                    description: `Fique a vontade para abrir um ticket para denunciar militares que estejam na contramão da lei, das normas e regulamentos cível e militar.\n\nAs denúncias são totalmente anônimas, devendo conter apenas os dados que forem solicitados pelos corregedores.`,
                    color: hexToRgb(settings.colors.theme.info)
                });

                if (imagem) {
                    embed.setImage(imagem)
                }

                const seleciona = new ActionRowBuilder<StringSelectMenuBuilder>({
                    components: [
                        new StringSelectMenuBuilder({
                            customId: "definir-ticket-create-channel",
                            placeholder: "Selecione uma opção...",
                            options: [
                                { label: "Justificar ausência", value: "support_cat", emoji: "⏳" },
                                { label: "Abrir Ticket", value: "donations_cat", emoji: "📁" },
                                { label: "Abrir Denuncia", value: "report_cat", emoji: "<:1110415207978774588:1178188888003596418>" },
                                { label: "Redefinir Opção Selecionada", value: "ticket-redefinir-selecionada", emoji: "<:evo_restart:1193992419939733584>" }
                            ]
                        })
                    ]
                });

                channel.send({
                    embeds: [embed],
                    components: [seleciona]
                });
                interaction.editReply({
                    content: `Sistema de **ticket** configurado com sucesso, enviado no canal ${channel}.`
                })
                return;
            }
            case "bot": {
                const nameOption = options.getString('name', false);
                const avatarOption = options.getAttachment('avatar', false);
                const cor = options.getAttachment('cor-embeds', false);

                if (nameOption && nameOption.length > 32) {
                    await interaction.editReply({
                        content: 'O novo nome do bot deve ter no máximo 32 caracteres',
                    });
                    return;
                }

                try {
                    if (nameOption) {
                        await client.user?.setUsername(nameOption);
                    }

                    if (avatarOption) {
                        await client.user?.setAvatar(avatarOption.url);
                    }

                    await interaction.editReply({
                        content: 'As configurações do bot foram atualizadas com sucesso!',
                    });
                } catch (error) {
                    await interaction.editReply({
                        content: 'Ocorreu um erro ao fazer a alteração no bot',
                    });
                }
                return;
            }
            case "sugestões": {
                const channel = options.getChannel("canal", true);

                db.upset(db.guilds, guild.id, {
                    systems: { suggestions: channel.id }
                })

                interaction.editReply({
                    content: `o canal para as sugestões foi definido com sucesso no canal: ${channel}!`,
                });
                return;
            }
        }
    },
})