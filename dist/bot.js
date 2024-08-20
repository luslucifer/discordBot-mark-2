"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const discord_js_1 = require("discord.js");
const puppeteer_1 = require("./puppeteer");
// Load environment variables
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Read and parse brands.json
const data = fs_1.default.readFileSync('brands.json', 'utf-8');
const brandArr = JSON.parse(data).filter(s => s.length > 0);
const re = new RegExp(`${brandArr.join('|')}`);
// Use the token from environment variables
const BOTTOKEN = process.env.BOTTOKEN;
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent],
});
client.once('ready', () => {
    console.log('Bot is online!');
});
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (message.author.bot)
            return;
        if (re.test(message.content)) {
            let matched = (_a = message.content.match(re)) === null || _a === void 0 ? void 0 : _a[0];
            if (matched) {
                const link = yield (0, puppeteer_1.crazyBrowser)(matched);
                if (link) {
                    message.reply(link);
                }
                else {
                    message.reply('No link found for the brand.');
                }
            }
            else {
                message.reply('No matching brand found.');
            }
        }
        else {
            message.reply('Brand name does not match any known brands.');
        }
    }
    catch (error) {
        console.error('Error handling message:', error);
        message.reply('An error occurred while processing your request.');
    }
}));
if (BOTTOKEN) {
    client.login(BOTTOKEN).catch((error) => {
        console.error('Failed to login:', error);
    });
}
else {
    console.error('Discord bot token is not set in the environment variables.');
}
