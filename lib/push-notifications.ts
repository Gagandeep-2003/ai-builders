import "server-only";

import * as webpush from "web-push";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

type StoredSubscription = {
  endpoint: string;
  p256dh: string;
  auth_key: string;
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:gagandeepsingh220903@gmail.com";
  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export function isWebPushConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

export async function sendPushToUserIds(userIds: string[], payload: PushPayload) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  if (!uniqueUserIds.length || !configureWebPush()) return;

  const service = createServiceRoleSupabaseClient();
  if (!service) return;

  const { data, error } = await service
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .in("user_id", uniqueUserIds);

  if (error || !data?.length) return;

  await Promise.allSettled(
    (data as StoredSubscription[]).map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth_key,
            },
          },
          JSON.stringify(payload),
        );
      } catch (sendError) {
        const statusCode =
          typeof sendError === "object" && sendError && "statusCode" in sendError
            ? Number(sendError.statusCode)
            : 0;
        if (statusCode === 404 || statusCode === 410) {
          await service.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        }
      }
    }),
  );
}
