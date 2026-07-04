"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      className="primary-button report-actions"
      onClick={() => window.print()}
    >
      Save as PDF
    </button>
  );
}
