import 'dotenv/config';

export const CONFIG = {
  token: process.env.DISCORD_TOKEN!,
  clientId: process.env.DISCORD_CLIENT_ID!,
  guildId: process.env.GUILD_ID || undefined,
  redisUrl: process.env.REDIS_URL || undefined,
};
