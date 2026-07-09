import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isVideoEngineEnabled, readSpecIds } from "../../../../lib/video-engine/dashboard";

export const runtime = "nodejs";

const notFound = () => new NextResponse(null, { status: 404 });

export type AssetDeps = {
  getEnv?: () => { VERCEL_ENV?: string; NODE_ENV?: string };
  cwd?: () => string;
};

/** Stream a rendered master.mp4 for the dev-only G2 player. Every input is validated:
 * date matches the ISO shape, specId MUST be an id from specs.json (never a raw path segment),
 * and the resolved path is asserted to stay under output/<date>/assets/ (path-traversal defense).
 * Range-aware so the <video> element can seek. Never imports render.ts/template.ts. */
export function createAssetHandler(deps: AssetDeps = {}) {
  const getEnv = deps.getEnv ?? (() => process.env);
  const cwd = deps.cwd ?? (() => process.cwd());

  return async function GET(req: Request): Promise<Response> {
    if (!isVideoEngineEnabled(getEnv())) return notFound();

    const url = new URL(req.url);
    const date = url.searchParams.get("date") ?? "";
    const specId = url.searchParams.get("specId") ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "invalid date" }, { status: 400 });

    const veRoot = path.join(cwd(), "video-engine");
    // specId allowlist — a specId not in specs.json can never reach the filesystem.
    if (!readSpecIds(date, veRoot).includes(specId)) return notFound();

    const assetsRoot = path.resolve(veRoot, "output", date, "assets");
    const file = path.resolve(assetsRoot, specId, "master.mp4");
    // belt-and-suspenders: even an allowlisted specId must resolve under assets/<date>/.
    if (file !== assetsRoot && !file.startsWith(assetsRoot + path.sep)) return notFound();
    if (!fs.existsSync(file)) return notFound();

    const size = fs.statSync(file).size;
    const buf = fs.readFileSync(file); // dev-only, ~2MB masters — whole-file read is fine
    const range = req.headers.get("range");
    const m = range && /bytes=(\d+)-(\d*)/.exec(range);
    if (m) {
      const start = Number(m[1]);
      const end = m[2] ? Number(m[2]) : size - 1;
      const slice = buf.subarray(start, end + 1);
      return new Response(slice, { status: 206, headers: {
        "content-type": "video/mp4", "accept-ranges": "bytes",
        "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(slice.length),
      } });
    }
    return new Response(buf, { status: 200, headers: {
      "content-type": "video/mp4", "accept-ranges": "bytes", "content-length": String(size),
    } });
  };
}

export const GET = createAssetHandler();
