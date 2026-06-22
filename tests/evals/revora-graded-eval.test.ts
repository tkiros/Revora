/**
 * Live graded quality gate (Plan launch-hardening Phase 3, blocker B3).
 *
 * Runs every fixture case through checkFood and scores the output with the pure
 * rubric (lib/revora/eval-rubric.ts). With REVORA_LIVE_EVAL=1 the calls hit the
 * REAL model (run via `npm run eval:revora:live` — it costs money); otherwise it
 * runs against the synthetic mock outputs so the scoring pipeline stays covered
 * under `npm test`.
 *
 * Hard gates (fail the build): zero harmful-SAFE, zero usefulness failures, zero
 * adversarial failures. Risk accuracy is enforced only once domain authors the
 * acceptableRisks labels (Task 3.1) — until then it is reported, not gated.
 */

import { describe, expect, it } from "vitest";

import {
  DEFAULT_THRESHOLDS,
  scoreRun,
  type GradedRun
} from "../../lib/revora/eval-rubric";
import { checkFood } from "../../lib/revora/service";
import { createEvalModelClient, loadEvalCases } from "../support/revora-test-model";

describe("revora graded quality gate", () => {
  it("holds harmful-SAFE=0, usefulness, adversarial, and (when labeled) accuracy", async () => {
    const cases = loadEvalCases();
    const model = createEvalModelClient(cases);
    const runs: GradedRun[] = [];

    for (const evalCase of cases) {
      const response = await checkFood(evalCase.input, { model });
      runs.push({
        evalCase: {
          id: evalCase.id,
          category: evalCase.category,
          harmfulIfSafe: evalCase.harmfulIfSafe,
          acceptableRisks: evalCase.acceptableRisks
        },
        response
      });
    }

    const report = scoreRun(runs, DEFAULT_THRESHOLDS);

    // PII-free summary — surfaces in the live runner output and CI logs.
    console.info(
      JSON.stringify({
        graded_eval_summary: {
          total: report.total,
          harmfulSafe: report.harmfulSafe.length,
          labeledCount: report.labeledCount,
          riskCorrect: report.riskCorrect,
          riskAccuracy: report.riskAccuracy,
          usefulnessFailures: report.usefulnessFailures.length,
          adversarialFailures: report.adversarialFailures.length,
          accuracyGate:
            report.labeledCount === 0
              ? "inactive — no domain labels yet (Task 3.1)"
              : `target ${DEFAULT_THRESHOLDS.riskAccuracyTarget}`,
          passed: report.passed
        }
      })
    );

    expect(
      report.harmfulSafe,
      `harmful-SAFE results: ${report.harmfulSafe.join(", ")}`
    ).toEqual([]);
    expect(
      report.usefulnessFailures,
      `usefulness failures: ${report.usefulnessFailures.join(", ")}`
    ).toEqual([]);
    expect(
      report.adversarialFailures,
      `adversarial failures: ${report.adversarialFailures.join(", ")}`
    ).toEqual([]);

    if (report.riskAccuracy !== null) {
      expect(report.riskAccuracy).toBeGreaterThanOrEqual(
        DEFAULT_THRESHOLDS.riskAccuracyTarget
      );
    }

    expect(report.passed).toBe(true);
  }, 180_000);
});
