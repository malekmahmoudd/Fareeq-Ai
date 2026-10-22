# Data Safety worksheet — verify before submitting

This is an inventory, not a completed Google Play attestation.

| Data | Purpose | Notes |
| --- | --- | --- |
| Optional name and email | Account access | Guests do not provide these. |
| Chat messages, selected files and extracted document text | AI responses and workspace features | Sent to the backend; relevant content goes to the configured AI provider. |
| Memories, goals, plans and saved replies | Workspace features | Stored on the shared backend. |
| Session/account identifiers and usage records | Authentication, limits and security | Native session token uses protected device storage. |
| IP/security request information | Abuse prevention | Verify hosting logs and retention before declaring. |
| Reply report category and timestamp | Safety review | Stored on the message; erases with its conversation/account. |

No advertising or analytics SDK is bundled in the mobile client. No camera, microphone, location or contacts permission is requested by app features. The system picker accesses selected files.

Transport uses HTTPS. Do not claim every provider’s at-rest encryption without checking its documentation. Check actual DockHosting/Neon backup retention and the configured AI provider’s retention and processing terms. Determine Play’s service-provider sharing exemption from those terms; do not automatically select “no sharing.”

Deletion removes live workspace data; already-created backups follow provider retention. The owner confirmed fareeqai.support@gmail.com as the public support address on 21 October 2026; it is now included in the privacy source. Document actual retention and verify the live privacy notice before submission. Complete each Play Console category based on verified release behavior.

## Public provider documentation checked on 22 October 2026

- [Groq data handling](https://console.groq.com/docs/your-data): inference content is not retained by default, with exceptions including reliability/abuse monitoring and stateful features. Monitoring content can remain for up to 30 days, or longer where legally required. Zero Data Retention is an account option, not something verified as enabled for FareeqAI. Usage metadata is retained. Do not promise that no prompts or replies can ever be retained.
- [Neon restore history](https://neon.com/docs/postgres/backup-restore/history-window): the documented Free-plan restore-history maximum is six hours, subject to the change-history cap. This does not verify FareeqAI's current project settings or any separate exports, snapshots or backup jobs. Do not describe it as the complete deletion deadline for all copies.
- [DockHosting privacy policy](https://www.dockhosting.dev/privacy), updated 7 October: hosted content is processed to operate the service. Project/database/account deletion is described as taking up to 30 days, subject to legal exceptions. Operational/security logs roll over without a fixed public retention period. This does not establish a per-user record deletion deadline inside FareeqAI or confirm runtime logging settings.

Account-specific retention, processing scope and backup settings still need verification. The public documentation alone does not justify certifying zero retention or selecting Play's service-provider sharing exemption.

## Additional code-level inventory checked on 22 October

- `src/components/Documents.tsx` in the mobile client explicitly accepts PNG, JPEG and WebP through the system picker, as well as documents/text. Review **Photos** as optional collection alongside **Files and docs**; absence of camera/media-library permission does not mean selected images stay on-device.
- The backend agent context includes the user's display name and populated profile fields (`app/agents/context.py`, `_about_user`). Relevant context goes to the AI provider. Do not declare that names are never transmitted to the provider merely because the account field is optional.
- Maddie's prompt intentionally uses exercise history, goals and user-provided injury/health limitations; Emma's prompt intentionally uses user-provided income/debt/savings context. Review **Fitness info**, **Health info** and **Other financial info** as optional data types instead of treating all intentional coaching data solely as generic chat text.
- Account sessions store user ID, a session identifier, user-agent text and a truncated IP/network prefix (`app/core/sessions.py`). Review **User IDs**, **Device or other IDs**, and security purposes. The app does not request GPS or perform IP geolocation in this code; do not claim device-location collection solely from the presence of a request IP.

These checks refine the worksheet; they are not a completed or submitted Play attestation.

## Reviewed declaration answers — 22 October

The memory extractor intentionally retains user-provided city/location, age, studies and job context (`app/memory/llm_extraction.py`). Include **Approximate location** and **Other personal info** as optional collection for app functionality/personalization. This is user-entered context, without GPS access or IP geolocation.

The reviewed inventory has 15 types: Name, Email address, User IDs, Other personal info, Approximate location, Other financial info, Health info, Fitness info, Emails, Other in-app messages, Photos, Files and docs, App interactions, Other user-generated content, and Device or other IDs. User IDs, session/device IDs, chat messages and usage interactions are required for the corresponding core functions; other listed types are optional. Stored workspace data is not processed ephemerally.

### Service-provider transfer classification

Google's [Data Safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469) excludes processors acting on the developer's behalf from its definition of sharing. Groq's [current DPA](https://console.groq.com/docs/legal/customer-data-processing-addendum), sections 2.1 and 2.3, defines processor roles and limits processing to the service/customer instructions. Based on those terms and the configured GroqCloud integration, the prepared answers classify these processor transfers as **collected, not shared under Play's definition**. Cloud hosting/database providers operate the developer's service; there is no independent advertising recipient. This classification does not mean data stays on the device or never reaches Groq. The privacy notice continues to disclose AI processing. Zero Data Retention is not claimed.

Prepared machine-readable answers: `data-safety-answers-2026-10-22.json`. The CSV `data-safety-import-2026-10-22.csv` follows Google's published sample schema and has selection/optionality/purpose consistency checks. It is an offline preparation artifact, not evidence that Console imported or submitted it; current account-creation and deletion questions also need verification in Console. The account supports email/password and optional password-plus-authenticator/recovery-code login, not passwordless username/other-authentication login. Partial data deletion instructions are in the public privacy notice at https://fareeqai.pages.dev/privacy.


### Console verification after owner import

The owner confirmed import success. A later automation still saw “Not started” handling sections and did not reach Preview/final save. The import is not evidence of a submitted declaration. Its reported account methods included the incorrect passwordless “Username and other authentication”; clear that option and retain the two password-based methods. Verify Other personal info is selected alongside the other 14 types. See the dated Console handoff for remaining corrections.


### Direct Console verification — completed later on 22 October

Direct browser control revealed the old CSV failed validation: `Response missing for PSL_SUPPORTED_ACCOUNT_CREATION_METHODS`. Its earlier reported import success was not proof that the questionnaire had applied. Supplemented the old Google sample with the current account/deletion schema from the upstream Fastlane plugin source, then verified Google accepted the updated 783-row CSV. The Console explicitly showed **Answers imported from CSV**, all 15 handling sections **Completed**, and the full Preview matched the JSON purposes/optionality, zero sharing, HTTPS transfer and both deletion links. Password and password-plus-other-authentication methods were selected; passwordless was not. Final Save returned **Change saved. Send for review in Publishing overview.** No app review request was sent. This supersedes the preceding incomplete-state notes, which remain as history.
