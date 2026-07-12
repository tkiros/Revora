# Data and processor map

| Data / function | Collection and use | Storage / protection | Recipient | Retention / deletion | Open fact |
| --- | --- | --- | --- | --- | --- |
| Guest meal + A1C | Generate one meal response | No server history; browser-local settings/history may remain | Vercel, OpenAI (`store:false`) | Request lifetime subject to provider abuse records; browser until cleared | Provider contract/transfer terms |
| Account email | Authentication and service communication | User/auth records | Auth.js, database, Resend | Login record can remain after health-data erasure; full deletion separate | Real sender/domain and retention |
| Saved A1C + meal text | Checks, encrypted history, progress | AES-256-GCM in Railway-hosted Postgres | App/database; submitted checks also OpenAI | `DELETE /api/account/health-data` erases saved health scope | Key management/backup deletion proof |
| Result category/timestamps/actions | History, behavior-only progress | Database, owner-scoped routes | App/database | Erased with health-data flow | Exact backup/telemetry retention |
| Meal photo-assist | Not collected in candidate | Function gated off | None in proposed candidate | Route `404`; no model call | Conditions for any future enablement |
| Pantry photos | Build separately purchased report | Long random unlisted blob URL; details encrypted | Vercel Blob, OpenAI, app/database | workflow deletion, cancel/refund/manual-review cleanup, seven-day ceiling, account deletion | Owner scope decision and storage contract |
| Payments | Subscription/order state and assent evidence | Provider + subscription/order records | Stripe, Google Play, database | Financial/provider retention may outlive health erasure | Merchant/tax/accounting policy |
| Reminder endpoint | Optional push delivery | Push subscription/setting | Browser push services, app/database | Removed on withdrawal/health erasure/account deletion as applicable | Push provider/data-transfer details |
| Errors/analytics | Reliability and coarse product use | Scrubbed/coarse records | Sentry, Umami | Not specified in candidate facts | Real retention and workspace settings |
| Support messages | Resolve account, refund, privacy, incident issues | Support inbox/tool | Named support operator | Not specified | Inbox, access, retention, owner |

## Controller and jurisdiction gaps

The legal controller/entity, registered/contact address, launch markets,
governing law/venue, processor agreements, international-transfer mechanism,
state consumer-health-data analysis, incident owners, and binding retention
schedule are not known. They must be supplied in `owner-input-required.md` and
verified against live provider and operator facts before this map is treated as
complete. No professional legal verification has been obtained.
