import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function sendDraftToDiscord(draft_post: string) {
  try {
    const response = await axios.post(
      process.env.DISCORD_WEBHOOK_URL || '',
      {
        content: draft_post,
        flags: 4 // SUPPRESS_EMBEDS
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return `Success sending draft to Discord webhook at ${new Date().toISOString()}`;
  } catch (error) {
    console.log('Error sending draft to Discord webhook');
    console.error(error);
    throw error;
  }
}

async function sendDraftToSlack(draft_post: string) {
  try {
    const response = await axios.post(
      process.env.SLACK_WEBHOOK_URL || '',
      {
        text: draft_post,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return `Success sending draft to webhook at ${new Date().toISOString()}`;
  } catch (error) {
    console.log('error sending draft to webhook');
    console.log(error);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendDraftToTelegram(draft_post: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
  }

  const timestamp = new Date().toISOString();
  const message =
    `🔍 <b>TrendFinder Alert</b>\n\n` +
    `${escapeHtml(draft_post)}\n\n` +
    `⏰ ${timestamp}`;

  try {
    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return `Success sending draft to Telegram at ${timestamp}`;
  } catch (error) {
    console.log('Error sending draft to Telegram');
    console.error(error);
    throw error;
  }
}

export async function sendDraft(draft_post: string) {
  const notificationDriver = process.env.NOTIFICATION_DRIVER?.toLowerCase();

  switch (notificationDriver) {
    case 'slack':
      return sendDraftToSlack(draft_post);
    case 'discord':
      return sendDraftToDiscord(draft_post);
    case 'telegram':
      return sendDraftToTelegram(draft_post);
    default:
      throw new Error(`Unsupported notification driver: ${notificationDriver}`);
  }
}