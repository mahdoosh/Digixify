import dotenv from 'dotenv';
import { TelegramBot } from 'node-telegram-bot-api';
import { Agent } from './agent/Agent.js';

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

const openrouterKey = process.env.OPENAI_API_KEY;
if (!openrouterKey) {
  console.error('OPENAI_API_KEY not set');
  process.exit(1);
}

const agent = new Agent(openrouterKey);

const bot = new TelegramBot(botToken, { polling: true });

console.log('Digixify bot started');

// Send startup message to admin if configured
const adminChatId = process.env.ADMIN_CHAT_ID;
if (adminChatId) {
  try {
    await bot.sendMessage(adminChatId, '🟢 Digixify agent is online and ready. I can help you build, research, and automate. Just send me a message.');
  } catch (err) {
    console.error('Failed to send admin startup message:', err.message);
  }
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return;

  console.log(`Received from ${chatId}: ${text.slice(0, 50)}...`);

  try {
    const response = await agent.handleMessage(text, chatId.toString());
    // Telegram max message length 4096, split if needed
    const maxLen = 4096;
    if (response.length <= maxLen) {
      await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } else {
      for (let i = 0; i < response.length; i += maxLen) {
        const chunk = response.slice(i, i + maxLen);
        await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
      }
    }
  } catch (err) {
    console.error('Agent error:', err);
    bot.sendMessage(chatId, "Sorry, I encountered an error. Check the logs.");
  }
});
