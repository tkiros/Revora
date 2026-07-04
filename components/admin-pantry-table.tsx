"use client";

import { useState } from "react";

type Row = {
  id: string;
  email: string;
  status: string;
  updatedAt: string;
  createdAt: string;
};

const ACTIONS = ["resend_intake", "resend_report", "mark_manual", "rerun"] as const;

export function AdminPantryTable({ orders }: { orders: Row[] }) {
  const [note, setNote] = useState<string | null>(null);

  async function run(orderId: string, action: string) {
    setNote(`${action} on ${orderId.slice(0, 8)}…`);
    const response = await fetch("/api/admin/pantry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, action })
    });
    setNote(
      response.ok
        ? `${action} done — reload to see the new status.`
        : `${action} failed (${response.status}).`
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      {note ? <p aria-live="polite">{note}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Email</th>
            <th>Status</th>
            <th>Last change</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id.slice(0, 8)}</td>
              <td>{order.email}</td>
              <td>{order.status}</td>
              <td>{new Date(order.updatedAt).toLocaleString()}</td>
              <td>
                {ACTIONS.map((action) => (
                  <button key={action} type="button" onClick={() => void run(order.id, action)}>
                    {action.replace("_", " ")}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
