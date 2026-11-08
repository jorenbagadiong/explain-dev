# ED-019 implementation

## Git baseline

- `main` at `6b629eb` (ED-018), committed at the owner's request before ED-019 began. See [baseline.md](baseline.md).
- ED-019 is **not committed, pushed, merged or deployed**.
- ED-015 files and the generated `next-env.d.ts` remain uncommitted and untouched. All 102 entries of `docs/ed-017/pre-existing-work.json` match their recorded SHA-256 at the end of ED-019.
- `next build` and `next dev` rewrite `next-env.d.ts`. After every build in this milestone, the file was restored to its recorded development form and its hash re-verified.

## Exact files

Modified (tracked):

| File | Change |
| --- | --- |
| `.gitignore` | Ignore `preview-host/dist/`, `.build/`, `.vercel/` |
| `eslint.config.mjs` | Ignore the same generated output |
| `package.json` | Scripts: `dev:isolated`, `build:preview-host`, `build:preview-host:dev`, `preview-host`. No dependency changes |
| `next.config.ts` | Headers from `preview-host/policy.mjs`; validate `NEXT_PUBLIC_LAB_PREVIEW_ORIGIN`; Practice `frame-src` (dedicated origin or `'self'`) |
| `vite.lab-runtime.config.mts` | Default `__LAB_PARENT_ORIGINS__ = null` (fallback) |
| `src/lab-runtime/main.ts` | Parent-origin allowlist; hello only to allowed origins; link click guard; WebRTC constructor removal |
| `src/lib/lab/protocol.ts` | Protocol version 2; `navigation` diagnostic kind; `isIncompatibleHello` |
| `src/components/lab/preview-frame.tsx` | Configurable preview URL and mode attribute; hello/load race fix; version-skew fail-closed; flood limit (50); `securitypolicyviolation` (frame-src) ⇒ blocked navigation |
| `src/components/lab/practice-workspace.tsx` | Messages for the navigation kind, protocol violation and version mismatch |
| `src/components/lab/code-editor.tsx` | Focus the editor on press, blurring a focused preview iframe first (Firefox) |
| `src/components/lab/sandbox-config.test.ts` | Asserts the Practice `frame-src 'self'` rule (stronger) |
| `src/lib/lab/protocol.test.ts` | Version-mismatch case no longer hard-codes the current version |

Created:

- `preview-host/policy.mjs`, `preview-host/server.mjs`, `preview-host/vercel.json`
- `scripts/build-preview-host.mjs`, `scripts/preview-host-server.mjs`, `scripts/dev-isolated.mjs`
- `src/lib/lab/preview-target.ts`, `src/lib/lab/preview-host.test.ts`
- `docs/ed-019/`: the 7 required documents plus [baseline.md](baseline.md); tools, raw reports, logs and 20 matrix screenshots, plus the ED-018 suite's screenshots under `regression/`

Not changed: lesson content, curriculum registries and routes, learning modes, preferences storage, theme tokens, `globals.css`, `vercel.json` (app), README (ED-015 edits), and dependencies (no packages added).

## Defects found and fixed

1. **ED-018 never worked in Firefox** (hello/load race), confirmed on the ED-018 commit. Fixed in `preview-frame.tsx`.
2. **WebRTC STUN escaped the sandbox in Chromium.** Not covered by CSP. Fixed with runtime constructor removal; 0 packets afterwards.
3. **Self-navigation request escaped** (ED-018 residual 1). Fixed by Practice `frame-src` in both modes; 0 requests in both engines.
4. **Firefox blocked navigation was silent.** The parent now listens for `securitypolicyviolation`.
5. **Firefox editor focus** after interacting with the preview. Fixed (automation-verified).
6. Harness fixes along the way (not product defects): wait for editor focus before typing; promise-aware isolation checks; engine-specific error wording; attribution of host log records.

## Rollback plan

See [architecture.md](architecture.md#rollback):

- unset `NEXT_PUBLIC_LAB_PREVIEW_ORIGIN` (back to the hardened fallback), or
- roll back the preview-host deployment, or
- revert the ED-019 commit.
