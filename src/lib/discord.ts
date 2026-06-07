/**
 * Utility for sending formatted messages to Discord via Webhooks.
 */
export async function sendDiscordNotification(data: {
  title: string;
  description: string;
  color?: number;
  url?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `[SECTOR ALERT] ${data.title}`,
          description: data.description,
          url: data.url,
          color: data.color || 0xbc13fe, // Default Neon Purple
          fields: data.fields,
          footer: { text: 'ProProject Intelligence Engine' },
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    if (!response.ok) {
      console.error('Discord Webhook Failed:', await response.text());
    }
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}
