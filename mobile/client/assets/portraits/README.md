# Runtime portrait assets

All assets are local to the client and included in its exports.

- `leo.png`: built-in image generation, using the approved mobile preview; natural adult likeness, wavy dark hair, warm smile, rose-pink jacket over a cream T-shirt, hand-against-cheek pose and golden backdrop. Prompt requested only a standalone portrait, without UI or text.
- `harvey.png`: built-in image generation, using the user's original mobile chat reference; original comic likeness, swept-back dark hair, glasses, neatly trimmed beard, cream shirt/navy jacket and golden backdrop. Prompt requested only a standalone portrait, without UI or text.
- Other portraits: unchanged existing web assets; Nora uses email-nora-v3.png. Original sources remain in `frontend/public/art/sunshine`; the client bundles its own runtime copies.

Generated source files were copied into this directory without altering or deleting originals. These exports support the first implementation slice; compare them with the approved reference before final visual sign-off. The overall generation prompts above record the intended identity/style constraints. No UI text is embedded in these portraits.
