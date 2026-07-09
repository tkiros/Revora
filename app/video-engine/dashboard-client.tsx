"use client";

import { useCallback, useEffect, useState } from "react";

// Lightweight view types (mirror the engine's JSON; kept local so nothing from
// video-engine/ enters the client bundle).
type SpecStatus = "PENDING" | "BUILDING" | "LINTING" | "ERROR" | "DONE";
type RenderStatus = "PENDING" | "RENDERING" | "READY" | "ERROR";
type RunState = {
  date: string;
  status: "HOOKS" | "AWAITING_G0" | "SPECS" | "AWAITING_G1" | "PRODUCING" | "DONE" | "FAILED";
  error?: string;
  progress: { stage: string; done: number; total: number };
  specs: Record<string, { status: SpecStatus; error?: string; specId?: string }>;
  render?: Record<string, { status: RenderStatus; assetDir?: string; error?: string }>;
};
type Hook = { id: string; spoken_text: string; visual_text: string; framework_tag: string; pillar: string };
type Spec = { id: string; hook_id: string; format: string; duration_s: number; spoken_hook: string; visual_hook: string; caption_text: string };
type Item = { severity: "hard_fail" | "flag"; rule: string; span: string; suggestion?: string };
type Report = { spec_id: string; verdict: "hard_fail" | "flag" | "pass"; items: Item[] };
type Decision = { specId: string; verdict: "approve" | "reject"; gate: "g1" | "g2" };
type Snapshot = { run: RunState | null; hooks: Hook[]; specs: Spec[]; reports: Report[]; decisions: Decision[] };
type RunSummary = { date: string; status: RunState["status"]; hooks: number; specs: number; approved: number; bounced: number };

const ACTIVE = new Set(["HOOKS", "SPECS", "PRODUCING"]);
const card: React.CSSProperties = { border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 10 };
const mono: React.CSSProperties = { fontFamily: "ui-monospace, monospace" };

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

export function VideoEngineDashboard() {
  const [date, setDate] = useState<string | null>(null);
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <h1>Video Engine</h1>
      {date === null ? <Home onOpen={setDate} /> : <RunView date={date} onBack={() => setDate(null)} />}
    </main>
  );
}

function Home({ onOpen }: { onOpen: (d: string) => void }) {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [dump, setDump] = useState("");
  const [maxHooks, setMaxHooks] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { jsonFetch("/api/video-engine/runs").then((r) => setRuns(r.body.runs ?? [])); }, []);

  const start = async () => {
    setErr(""); setBusy(true);
    const r = await jsonFetch("/api/video-engine/hooks", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ dump, maxHooks: maxHooks ? Number(maxHooks) : undefined }),
    });
    setBusy(false);
    if (!r.ok) return setErr(r.body.error ?? `error ${r.status}`);
    onOpen(r.body.date);
  };

  return (
    <>
      <section style={{ ...card, background: "#fafafa" }}>
        <h2>New run</h2>
        <textarea value={dump} onChange={(e) => setDump(e.target.value)} placeholder="Paste this week's voice-of-customer dump…"
          rows={8} style={{ width: "100%", boxSizing: "border-box" }} />
        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <label>max hooks <input value={maxHooks} onChange={(e) => setMaxHooks(e.target.value)} type="number" min={1} style={{ width: 70 }} /></label>
          <button onClick={start} disabled={busy || !dump.trim()}>{busy ? "starting…" : "Start"}</button>
          {err && <span style={{ color: "crimson" }}>{err}</span>}
        </div>
      </section>

      <h2>History</h2>
      {runs.length === 0 ? <p>No runs yet.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ textAlign: "left" }}><th>date</th><th>status</th><th>hooks</th><th>specs</th><th>approved</th><th>bounced</th></tr></thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.date} style={{ cursor: "pointer", borderTop: "1px solid #eee" }} onClick={() => onOpen(r.date)}>
                <td style={mono}>{r.date}</td><td>{r.status}</td><td>{r.hooks}</td><td>{r.specs}</td><td>{r.approved}</td><td>{r.bounced}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function RunView({ date, onBack }: { date: string; onBack: () => void }) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const r = await jsonFetch(`/api/video-engine/state?date=${date}`);
    setSnap(r.body as Snapshot);
  }, [date]);

  useEffect(() => { load(); }, [load]);
  // poll while a child is actively running
  useEffect(() => {
    if (!snap?.run || !ACTIVE.has(snap.run.status)) return;
    const t = setInterval(load, 1000);
    return () => clearInterval(t);
  }, [snap?.run?.status, load]);

  const post = async (path: string, body: unknown) => {
    const r = await jsonFetch(`/api/video-engine/${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    setMsg(r.ok ? "" : r.body.error ?? r.body.message ?? `error ${r.status}`);
    await load();
    return r;
  };

  const run = snap?.run;
  return (
    <>
      <button onClick={onBack}>← history</button>
      <h2 style={mono}>{date} — {run?.status ?? "…"}</h2>
      {run && ACTIVE.has(run.status) && <p>{run.progress.stage}… {run.progress.done}/{run.progress.total}</p>}
      {run?.status === "FAILED" && <p style={{ color: "crimson" }}>Failed: {run.error}</p>}
      {msg && <p style={{ color: "crimson" }}>{msg}</p>}

      {run?.status === "AWAITING_G0" && snap && (
        <G0 hooks={snap.hooks} selected={selected} toggle={(id) => {
          const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n);
        }} onBuild={() => post("specs", { date, selectedHookIds: [...selected] })} />
      )}

      {run && ["SPECS", "AWAITING_G1", "PRODUCING", "DONE"].includes(run.status) && snap && (
        <>
          <G1 snap={snap} onDecide={(specId, verdict) => post("approve", { date, specId, verdict, gate: "g1" })}
            onRetry={(hookId) => post("specs", { date, selectedHookIds: [hookId] })}
            onRender={(specIds) => post("render", { date, specIds })}
            onCommit={async () => { const r = await post("commit", { date }); if (r.ok) setMsg(r.body.message); }} />
          <G2 snap={snap} date={date}
            onDecide={(specId, verdict) => post("approve", { date, specId, verdict, gate: "g2" })}
            onRetry={(specId) => post("render", { date, specIds: [specId] })} />
        </>
      )}
    </>
  );
}

function G0({ hooks, selected, toggle, onBuild }: { hooks: Hook[]; selected: Set<string>; toggle: (id: string) => void; onBuild: () => void }) {
  return (
    <>
      <h3>G0 — pick the hooks worth building ({selected.size} selected)</h3>
      {hooks.map((h) => (
        <label key={h.id} style={{ ...card, display: "block", cursor: "pointer" }}>
          <input type="checkbox" checked={selected.has(h.id)} onChange={() => toggle(h.id)} />{" "}
          <strong>{h.spoken_text}</strong>
          <div style={{ color: "#555", fontSize: 13 }}>visual: “{h.visual_text}” · {h.framework_tag} · {h.pillar}</div>
        </label>
      ))}
      <button onClick={onBuild} disabled={selected.size === 0}>Build selected →</button>
    </>
  );
}

function G1({ snap, onDecide, onRetry, onRender, onCommit }: {
  snap: Snapshot;
  onDecide: (specId: string, verdict: "approve" | "reject") => void;
  onRetry: (hookId: string) => void;
  onRender: (specIds: string[]) => void;
  onCommit: () => void;
}) {
  const reportBy = new Map(snap.reports.map((r) => [r.spec_id, r]));
  // G1 only — a later G2 (asset) decision on the same specId must not clobber the script verdict here.
  const decisionBy = new Map(snap.decisions.filter((d) => d.gate === "g1").map((d) => [d.specId, d.verdict]));
  const errored = Object.entries(snap.run?.specs ?? {}).filter(([, s]) => s.status === "ERROR");
  const reviewable = snap.specs.filter((s) => reportBy.get(s.id)?.verdict !== "hard_fail");
  const bounced = snap.specs.filter((s) => reportBy.get(s.id)?.verdict === "hard_fail");

  // Render-eligible = G1-approved specs not already rendered (READY) or rendering.
  const render = snap.run?.render ?? {};
  const renderable = reviewable
    .filter((s) => decisionBy.get(s.id) === "approve")
    .filter((s) => !["READY", "RENDERING"].includes(render[s.id]?.status ?? ""))
    .map((s) => s.id);

  return (
    <>
      <h3>G1 — approve scripts ({reviewable.length})</h3>
      {renderable.length > 0 && (
        <button onClick={() => onRender(renderable)} style={{ marginBottom: 10 }}>
          Render approved ({renderable.length}) →
        </button>
      )}
      {reviewable.map((s) => {
        const r = reportBy.get(s.id);
        const decided = decisionBy.get(s.id);
        return (
          <div key={s.id} style={card}>
            <div style={mono}>{s.id} — {s.format} — {s.duration_s}s</div>
            <div><strong>{s.spoken_hook}</strong> · visual “{s.visual_hook}”</div>
            <div style={{ color: "#555", fontSize: 13 }}>{s.caption_text}</div>
            {r?.items.map((it, i) => (
              <div key={i} style={{ color: it.severity === "hard_fail" ? "crimson" : "#b26a00", fontSize: 13 }}>
                {it.severity === "hard_fail" ? "❌" : "⚠️"} {it.rule} — “{it.span}”{it.suggestion ? ` → ${it.suggestion}` : ""}
              </div>
            ))}
            <div style={{ marginTop: 6 }}>
              <button onClick={() => onDecide(s.id, "approve")} disabled={decided === "approve"}>Approve</button>{" "}
              <button onClick={() => onDecide(s.id, "reject")} disabled={decided === "reject"}>Reject</button>
              {decided && <span style={{ marginLeft: 8 }}>→ {decided}</span>}
            </div>
          </div>
        );
      })}

      {errored.length > 0 && (
        <>
          <h3>Errors ({errored.length})</h3>
          {errored.map(([hookId, s]) => (
            <div key={hookId} style={{ ...card, borderColor: "crimson" }}>
              <div style={mono}>{hookId}</div>
              <div style={{ color: "crimson", fontSize: 13 }}>{s.error}</div>
              <button onClick={() => onRetry(hookId)}>Retry</button>
            </div>
          ))}
        </>
      )}

      {bounced.length > 0 && (
        <>
          <h3>Bounced — hard-fail, fix upstream &amp; re-run ({bounced.length})</h3>
          {bounced.map((s) => (
            <div key={s.id} style={{ ...card, background: "#fff5f5" }}>
              <div style={mono}>{s.id}</div>
              <div>{s.spoken_hook}</div>
              {reportBy.get(s.id)?.items.filter((i) => i.severity === "hard_fail").map((it, i) => (
                <div key={i} style={{ color: "crimson", fontSize: 13 }}>❌ {it.rule} — “{it.span}”</div>
              ))}
            </div>
          ))}
        </>
      )}

      <button onClick={onCommit} style={{ marginTop: 12 }}>Commit review (audit trail)</button>
    </>
  );
}

// G2 — the rendered-asset review gate. Not a separate global status: it lists every spec that has
// a render entry (READY → player + approve/download; ERROR → retry; else in-progress).
function G2({ snap, date, onDecide, onRetry }: {
  snap: Snapshot;
  date: string;
  onDecide: (specId: string, verdict: "approve" | "reject") => void;
  onRetry: (specId: string) => void;
}) {
  const render = snap.run?.render ?? {};
  const entries = Object.entries(render);
  const g2By = new Map(snap.decisions.filter((d) => d.gate === "g2").map((d) => [d.specId, d.verdict]));
  const specById = new Map(snap.specs.map((s) => [s.id, s]));
  const assetUrl = (specId: string) => `/api/video-engine/asset?date=${date}&specId=${encodeURIComponent(specId)}`;

  if (entries.length === 0) {
    return <><h3 style={{ marginTop: 20 }}>G2 — rendered videos</h3><p style={{ color: "#555" }}>No renders yet — approve a script above, then “Render approved”.</p></>;
  }

  return (
    <>
      <h3 style={{ marginTop: 20 }}>G2 — rendered videos ({entries.length})</h3>
      {entries.map(([specId, r]) => {
        const spec = specById.get(specId);
        const decided = g2By.get(specId);
        return (
          <div key={specId} style={{ ...card, borderColor: r.status === "ERROR" ? "crimson" : "#ccc" }}>
            <div style={mono}>{specId} — {r.status.toLowerCase()}</div>
            {r.status === "READY" && (
              <>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption -- disclosure is baked on-screen + in caption */}
                <video controls src={assetUrl(specId)} style={{ width: 240, maxWidth: "100%", display: "block", margin: "8px 0", background: "#000" }} />
                {spec && <pre style={{ ...mono, whiteSpace: "pre-wrap", fontSize: 12, color: "#333" }}>{spec.caption_text}</pre>}
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => onDecide(specId, "approve")} disabled={decided === "approve"}>Approve (G2)</button>{" "}
                  <button onClick={() => onDecide(specId, "reject")} disabled={decided === "reject"}>Reject</button>{" "}
                  <a href={assetUrl(specId)} download={`${specId}.mp4`}><button type="button">Download .mp4</button></a>{" "}
                  <button onClick={() => onRetry(specId)}>Re-render</button>
                  {decided && <span style={{ marginLeft: 8 }}>→ {decided}</span>}
                </div>
              </>
            )}
            {r.status === "ERROR" && (
              <>
                <div style={{ color: "crimson", fontSize: 13 }}>{r.error}</div>
                <button onClick={() => onRetry(specId)}>Retry render</button>
              </>
            )}
            {(r.status === "RENDERING" || r.status === "PENDING") && <div style={{ color: "#555" }}>rendering…</div>}
          </div>
        );
      })}
    </>
  );
}
