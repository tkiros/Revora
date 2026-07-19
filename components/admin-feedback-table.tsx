"use client";

import { useState } from "react";

type Row = {
  id: string;
  checkId: string;
  helpful: boolean;
  reason: string | null;
  comment: string | null;
  risk: string;
  createdAt: string;
};

export function AdminFeedbackTable({ rows }: { rows: Row[] }) {
  const [note, setNote] = useState<string | null>(null);

  async function markReviewed(feedbackId: string) {
    setNote(`marking ${feedbackId.slice(0, 8)}…`);
    const response = await fetch("/api/admin/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ feedbackId, action: "mark_reviewed" })
    });
    setNote(
      response.ok
        ? "marked reviewed — reload to refresh the queue."
        : `failed (${response.status}).`
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      {note ? <p aria-live="polite">{note}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Check</th>
            <th>Verdict</th>
            <th>Helpful</th>
            <th>Reason</th>
            <th>Comment</th>
            <th>Received</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.checkId.slice(0, 8)}</td>
              <td>{row.risk}</td>
              <td>{row.helpful ? "yes" : "no"}</td>
              <td>{row.reason ?? "—"}</td>
              <td>{row.comment ?? "—"}</td>
              <td>{new Date(row.createdAt).toLocaleString()}</td>
              <td>
                <button type="button" onClick={() => void markReviewed(row.id)}>
                  mark reviewed
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
