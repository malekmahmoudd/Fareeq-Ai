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

Deletion removes live workspace data; already-created backups follow provider retention. Document actual retention, publish the support address and align privacy text before submission. Complete each Play Console category based on verified release behavior.
