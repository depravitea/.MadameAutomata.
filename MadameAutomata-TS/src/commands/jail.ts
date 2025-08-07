
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
export const data = new SlashCommandBuilder()
  .setName('jail')
  .setDescription('Log a jail (role/action handled manually).')
  .addUserOption(o=>o.setName('user').setDescription('User').setRequired(true))
  .addStringOption(o=>o.setName('reason').setDescription('Reason'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
export async function execute(interaction, { prisma }) {
  const user = interaction.options.getUser('user', true);
  const reason = interaction.options.getString('reason') || null;
  await prisma.jail.create({ data: { guildId: interaction.guildId, userId: user.id, reason } });
  await interaction.reply({ content: `Jail logged for ${user}${reason ? `: ${reason}` : ''}.`, ephemeral: false });
}
