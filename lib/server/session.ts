import { auth } from "../../auth";

/**
 * The one session shape data routes depend on — injectable in tests.
 */
export type SessionInfo = { userId: string; email: string } | null;

export async function getSessionInfo(): Promise<SessionInfo> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;

  if (!userId || !email) {
    return null;
  }

  return { userId, email };
}
