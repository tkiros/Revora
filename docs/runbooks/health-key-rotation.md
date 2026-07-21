# Runbook: rotating the health-data encryption key

**Owner:** operator with Vercel env access · **Last verified against:** `lib/server/crypto.ts` (2026-07-21) · **Audit ref:** PR-2

Every `*_ciphertext` column (exact A1C, food text, meal-memory text) is AES-256-GCM encrypted. Three env vars control the keyring:

| Var | Meaning |
|---|---|
| `HEALTH_DATA_KEY` | The **primary** key (base64, exactly 32 bytes). Encrypts all NEW payloads. Required — the app refuses to start without it. |
| `HEALTH_DATA_KEY_VERSION` | Integer stamped into new payloads (`v<n>:` prefix). Default `1`. |
| `HEALTH_DATA_KEYS_OLD` | Retired **decrypt-only** keys, comma-separated `version:base64key` pairs, e.g. `1:AAAA…,2:BBBB…`. |

## THE INVARIANT — read this before touching anything

> **Never drop a key while any row encrypted under it still exists.**

Decryption fails **quietly by design** (`safeDecrypt` renders "(unreadable entry)" instead of crashing the page). If you remove a key that live rows still need, users' history/A1C silently become permanently unreadable — no error, no alert, no undo. This is exactly the incident this runbook exists to prevent.

Legacy payloads with no `v<n>:` prefix are decrypted by trying **every** key in the keyring (GCM authenticates, so a wrong key fails rather than returning garbage). They stay readable across rotations as long as the key that wrote them remains in the keyring.

## Rotation procedure (vN → vN+1)

1. Generate a new 32-byte key: `head -c 32 /dev/urandom | base64`.
2. In Vercel env (production AND preview):
   - Append the **current** primary to `HEALTH_DATA_KEYS_OLD` as `N:<current-HEALTH_DATA_KEY>`.
   - Set `HEALTH_DATA_KEY` to the new key.
   - Set `HEALTH_DATA_KEY_VERSION` to `N+1`.
3. Redeploy. New writes now carry `v<N+1>:`; old rows keep decrypting via the keyring.
4. **Verify before declaring done:** sign in with a seeded account that has pre-rotation history and confirm the history page shows real text, not "(unreadable entry)".
5. Never delete an entry from `HEALTH_DATA_KEYS_OLD` unless a DB query proves zero rows remain at that version (or the retention window for all such rows has passed and they are deleted).

## What NOT to do

- Do **not** "rotate" by just replacing `HEALTH_DATA_KEY`. That orphans every existing row.
- Do **not** reuse a version number.
- Do **not** set `HEALTH_DATA_KEYS_OLD` in only one environment — preview reads the same format.

## If a rotation went wrong

Symptoms: users report history entries showing "(unreadable entry)"; Sentry shows `unknown_key` decrypt reports.
Recovery: re-add the dropped key to `HEALTH_DATA_KEYS_OLD` under its original version and redeploy. Nothing is lost until the old key value itself is lost — **store retired keys in the same secret manager as live ones.**
