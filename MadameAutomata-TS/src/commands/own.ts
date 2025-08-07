
import { SlashCommandBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
  .setName('own')
  .setDescription('Mark a user as owned.')
  .addUserOption(o=>o.setName('sub').setDescription('Sub to own').setRequired(true));
export async function execute(interaction, { prisma }) {
  const sub = interaction.options.getUser('sub', true);
  await prisma.ownership.create({ data: { guildId: interaction.guildId, ownerId: interaction.user.id, subId: sub.id } });
  await interaction.reply({ content: `${sub} is now owned by <@${interaction.user.id}>.`, ephemeral: false });
}
