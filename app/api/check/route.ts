import { NextResponse } from "next/server";

import { createOpenAIRevoraModelClient } from "../../../lib/revora/openai-client";
import { checkFood } from "../../../lib/revora/service";

export const runtime = "nodejs";

const model = createOpenAIRevoraModelClient();

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const response = await checkFood(body, { model });
  return NextResponse.json(response);
}
