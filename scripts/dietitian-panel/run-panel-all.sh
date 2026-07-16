#!/usr/bin/env bash
# Run the SIMULATED — NON-CREDENTIALED panel one stratum at a time (DR-08:
# a crash loses one stratum, not the run). Already-written strata are skipped,
# so re-running after an outage resumes where it stopped; finish with
# rejudge-errors.mjs to patch individual errored verdicts inside written files.
# Usage: OPENROUTER_API_KEY=... bash scripts/dietitian-panel/run-panel-all.sh <capture.json>
set -euo pipefail
CAP="$1"
# Date comes from the capture filename, not the clock — resuming on a later
# day must still find (and skip) the strata already bought and written.
DATE=$(basename "$CAP" | grep -oP '\d{4}-\d{2}-\d{2}')
for S in ordinary_typed_meal incomplete_ambiguous nutrition_label cultural_mixed clinical_adversarial gate_readjudication; do
  OUT="artifacts/qa/panel-240-simulated-$DATE-$S.json"
  if [ -s "$OUT" ]; then echo "=== stratum: $S already done, skipping"; continue; fi
  echo "=== stratum: $S -> $OUT"
  node "$(dirname "$0")/run-panel.mjs" "$CAP" "$OUT" "$S"
done
echo "ALL STRATA DONE"
