import 'dotenv/config';
import http from 'node:http';
import { Client, GatewayIntentBits, Partials, Events, REST, Routes, Collection } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import pino from 'pino';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CONFIG } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const log = pino({ name: 'madameautomata' });

const port = process.env.PORT;
if (port) {
  http.createServer((_req, res) => { res.writeHead(200); res.end('OK'); })
    .listen(Number(port), () => log.info({ port }, 'Healthcheck HTTP listening'));
}

export const prisma = new PrismaClient();
export const redis = CONFIG.redisUrl ? new Redis(CONFIG.redisUrl) : null;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message]
});

export type CommandModule = {
  data: any;
  execute: (interaction: any, ctx: { prisma: PrismaClient; redis: Redis | null; log: any }) => Promise<void>;
};

export const commands = new Collection<string, CommandModule>();
const commandsDir = path.join(__dirname, 'commands');

async function loadCommands() {
  if (!fs.existsSync(commandsDir)) {
    log.warn({ commandsDir }, 'No commands folder found');
    return [];
  }
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  const bodies: any[] = [];
  for (const file of files) {
    try {
      const mod = (await import(pathToFileURL(path.join(commandsDir, file)).href)) as any;
      if (mod?.data?.name && typeof mod.execute === 'function') {
        commands.set(mod.data.name, mod);
        bodies.push(mod.data.toJSON());
      }
    } catch (e) {
      log.error(e, 'Failed to load command %s', file);
    }
  }
  log.info({ commands: [...commands.keys()] }, 'Loaded commands');
  return bodies;
}

function bindInteractionHandler() {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const cmd = commands.get(interaction.commandName);
    if (!cmd) return;
    try {
      await cmd.execute(interaction, { prisma, redis, log });
    } catch (e) {
      log.error(e, 'Command failed');
      if (interaction.deferred || interaction.replied)
        await interaction.followUp({ content: 'Something went wrong.', ephemeral: true });
      else
        await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
    }
  });
}

function bindReadyHandler(bodies: any[]) {
  client.once(Events.ClientReady, async (c) => {
    log.info({ user: c.user.tag }, 'Ready. Registering slash commands...');
    const rest = new REST({ version: '10' }).setToken(CONFIG.token);
    try {
      if (CONFIG.guildId) {
        await rest.put(Routes.applicationGuildCommands(CONFIG.clientId, CONFIG.guildId), { body: bodies });
        log.info('Registered guild commands.');
      } else {
        await rest.put(Routes.applicationCommands(CONFIG.clientId), { body: bodies });
        log.info('Registered global commands.');
      }
    } catch (e) {
      log.error(e, 'Command registration failed');
    }
    log.info('✅ MadameAutomata is online.');
  });
}

process.on('unhandledRejection', (e) => log.error(e, 'UNHANDLED REJECTION'));
process.on('uncaughtException',  (e) => log.error(e, 'UNCAUGHT EXCEPTION'));

async function main() {
  const bodies = await loadCommands();
  bindInteractionHandler();
  bindReadyHandler(bodies);

  log.info({ hasToken: !!CONFIG.token, clientId: CONFIG.clientId, guildId: CONFIG.guildId }, 'Logging in...');
  try {
    await client.login(CONFIG.token);
    log.info('LOGIN OK');
  } catch (e) {
    log.error(e, 'LOGIN FAILED');
  }
}
void main();
