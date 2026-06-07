import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type {
  DeletedObjectJSON,
  UserJSON,
  WebhookEvent,
} from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

import { env } from "@/app/lib/env";
import {
  createUser,
  deleteUserByClerkId,
  updateUserByClerkId,
} from "@/app/db/queries/users";

/**
 * Clerk webhook endpoint.
 *
 * Keeps the database users table in sync with Clerk:
 * - user.created  -> insert a user record
 * - user.updated  -> update username / name / imageUrl
 * - user.deleted  -> remove the user record
 *
 * Requests are verified with Svix using CLERK_WEBHOOK_SECRET. Verification
 * failures return 400; database failures return 500 with a generic message.
 */

function fullName(data: UserJSON): string | null {
  const name = [data.first_name, data.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name.length > 0 ? name : null;
}

function resolveUsername(data: UserJSON): string {
  if (data.username) {
    return data.username;
  }

  const email = data.email_addresses?.[0]?.email_address;
  if (email) {
    return email.split("@")[0];
  }

  return `user_${data.id}`;
}

export async function POST(request: NextRequest) {
  let event: WebhookEvent;

  try {
    event = await verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SECRET,
    });
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return new Response("Webhook verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created": {
        const data = event.data;
        await createUser({
          clerkId: data.id,
          username: resolveUsername(data),
          name: fullName(data),
          imageUrl: data.image_url || null,
        });
        break;
      }

      case "user.updated": {
        const data = event.data;
        await updateUserByClerkId(data.id, {
          username: resolveUsername(data),
          name: fullName(data),
          imageUrl: data.image_url || null,
        });
        break;
      }

      case "user.deleted": {
        const data = event.data as DeletedObjectJSON;
        if (data.id) {
          await deleteUserByClerkId(data.id);
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so Clerk does not retry them.
        break;
    }
  } catch (error) {
    console.error(`Failed to process Clerk webhook (${event.type}):`, error);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response("Webhook received", { status: 200 });
}
