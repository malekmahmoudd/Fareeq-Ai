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
