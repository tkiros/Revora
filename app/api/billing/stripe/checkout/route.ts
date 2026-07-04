import { createStripeCheckoutHandler } from "../../handlers";

export const runtime = "nodejs";
export const POST = createStripeCheckoutHandler();
