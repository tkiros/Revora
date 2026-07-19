import {
  createMemoryDeleteHandler,
  createMemoryEditHandler
} from "../handlers";

export const runtime = "nodejs";

export const PATCH = createMemoryEditHandler();
export const DELETE = createMemoryDeleteHandler();
