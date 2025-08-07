
import { SlashCommandBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
  .setName('safeword')
  .setDescription('Record a safeword event.')
  .addStringOption(o=>o.setName('tier').setDescription('green/yellow/red').setRequired(true))
  .addStringOption(o=>o.setName('note').setDescription('Optional note'));
export async function execute(interaction, { prisma }) {
  const tier = interaction.options.getString('tier', true).toLowerCase();
  const note = interaction.options.getString('note') || null;
  await prisma.safeword.create({ data: { guildId: interaction.guildId, userId: interaction.user.id, tier, note } });
  await interaction.reply({ content: `Safeword recorded: **${tier}**`, ephemeral: true });
}
