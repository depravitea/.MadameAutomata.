
import { SlashCommandBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
  .setName('release')
  .setDescription('Release a sub.')
  .addUserOption(o=>o.setName('sub').setDescription('Sub to release').setRequired(true));
export async function execute(interaction, { prisma }) {
  const sub = interaction.options.getUser('sub', true);
  const del = await prisma.ownership.deleteMany({ where: { guildId: interaction.guildId, ownerId: interaction.user.id, subId: sub.id } });
  await interaction.reply({ content: del.count ? `Released ${sub}.` : `No ownership found for ${sub}.`, ephemeral: false });
}
