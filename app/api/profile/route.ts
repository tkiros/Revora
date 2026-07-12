import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { routeA1C } from "../../../lib/revora/a1c";
import { encryptField } from "../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";

export const runtime = "nodejs";

// Approved boundary copy (docs/safety/copy-ledger.md) — out-of-range A1C gets
// guidance, never a verdict, at profile creation exactly as at check time.
const BELOW_RANGE_MESSAGE =
  "Revora is designed for the prediabetes A1C range of 5.7% to 6.4%. This value sits below that range, so use a doctor or registered dietitian for guidance that is specific to you.";
const HIGH_RANGE_MESSAGE =
  "This A1C value falls in a range used for diabetes and is outside Revora's prediabetes-only MVP. For personalized next steps, talk with a doctor or registered dietitian.";

const ProfileRequestSchema = z
  .object({
    a1c: z.number().finite().gte(0).lte(20),
    consent: z.boolean(),
    timezone: z.string().trim().min(1).max(64)
  })
  .strict();

type ProfileRouteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
};

export function createProfileRouteHandlers(deps: ProfileRouteDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;

  return {
    async GET() {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Sign in first." }, { status: 401 });
      }

      const [profile] = await db()
        .select({
          a1cBand: schema.profiles.a1cBand,
          timezone: schema.profiles.timezone,
          nudgeOptIn: schema.profiles.nudgeOptIn,
          nudgeHour: schema.profiles.nudgeHour
        })
        .from(schema.profiles)
        .where(eq(schema.profiles.userId, session.userId));

      if (!profile) {
        return NextResponse.json({ hasProfile: false });
      }

      return NextResponse.json({ hasProfile: true, ...profile });
    },

    async POST(request: Request) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Sign in first." }, { status: 401 });
      }

      let body: unknown = null;
      try {
        body = await request.json();
      } catch {
        body = null;
      }

      const parsed = ProfileRequestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Enter your latest A1C with one decimal, like 6.1." },
          { status: 400 }
        );
      }

      if (!parsed.data.consent) {
        // GDPR Art. 9: explicit consent is the lawful basis for storing
        // health data — no consent, no profile, no storage.
        return NextResponse.json(
          {
            error:
              "Saving A1C and meal history needs your explicit health-data consent."
          },
          { status: 400 }
        );
      }

      const route = routeA1C(parsed.data.a1c);
      if (route.kind === "out_of_scope") {
        return NextResponse.json(
          {
            error:
              route.band === "below_prediabetes_range"
                ? BELOW_RANGE_MESSAGE
                : HIGH_RANGE_MESSAGE
          },
          { status: 400 }
        );
      }

      const now = new Date();
      await db()
        .insert(schema.profiles)
        .values({
          userId: session.userId,
          a1cCiphertext: encryptField(parsed.data.a1c.toFixed(1)),
          a1cBand: route.band,
          timezone: parsed.data.timezone,
          consentedAt: now,
          onboardedAt: now
        })
        .onConflictDoUpdate({
          target: schema.profiles.userId,
          set: {
            a1cCiphertext: encryptField(parsed.data.a1c.toFixed(1)),
            a1cBand: route.band,
            timezone: parsed.data.timezone,
            consentedAt: now
          }
        });

      return NextResponse.json({ ok: true, a1cBand: route.band });
    }
  };
}

const NudgePrefsSchema = z
  .object({
    nudgeHour: z.number().int().min(0).max(23).optional(),
    nudgeOptIn: z.boolean().optional()
  })
  .strict();

export function createProfilePatchHandler(deps: ProfileRouteDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;

  return async function PATCH(request: Request) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const parsed = NudgePrefsSchema.safeParse(body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    await db()
      .update(schema.profiles)
      .set(parsed.data)
      .where(eq(schema.profiles.userId, session.userId));

    return NextResponse.json({ ok: true });
  };
}

const handlers = createProfileRouteHandlers();
export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = createProfilePatchHandler();
