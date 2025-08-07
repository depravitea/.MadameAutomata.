
import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
export const data = new SlashCommandBuilder()
  .setName('house-setup')
  .setDescription('Set welcome & logs channels.')
  .addChannelOption(o=>o.setName('welcome').setDescription('Welcome channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
  .addChannelOption(o=>o.setName('logs').setDescription('Logs channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
export async function execute(interaction, { prisma }) {
  const welcome = interaction.options.getChannel('welcome', true);
  const logs = interaction.options.getChannel('logs', true);
  await prisma.serverSettings.upsert({
    where: { guildId: interaction.guildId },
    update: { welcomeChannelId: welcome.id, logsChannelId: logs.id },
    create: { guildId: interaction.guildId, welcomeChannelId: welcome.id, logsChannelId: logs.id }
  });
  await interaction.reply({ content: `Saved. Welcome: <#${welcome.id}>, Logs: <#${logs.id}>`, ephemeral: true });
}
