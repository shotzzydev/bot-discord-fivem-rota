import { ApplicationCommandOptionType, ApplicationCommandType, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, Collection, ComponentType, EmbedBuilder, ModalBuilder, TextChannel, TextInputStyle, codeBlock } from "discord.js"
import { Command, Modal } from "../../base"
import { brBuilder, createModalInput, createRow, hexToRgb } from "@magicyan/discord";
import { settings } from "@/settings";

interface MessageProps {
    channelId: string
    link: string | null
    image: Attachment | null
}

const members: Collection<string, MessageProps> = new Collection();

new Command({
    name: "anunciar",
    description: "Faça um anúncio utilizando o bot",
    dmPermission: false,
    defaultMemberPermissions: "Administrator",
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "canal",
        description: "Canal onde será enviado o anúncio",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required,
    },
    {
        name: "imagem",
        description: "Imagem anexada no anúncio",
        type: ApplicationCommandOptionType.Attachment,
        required: false
    },
    {
        name: "link",
        description: "Informe um link de URL para colocar no anúncio (opcional)",
        type: ApplicationCommandOptionType.String,
        required: false
    }],
    async run(interaction) {

        const { options, member } = interaction

        const channel = options.getChannel("canal", true)
        const image = options.getAttachment("imagem")
        const link = options.getString("link")

        members.set(member.id, { channelId: channel.id, image, link });

        await interaction.showModal(new ModalBuilder({
            customId: "announcement-modal",
            title: "Fazer um anúncio",
            components: [
                createModalInput({
                    customId: "announcement-title-input",
                    label: "Título",
                    placeholder: "Insira o Título",
                    style: TextInputStyle.Short,
                    maxLength: 256,
                    required: false
                }),
                createModalInput({
                    customId: "announcement-description-input",
                    label: "Descrição",
                    placeholder: "Insira o descrição",
                    style: TextInputStyle.Paragraph,
                    maxLength: 4000,
                })
            ]
        }))
    },
})
new Modal({
    customId: "announcement-modal",
    cache: "cached",
    async run(interaction) {
        const { fields, guild, member } = interaction;

        const MessageProps = members.get(member.id);
        if (!MessageProps) {
            interaction.reply({
                ephemeral,
                content: `Não foi possivel obter os dados inicias! Ultilize o comando novamente.`
            })
            return;
        }

        const title = fields.getTextInputValue("announcement-title-input")
        const description = fields.getTextInputValue("announcement-description-input")

        const embed = new EmbedBuilder({
            title, description,
            color: hexToRgb(settings.colors.theme.info),
        })

        await interaction.deferReply({ ephemeral: true, fetchReply })

        const files: AttachmentBuilder[] = [];

        if (MessageProps.image) {
            embed.setImage(`${MessageProps.image.url}`)
        }

        if (MessageProps.link) {
            embed.setURL(`${MessageProps.link}`)
        }

        const message = await interaction.editReply({
            embeds: [embed], files,
            components: [
                createRow(
                    new ButtonBuilder({
                        customId: "announcement-confirm-button", style: ButtonStyle.Success,
                        label: "Confirmar",
                    }),
                    new ButtonBuilder({
                        customId: "announcement-cancel-button", style: ButtonStyle.Danger,
                        label: "Cancelar",
                    })
                )
            ]
        });

        const collection = message.createMessageComponentCollector({ componentType: ComponentType.Button })
        collection.on("collect" , async (Subinteraction) => {
            const { customId } = Subinteraction;
            collection.stop;

           if (customId === "announcement-cancel-button"){
                Subinteraction.update({ embeds, components, files: [],
                    content: "Ação cancelada!"
                });
                return;
           }
           await Subinteraction.deferUpdate();
           
           const channel = guild.channels.cache.get(MessageProps.channelId) as TextChannel;

           channel.send({ content: `||@everyone||`, embeds: [embed], files })
           .then(msg => {
                interaction.editReply({  components, embeds, files: [],
                    content: `Messagem enviada com sucesso! Confira: ${msg.url}`        
                });
           })
           .catch(err => {    
              interaction.editReply({ components, embeds, files: [],
                content: brBuilder(`Não foi possivel enviar a messagem`, codeBlock("Bash", err)) 
            });
           });

           members.delete(member.id);
        })

    },
})