import {
  createJourneyGetHandler,
  createJourneyPostHandler
} from "./handlers";

export const runtime = "nodejs";

export const GET = createJourneyGetHandler();
export const POST = createJourneyPostHandler();
