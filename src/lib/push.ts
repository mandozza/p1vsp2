import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const contactEmail = process.env.VAPID_EMAIL || 'mailto:support@pro-project.io';

if (publicKey && privateKey) {
  webpush.setVapidDetails(contactEmail, publicKey, privateKey);
}

/**
 * Sends a web push notification to a specific subscription.
 */
export async function sendWebPush(subscription: any, payload: { title: string; body: string; url?: string }) {
  if (!publicKey || !privateKey) {
    console.warn('VAPID keys are missing. Skipping Web Push.');
    return;
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or no longer valid
      return { success: false, expired: true };
    }
    console.error('Web Push Error:', error);
    return { success: false };
  }
}
