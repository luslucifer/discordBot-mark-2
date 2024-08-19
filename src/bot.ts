import fs from 'fs';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { crazyBrowser } from './puppeteer';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Read and parse brands.json
const data = fs.readFileSync('brands.json', 'utf-8');
const brandArr: string[] = JSON.parse(data).filter(s => s.length > 0);
const re = new RegExp(`${brandArr.join('|')}`);

// Use the token from environment variables
const BOTTOKEN = process.env.BOTTOKEN;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message: Message) => {
    try {
        if (message.author.bot) return;

        if (re.test(message.content)) {
            let matched = message.content.match(re)?.[0];
            if (matched) {
                const link = await crazyBrowser(matched);
                if (link) {
                    message.reply(link);
                } else {
                    message.reply('No link found for the brand.');
                }
            } else {
                message.reply('No matching brand found.');
            }
        } else {
            message.reply('Brand name does not match any known brands.');
        }
    } catch (error) {
        console.error('Error handling message:', error);
        message.reply('An error occurred while processing your request.');
    }
});

if (BOTTOKEN) {
    client.login(BOTTOKEN).catch((error) => {
        console.error('Failed to login:', error);
    });
} else {
    console.error('Discord bot token is not set in the environment variables.');
}
