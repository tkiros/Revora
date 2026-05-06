import fs from "node:fs";
import path from "node:path";

type SafetyContractFixture = {
  forbiddenClaims: Array<{
    label: string;
    pattern: string;
    example: string;
  }>;
  forbiddenPredictions: Array<{
    label: string;
    pattern: string;
    example: string;
  }>;
  a1cRoutes: {
    requiredRouteIds: string[];
  };
  qualitativeOnly: {
    forbiddenPatterns: Array<{
      label: string;
      pattern: string;
    }>;
  };
  uncertaintyFloors: Array<{
    scenarioId: string;
    minimumClassification: string;
  }>;
};

type CopyRowId =
  | "product-home-hero"
  | "prompt-a1c-scope"
  | "prompt-safe-tone-snippet"
  | "prompt-conservative-floor-snippet"
  | "result-clarification-example"
  | "result-non-food-refusal"
  | "result-footer"
  | "below-range-route"
  | "high-range-route";

type CopyRow = {
  copyId: CopyRowId;
  copy: string;
};

export type SafetyContract = {
  fixture: SafetyContractFixture;
  copy: {
    productHomeHero: string;
    promptA1CScope: string;
    promptSafeToneSnippet: string;
    promptConservativeFloorSnippet: string;
    clarificationExample: string;
    nonFoodRefusal: string;
    disclaimer: string;
    belowRangeRoute: string;
    highRangeRoute: string;
  };
  docs: {
    claimsBoundary: string;
    tonePolicy: string;
    a1cBandRubric: string;
    copyLedger: string;
  };
  paths: {
    rootDir: string;
    fixture: string;
    copyLedger: string;
  };
};

const CONTRACT_CACHE = new Map<string, SafetyContract>();

const COPY_IDS: CopyRowId[] = [
  "product-home-hero",
  "prompt-a1c-scope",
  "prompt-safe-tone-snippet",
  "prompt-conservative-floor-snippet",
  "result-clarification-example",
  "result-non-food-refusal",
  "result-footer",
  "below-range-route",
  "high-range-route"
];

export function loadSafetyContract(options?: {
  rootDir?: string;
}): SafetyContract {
  const rootDir = options?.rootDir ?? process.cwd();
  const cached = CONTRACT_CACHE.get(rootDir);

  if (cached) {
    return cached;
  }

  const fixturePath = path.join(rootDir, "tests/fixtures/safety-contract.json");
  const copyLedgerPath = path.join(rootDir, "docs/safety/copy-ledger.md");
  const claimsBoundaryPath = path.join(rootDir, "docs/safety/claims-boundary.md");
  const tonePolicyPath = path.join(
    rootDir,
    "docs/safety/tone-uncertainty-policy.md"
  );
  const a1cBandRubricPath = path.join(
    rootDir,
    "docs/safety/a1c-band-rubric.md"
  );

  const fixture = readRequiredJson<SafetyContractFixture>(
    fixturePath,
    "tests/fixtures/safety-contract.json"
  );
  assertFixtureShape(fixture);

  const copyLedger = readRequiredText(copyLedgerPath, "docs/safety/copy-ledger.md");
  const claimsBoundary = readRequiredText(
    claimsBoundaryPath,
    "docs/safety/claims-boundary.md"
  );
  const tonePolicy = readRequiredText(
    tonePolicyPath,
    "docs/safety/tone-uncertainty-policy.md"
  );
  const a1cBandRubric = readRequiredText(
    a1cBandRubricPath,
    "docs/safety/a1c-band-rubric.md"
  );

  const rows = parseCopyLedger(copyLedger);
  const copyRows = Object.fromEntries(
    COPY_IDS.map((copyId) => [copyId, getApprovedCopyRow(rows, copyId)])
  ) as Record<CopyRowId, CopyRow>;

  const contract: SafetyContract = {
    fixture,
    copy: {
      productHomeHero: copyRows["product-home-hero"].copy,
      promptA1CScope: copyRows["prompt-a1c-scope"].copy,
      promptSafeToneSnippet: copyRows["prompt-safe-tone-snippet"].copy,
      promptConservativeFloorSnippet:
        copyRows["prompt-conservative-floor-snippet"].copy,
      clarificationExample: copyRows["result-clarification-example"].copy,
      nonFoodRefusal: copyRows["result-non-food-refusal"].copy,
      disclaimer: copyRows["result-footer"].copy,
      belowRangeRoute: copyRows["below-range-route"].copy,
      highRangeRoute: copyRows["high-range-route"].copy
    },
    docs: {
      claimsBoundary,
      tonePolicy,
      a1cBandRubric,
      copyLedger
    },
    paths: {
      rootDir,
      fixture: fixturePath,
      copyLedger: copyLedgerPath
    }
  };

  CONTRACT_CACHE.set(rootDir, contract);
  return contract;
}

function readRequiredText(absolutePath: string, relativePath: string): string {
  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Phase 1 dependency missing: expected ${relativePath} to exist.`
    );
  }

  const contents = fs.readFileSync(absolutePath, "utf8").trim();
  if (contents.length === 0) {
    throw new Error(
      `Phase 1 dependency missing: expected ${relativePath} to contain data.`
    );
  }

  return contents;
}

function readRequiredJson<T>(absolutePath: string, relativePath: string): T {
  const contents = readRequiredText(absolutePath, relativePath);

  try {
    return JSON.parse(contents) as T;
  } catch (error) {
    throw new Error(
      `Phase 1 dependency invalid: could not parse ${relativePath} as JSON.`,
      { cause: error }
    );
  }
}

function assertFixtureShape(
  fixture: Partial<SafetyContractFixture>
): asserts fixture is SafetyContractFixture {
  const requiredKeys = [
    "forbiddenClaims",
    "forbiddenPredictions",
    "a1cRoutes",
    "qualitativeOnly",
    "uncertaintyFloors"
  ] as const;

  for (const key of requiredKeys) {
    if (!(key in fixture)) {
      throw new Error(
        `Phase 1 dependency invalid: tests/fixtures/safety-contract.json is missing "${key}".`
      );
    }
  }
}

function parseCopyLedger(copyLedger: string): Array<Record<string, string>> {
  const lines = copyLedger.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) =>
    line.trim().startsWith("| Copy ID |")
  );

  if (headerIndex === -1) {
    throw new Error(
      "Phase 1 dependency invalid: docs/safety/copy-ledger.md is missing the Copy ID table."
    );
  }

  const tableLines = lines
    .slice(headerIndex)
    .filter((line) => line.trim().startsWith("|"));

  const headers = splitMarkdownRow(tableLines[0]);
  const dataLines = tableLines.slice(2);

  return dataLines.map((line) => {
    const values = splitMarkdownRow(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""])
    );
  });
}

function splitMarkdownRow(row: string): string[] {
  return row
    .split("|")
    .slice(1, -1)
    .map((value) => value.trim());
}

function getApprovedCopyRow(
  rows: Array<Record<string, string>>,
  copyId: CopyRowId
): CopyRow {
  const row = rows.find((entry) => stripBackticks(entry["Copy ID"]) === copyId);

  if (!row) {
    throw new Error(
      `Phase 1 dependency invalid: docs/safety/copy-ledger.md is missing row "${copyId}".`
    );
  }

  if (stripBackticks(row.Status).toLowerCase() !== "approved") {
    throw new Error(
      `Phase 1 dependency invalid: copy ledger row "${copyId}" is not approved.`
    );
  }

  if (stripBackticks(row.Active).toLowerCase() !== "yes") {
    throw new Error(
      `Phase 1 dependency invalid: copy ledger row "${copyId}" is not active.`
    );
  }

  const copy = stripBackticks(row.Copy);
  if (copy.length === 0) {
    throw new Error(
      `Phase 1 dependency invalid: copy ledger row "${copyId}" has empty copy text.`
    );
  }

  return {
    copyId,
    copy
  };
}

function stripBackticks(value: string | undefined): string {
  return (value ?? "").replace(/`/g, "").trim();
}
