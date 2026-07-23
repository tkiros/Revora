import { chmod, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type EmailStubEnv = {
  AUTH_EMAIL_STUB_DIR?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
};

/**
 * Vercel previews run an optimized (`NODE_ENV=production`) build, so the
 * deployment tier must win there. On every other host, production mode is the
 * safe fallback. This keeps the disk mailbox usable in explicit preview/dev
 * environments while making it impossible to select in production.
 */
export function isProductionDeployment(env: EmailStubEnv): boolean {
  if (env.VERCEL_ENV === "production") {
    return true;
  }
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") {
    return false;
  }
  return env.NODE_ENV === "production";
}

export function emailStubDirectory(env: EmailStubEnv): string | null {
  const directory = env.AUTH_EMAIL_STUB_DIR?.trim();
  if (!directory || isProductionDeployment(env)) {
    return null;
  }
  return directory;
}

/** Store one-time links and test messages with owner-only permissions. */
export async function writeEmailStub(
  directory: string,
  filename: string,
  value: unknown
): Promise<void> {
  if (path.basename(filename) !== filename) {
    throw new Error("Email stub filename must not contain a path.");
  }

  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  const destination = path.join(directory, filename);
  await writeFile(destination, JSON.stringify(value), { mode: 0o600 });
  await chmod(destination, 0o600);
}
