
import { SlashCommandBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
  .setName('assign')
  .setDescription('Assign a task.')
  .addUserOption(o=>o.setName('to').setDescription('Assignee').setRequired(true))
  .addStringOption(o=>o.setName('title').setDescription('Task title').setRequired(true));
export async function execute(interaction, { prisma }) {
  const to = interaction.options.getUser('to', true);
  const title = interaction.options.getString('title', true);
  await prisma.task.create({ data: { guildId: interaction.guildId, assignedTo: to.id, assignedBy: interaction.user.id, title } });
  await interaction.reply({ content: `Task assigned to ${to}: **${title}**`, ephemeral: false });
}
