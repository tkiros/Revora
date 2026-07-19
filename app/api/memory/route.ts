import {
  createMemoryListHandler,
  createMemoryUpsertHandler
} from "./handlers";

export const runtime = "nodejs";

export const GET = createMemoryListHandler();
export const POST = createMemoryUpsertHandler();
