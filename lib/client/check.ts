import type { CheckRequest } from "../revora/schemas";

export async function submitCheck(
  input: CheckRequest,
  init?: { signal?: AbortSignal }
): Promise<unknown> {
  const response = await fetch("/api/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input),
    signal: init?.signal
  });

  return response.json();
}
