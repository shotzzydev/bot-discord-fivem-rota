import { db } from "@/database";
import { Component } from "@/discord/base";
import { settings } from "@/settings";
import { hexToRgb } from "@magicyan/discord";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannelResolvable, ChannelType, ComponentType, EmbedBuilder, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import { createTranscript } from "discord-html-transcripts";

new Component({
    customId: "definir-ticket-create-channel",
    type: ComponentType.StringSelect, cache: "cached",
    async run(interaction) {
        await interaction.deferReply({
            ephemeral,
        });

        const { guild } = interaction;

        const roleManager = interaction.guild?.roles;

        db.get(db.guilds, guild.id)
            .then((data) => {
                const doacoes_atendimento = data?.ticket?.donation_role;
                const suporte_atendimento = data?.ticket?.support_role;
                const denuncias_atendimento = data?.ticket?.report_role;

                const parent = data?.ticket?.[interaction.values[0] as keyof typeof data.ticket];

                let selecionado: string;

                switch (interaction.values[0]) {
                    case "support_cat": {
                        selecionado = "Justificar ausência"
                        break;
                    }
                    case "donations_cat": {
                        selecionado = "Abrir Ticket"
                        break;
                    }
                    case "report_cat": {
                        selecionado = "Abrir Denuncia"
                        break;
                    }

                    case "ticket-redefinir-selecionada": {
                      interaction.editReply({
                            embeds: [
                                new EmbedBuilder({
                                    description: `A opção selecionada anteriomente foi redefinida com sucesso\nagora você pode escolher a categoria desejada novamente.`,
                                    color: hexToRgb(settings.colors.theme.success),
                                })
                            ]
                        })
                        return;
                    }
                }

                const categoriaSelecionada = interaction.values[0];

                const categoriaParaEmoji: { [key: string]: string } = {
                    "support_cat": "⏳",
                    "donations_cat": "📁",
                    "report_cat": "🚨",
                };

                const categoriaParaName: { [key: string]: string } = {
                    "support_cat": "justificativa",
                    "donations_cat": "ticket",
                    "report_cat": "denuncia",
                };

                const emoji = categoriaParaEmoji[categoriaSelecionada];
                const nameticket = categoriaParaName[categoriaSelecionada];

                const canal = guild.channels;

                let categoria = parent

                const ticket = interaction.guild?.channels.cache.find((ticket) => ticket.type === ChannelType.GuildText && ticket.topic === interaction.user.id);

                if (ticket) {
                    const embed = new EmbedBuilder()
                        .setDescription(`<:1132317002602647583:1143250853462024293> Você já possui um ticket aberto acesse clicando no botão abaixo.`)
                        .setColor(hexToRgb(settings.colors.theme.warning))

                    const botao = new ButtonBuilder({
                        label: "Acesse seu ticket",
                        emoji: "<:evo_link:1194129521272696852>",
                        style: ButtonStyle.Link,
                        url: `https://discord.com/channels/${interaction.guild?.id}/${ticket.id}`
                    })

                    const row1 = new ActionRowBuilder<ButtonBuilder>({
                        components: [botao]
                    })

                    interaction.editReply({
                        embeds: [embed],
                        components: [row1]
                    })
                    return;
                }

                const categoriaParaCargo: { [key: string]: string } = {
                    support_cat: suporte_atendimento || "",
                    donations_cat: doacoes_atendimento || "",
                    report_cat: denuncias_atendimento || "",
                };

                const cargoSelecionado = categoriaParaCargo[interaction.values[0]];

                roleManager?.fetch(cargoSelecionado).catch(() => null);

                canal.create({
                    name: `${emoji}┇${nameticket}-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoria as CategoryChannelResolvable,
                    topic: `${interaction.user.id}`,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: ["ViewChannel"],
                            allow: ["ViewAuditLog", "SendMessages"],
                        },
                        {
                            id: interaction.user.id,
                            allow: ["ViewChannel", "ViewAuditLog", "SendMessages", "AttachFiles"]
                        },
                        {
                            id: `${cargoSelecionado}`,
                            allow: ["SendMessages", "ViewChannel", "AttachFiles", "EmbedLinks", "AddReactions", "ViewAuditLog"]
                        }
                    ]
                })
                    .then((canal) => {
                        const criado = new EmbedBuilder()
                            .setDescription(`${interaction.user}, seja bem-vindo ao seu ticket. Por favor, informe o seu assunto para que possamos fornecer ajuda o mais rápido possível.\n\n**Assunto do ticket**: \`${selecionado}\`\n\nPara os responsáveis terem acesso às modificações sobre o canal, acessem o painel clicando no botão **Painel Ticket**.`)
                            .setThumbnail(interaction.user.avatarURL(undefined))
                            .setColor(hexToRgb(settings.colors.theme.info))

                        const staff = new ButtonBuilder({
                            customId: "staff-painel-ticket-panel",
                            style: ButtonStyle.Primary,
                            label: "Painel Ticket",
                        });

                        const row = new ActionRowBuilder<ButtonBuilder>({
                            components: [staff]
                        });

                        canal.send({
                            embeds: [criado],
                            components: [row]
                        });

                        const embed = new EmbedBuilder()
                            .setDescription(`Seu ticket foi criado com sucesso, clique no botão a baixo\npara ser redirecionado para o seu ticket`)
                            .setColor(hexToRgb(settings.colors.theme.success));

                        const botao = new ButtonBuilder({
                            label: "Acesse seu ticket",
                            emoji: "<:evo_sucesso:1193994786823221309>",
                            style: ButtonStyle.Link,
                            url: `https://discord.com/channels/${guild.id}/${canal.id}`
                        });

                        const row1 = new ActionRowBuilder<ButtonBuilder>({
                            components: [botao]
                        });

                        interaction.editReply({
                            embeds: [embed],
                            components: [row1]
                        })
                    })
                return;
            })
    },
})
new Component({
    name: "manage ticket buttons",
    customId: id => id.startsWith("staff-painel-ticket-"),
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        const { customId, guild, channel } = interaction;
        const selected = customId.replace("staff-painel-ticket-", "")
        const data = await db.get(db.guilds, guild.id);

        switch (selected) {
            case "panel": {
                await interaction.deferReply({
                    ephemeral: true
                });

                db.get(db.guilds, guild.id)
                    .then((data) => {
                        const doacoes_atendimento = data?.ticket?.donation_role;
                        const suporte_atendimento = data?.ticket?.support_role;
                        const denuncias_atendimento = data?.ticket?.report_role;
                        const ouvidoria_atendimento = data?.ticket?.ombudsman_role

                        const RoleIDs = [
                            doacoes_atendimento,
                            suporte_atendimento,
                            denuncias_atendimento,
                            ouvidoria_atendimento
                        ];

                        const hasAdminPermission = interaction.memberPermissions.has("Administrator");
                        const hasAllowedRole = interaction.member.roles.cache.some(role => RoleIDs.includes(role.id));

                        if (!hasAdminPermission && !hasAllowedRole) {
                            interaction.reply({
                                content: `<:1132317002602647583:1143250853462024293> ${interaction.user.globalName}, você não tem permissão para usar essa função.`,
                                ephemeral: true
                            });
                            return;
                        };

                        const embed = new EmbedBuilder()
                            .setDescription(`**Painel Ticket**\n\n${interaction.user} Todas as funcionalidades para realizar modificações disponíveis para este atendimento estão nos botões abaixo. Clique neles de acordo com a ação necessária.`)
                            .setThumbnail(interaction.user.avatarURL(undefined))
                            .setColor(hexToRgb(settings.colors.theme.info));

                        const add = new ButtonBuilder({
                            customId: "staff-painel-ticket-add",
                            label: "Adicionar Membro",
                            style: ButtonStyle.Secondary,
                        });

                        const rem = new ButtonBuilder({
                            customId: "staff-painel-ticket-rem",
                            label: "Remover Membro",
                            style: ButtonStyle.Secondary,
                        });

                        const notify = new ButtonBuilder({
                            customId: "staff-painel-ticket-notify",
                            label: "Notificar Membro",
                            style: ButtonStyle.Primary,
                        });

                        const finish = new ButtonBuilder({
                            customId: "staff-painel-ticket-finish",
                            label: "Finalizar Atendimento",
                            style: ButtonStyle.Danger,
                        });

                        const row = new ActionRowBuilder<ButtonBuilder>({
                            components: [add, rem, notify]
                        });

                        const row1 = new ActionRowBuilder<ButtonBuilder>({
                            components: [finish]
                        });

                        interaction.editReply({
                            embeds: [embed],
                            components: [row, row1],
                        })
                    })
                return;
            }
            case "add": {
                const modal = new ModalBuilder({ customId: "add-membro-ticket-modal", title: "Adicionar Membro" });

                const imput = new ActionRowBuilder<TextInputBuilder>({
                    components: [
                        new TextInputBuilder({
                            customId: "add-membro-ticket-imput",
                            label: "ID do membro",
                            placeholder: "Exemplo: 983801040262553682",
                            style: TextInputStyle.Short
                        })
                    ]
                })

                modal.setComponents(imput);
                interaction.showModal(modal);

                const modalInteraction = await interaction.awaitModalSubmit({ time: 30_000, filter: (i) => i.user.id === interaction.user.id }).catch(() => null);
                if (!modalInteraction) return;

                let { fields } = modalInteraction;
                let memberId = fields.getTextInputValue("add-membro-ticket-imput");

                const guild = interaction.client.guilds.cache.get(interaction.guildId);

                const member = guild?.members.cache.get(memberId);

                if (!member) {
                    modalInteraction.reply({ content: "Não foi encontrado nenhum membro com esse ID.", ephemeral: true });
                    return;
                }

                const channelId = interaction.channelId;
                const channel = guild?.channels.cache.get(channelId);

                const textChannel = channel as TextChannel;
                await textChannel.permissionOverwrites.edit(
                    member,
                    {
                        ViewChannel: true,
                        SendMessages: true,
                        ViewAuditLog: true,
                        AddReactions: true,
                        EmbedLinks: true,
                        AttachFiles: true
                    }
                );

                modalInteraction.reply({ content: `O membro: <@${memberId}> foi adicionado ao ticket com sucesso!`, ephemeral: true })
                    .catch(() => {
                        modalInteraction.reply({ content: "Ocorreu um erro ao adicionar o membro ao ticket.", ephemeral: true });
                    });
                return;
            }
            case "rem": {
                const modal = new ModalBuilder({ customId: "add-membro-ticket-modal", title: "Remover Membro" });

                const imput = new ActionRowBuilder<TextInputBuilder>({
                    components: [
                        new TextInputBuilder({
                            customId: "remover-membro-ticket-imput",
                            label: "ID do membro",
                            placeholder: "Exemplo: 983801040262553682",
                            style: TextInputStyle.Short
                        })
                    ]
                })

                modal.setComponents(imput);
                interaction.showModal(modal)

                const modalInteraction = await interaction.awaitModalSubmit({ time: 30_000, filter: (i) => i.user.id === interaction.user.id }).catch(() => null);
                if (!modalInteraction) return;

                const { fields } = modalInteraction;
                const memberId = fields.getTextInputValue("remover-membro-ticket-imput");

                const guild = interaction.client.guilds.cache.get(interaction.guildId);
                const member = guild?.members.cache.get(memberId);

                if (!member) {
                    modalInteraction.reply({ content: "Não foi encontrado nenhum membro com esse ID.", ephemeral: true });
                    return;
                }

                const channelId = interaction.channelId;
                const channel = guild?.channels.cache.get(channelId);
                const textChannel = channel as TextChannel;

                await textChannel.permissionOverwrites.edit(
                    member,
                    {
                        ViewChannel: false,
                        SendMessages: false,
                        ViewAuditLog: false,
                        AddReactions: false,
                        EmbedLinks: false,
                        AttachFiles: false,
                    }
                );

                modalInteraction.reply({ content: `${interaction.user}", você removeu com sucesso o membro <@${memberId}> do canal de atendimento!`, ephemeral: true })
                    .catch(() => {
                        modalInteraction.reply({ content: "Ocorreu um erro ao remover o membro do ticket.", ephemeral: true });
                    });
                return;
            }
            case "notify": {
                await interaction.deferReply({
                    ephemeral
                })

                if (channel instanceof TextChannel) {
                    const topic = channel.topic;

                    if (topic) {
                        const userIdMatch = topic.match(/(\d+)/);

                        if (userIdMatch) {
                            const userId = userIdMatch[1];

                            try {
                                const user = await guild.members.fetch(userId);
                                if (user) {
                                    const embed = new EmbedBuilder()
                                        .setDescription(`${user} O Seu **TICKET** acaba de ser **RESPONDIDO!**\nUm de nossos atendentes aguarda você! `)
                                        .setColor(hexToRgb(settings.colors.theme.info))

                                    const button = new ButtonBuilder({
                                        label: "Acessa ticket",
                                        style: ButtonStyle.Link,
                                        url: `${channel.url}`
                                    })

                                    const row = new ActionRowBuilder<ButtonBuilder>({ components: [button] })
                                    await user.send({ embeds: [embed], components: [row] });
                                    interaction.editReply({ content: `O membro: ${user.user} foi notificado sobre seu atendimento com sucesso` })
                                    return;
                                }
                            } catch {
                                interaction.editReply({ content: `Não foi possivel notificar o membro **DM** fechada` })
                                return;
                            }
                        }
                    }
                }
                return;
            }
            case "finish": {
                const ticket_logs = data?.ticket?.transcripts;

                const log = interaction.guild?.channels.cache.get(`${ticket_logs}`) ?? null;

                await interaction.deferReply({
                    ephemeral: true
                });

                interaction.editReply({
                    content: `${interaction.user} Sua Solicitação de finalização do atendimento foi realizado com sucesso esse canal vai ser deletado em **3 segundos**`
                })

                if (!interaction.channel) {
                    interaction.editReply({
                        content: "❌ Não foi possível excluir esse ticket."
                    });
                    return;
                };

                if (interaction.channel.type !== ChannelType.GuildText) {
                    interaction.editReply({
                        content: "❌ Não foi possível salvar as mensagens desse ticket."
                    });
                    return;
                };

                const user = interaction.guild.members.cache.get(`${interaction.channel.topic}`);

                if (!user) {
                    interaction.editReply({
                        content: "❌ Não foi possível achar o usuário que abriu o ticket."
                    });
                    return;
                };

                const embed2 = new EmbedBuilder()
                    .setAuthor({ name: "REGISTRO DE TICKET" })
                    .setColor(hexToRgb(settings.colors.theme.info))
                    .setThumbnail(`${interaction.guild?.iconURL(undefined)}`)
                    .addFields(
                        { name: "Usuário que abriu o ticket: ", value: `${user.user.tag}`, inline: false },
                        { name: "Usuário que fechou o ticket:", value: `${interaction.user.tag}`, inline: false },
                        { name: "Horário de abertura do ticket:", value: `<t:${~~(interaction.createdAt.getTime() / 1000)}:F>`, inline: false },
                        { name: "Canal do ticket:", value: `${interaction.channel.name}`, inline: false },
                    );

                const file = await createTranscript(interaction.channel, {
                    filename: `${interaction.channel.name}.html`,
                    saveImages: true,
                    poweredBy: false,
                });

                if (log instanceof TextChannel && log.guild.id === interaction.guild.id) {
                    log.send({ embeds: [embed2], files: [file] });
                } else {
                    console.log("Canal de logs não encontrado.");
                }

                setTimeout(() => {
                    interaction.channel?.delete()
                }, 3000);
                return;
            }
        }
    },
})