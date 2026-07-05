import { createCancelHandlers } from "../handlers";

export const runtime = "nodejs";
const handlers = createCancelHandlers();
export const GET = handlers.GET;
export const POST = handlers.POST;
