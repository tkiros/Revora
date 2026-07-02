import { createStripeWebhookHandler } from "../../handlers";

export const runtime = "nodejs";
export const POST = createStripeWebhookHandler();
