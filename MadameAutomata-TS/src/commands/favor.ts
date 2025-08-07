
import { SlashCommandBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
  .setName('favor')
  .setDescription('Grant or deduct favors.')
  .addUserOption(o=>o.setName('user').setDescription('User').setRequired(true))
  .addIntegerOption(o=>o.setName('amount').setDescription('Positive or negative').setRequired(true))
  .addStringOption(o=>o.setName('reason').setDescription('Reason'));
export async function execute(interaction, { prisma }) {
  const user = interaction.options.getUser('user', true);
  const amount = interaction.options.getInteger('amount', true);
  const reason = interaction.options.getString('reason') || null;
  await prisma.favor.create({ data: { guildId: interaction.guildId, userId: user.id, amount, reason } });
  await interaction.reply({ content: `Favor updated for ${user}: **${amount >=0 ? '+' : ''}${amount}**${reason ? ` (${reason})` : ''}.`, ephemeral: false });
}
