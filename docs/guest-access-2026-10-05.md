# Optional sign-in for the public technical showcase

Opening the home page bootstraps a separate signed guest session. Visitors can use the agents and workspaces without an email, password, or onboarding form. Account creation promotes the current guest identity, preserving its conversations, goals, and documents; credential locking and session generation changes invalidate the earlier guest cookie. Signing into an existing account switches identities rather than merging someone else's work.

AUTH_REQUIRED remains true. GUEST_ENABLED and SIGNUP_ENABLED are explicit production switches. Guests use the existing HttpOnly, Secure, SameSite cookie, origin checks, account ownership filters, and account quotas. A browser cannot choose another guest's identity with a header. Concurrent initial requests share one frontend bootstrap. If guest access is temporarily unavailable the page displays an error and retry, without redirecting visitors to login.

Guest creation is capped at ten per address per hour and 200 across the deployment per UTC day. The public deployment's shared AI budget defaults to 100,000 tokens/day and includes registered accounts, preventing fresh sessions or signup from resetting the total. Estimates reserve usage before provider calls; unused or failed-before-output reservations are refunded. These caps constrain free-tier usage, rather than promising unlimited service.

Guests start with automatic memory extraction disabled. Server persistence remains necessary for conversations/documents and is stated in the privacy notice and guest Account screen. Guests can erase their workspace from Account. The deployed seven-day cookie expiry is not a deletion schedule; expired guest workspace cleanup remains a follow-up. No schema migration or new hosting service is needed.

Verification: backend full suite 562 passed, 4 skipped before one additional quota regression; targeted authentication/guest/account suite 41 passed. Frontend typecheck, portable checks, production build passed; lint 0 errors and 21 warnings. Final deployment verification will be recorded after the production switches are enabled.
