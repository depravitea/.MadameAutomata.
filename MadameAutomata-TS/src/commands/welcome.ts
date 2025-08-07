
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
  .setName('welcome')
  .setDescription('Post the gothic welcome embed.');
export async function execute(interaction, { prisma }) {
  const settings = await prisma.serverSettings.findUnique({ where: { guildId: interaction.guildId } });
  const channelId = settings?.welcomeChannelId || interaction.channelId;
  const embed = new EmbedBuilder()
    .setTitle('Madame Automata welcomes you')
    .setDescription('Enter with consent, grace, and reverence. Obedience is exquisite.')
    .setColor(0x6a0dad);
  const channel = await interaction.client.channels.fetch(channelId);
  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: 'Sent.', ephemeral: true });
}
