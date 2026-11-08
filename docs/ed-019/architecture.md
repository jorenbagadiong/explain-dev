# ED-019 preview-host architecture

Status: **implemented and verified locally** (cross-site `localhost` ↔ `127.0.0.1`) in Chromium 156 and Firefox 157. **Not deployed.** The production preview host and its origin are undecided (owner decision, 2026-11-08). WebKit is blocked by missing system libraries (see [cross-browser.md](cross-browser.md)).

Owner decisions at the deployment gate (2026-11-08):

1. Implement and verify locally; the owner handles deployment.
2. Production host: decide later, so the preview origin is configurable.
3. Keep the same-origin preview as a **fallback** when no host is configured.
4. Download Playwright's Firefox and WebKit builds.

## Before and after

```
ED-018                                         ED-019
──────                                         ──────
app origin                                     app origin                               preview host (separate site)
 ├─ /practice/... ──iframe──┐                   ├─ /practice/...                          ├─ /preview.html        no-cache
 │   (no frame-src)         │                   │    CSP: frame-src <preview origin>  ──► ├─ /preview.css         no-cache
 └─ /lab-runtime/preview.html  ◄─┘              │    iframe sandbox="allow-scripts"       ├─ /runtime.<hash>.js   immutable
    /lab-runtime/runtime.js                     │                                         └─ anything else: 404, no redirects
    parent origin = own origin                  └─ /lab-runtime/*  (fallback only, when NEXT_PUBLIC_LAB_PREVIEW_ORIGIN is unset;
                                                    Practice then sends frame-src 'self')
```

The preview document keeps an **opaque origin** on every host: `sandbox="allow-scripts"` (never `allow-same-origin`) plus the CSP `sandbox allow-scripts` header. Without it, learner code would run as the preview host. It could then register a persistent service worker there, use that origin's storage across sessions and challenges, and fetch same-origin resources. The separate site adds process isolation where the browser isolates by site, and a second boundary if the sandbox were ever misconfigured. **A separate site is not proof of process isolation.** Each engine was measured; see [security.md](security.md).

## Components

| Piece | File | Role |
| --- | --- | --- |
| Policy (single source of truth) | `preview-host/policy.mjs` | Origin validation, preview CSP, Permissions-Policy, cache headers, preview.html rewriting. Used by `next.config.ts`, the host build, the local host server and tests. |
| Host build | `scripts/build-preview-host.mjs` → `preview-host/dist/` | Vite build of `src/lab-runtime/` with the exact `LAB_PARENT_ORIGINS` allowlist compiled in. Content-hashed runtime. On Vercel (`VERCEL=1`) it also writes `preview-host/.vercel/output` (Build Output API v3) with the same headers as routes. |
| Local host server | `preview-host/server.mjs`, `scripts/preview-host-server.mjs` | Serves only the built files on `http://127.0.0.1:4100`, with the policy headers. 404 for everything else; GET and HEAD only; no redirects; optional request log. |
| Host project config | `preview-host/vercel.json` | Settings for a second Vercel project with Root Directory `preview-host`. |
| App-side selection | `src/lib/lab/preview-target.ts`, `next.config.ts` | `NEXT_PUBLIC_LAB_PREVIEW_ORIGIN` → dedicated mode; unset → same-origin fallback. Validated at build time; an invalid value fails the build. |
| Practice CSP | `next.config.ts` | `frame-src <preview origin>` (dedicated) or `frame-src 'self'` (fallback) on `/practice/:path*`. Also refuses navigations the preview starts to any other origin (see security.md). |
| Runtime parent binding | `src/lab-runtime/main.ts` | `__LAB_PARENT_ORIGINS__` allowlist (null = own origin in the fallback). Hello posted only to allowed origins; init accepted only from `window.parent` with an allowed origin. |
| Development launcher | `scripts/dev-isolated.mjs` (`yarn dev:isolated`) | Builds the runtime and host, then runs the host on `127.0.0.1:4100` and `next dev` on `localhost:3000` with the dedicated origin. Verified to start, serve the correct headers and render the preview. |

Same-origin `yarn dev` and `yarn build` are unchanged (fallback mode).

## Deployment configuration required (owner action; nothing here was deployed)

### 1. Preview-host project (new)

| Setting | Value |
| --- | --- |
| Repository | `jorenbagadiong/explain-dev` |
| Root Directory | `preview-host` |
| Framework preset | Other (`preview-host/vercel.json` sets `"framework": null`) |
| Install / Build | From `preview-host/vercel.json`: `cd .. && yarn install --frozen-lockfile`, `cd .. && yarn build:preview-host` |
| Output | Build Output API (`preview-host/.vercel/output`, written by the build because Vercel sets `VERCEL=1`) |
| Include files outside the Root Directory | **Enabled** (the build reads `src/lab-runtime`, `src/lib/lab`, `public/lab-runtime`) |
| Deployment Protection | Must not require login on the production hostname, or the iframe cannot load |
| Env: `LAB_PARENT_ORIGINS` | Exact app origins, comma-separated, for example `https://<app-domain>`. The build fails without it. |
| Domain | `<project>.vercel.app` needs **no DNS change**: `vercel.app` is on the Public Suffix List, so it is its own site. A separately registered custom domain is optional. Never use a subdomain of the app's domain. |

The Build Output API path was generated and inspected locally (`VERCEL=1`), but **it has not been deployed to Vercel**, so its behavior there is unverified.

### 2. App project (existing)

| Env | Value |
| --- | --- |
| `NEXT_PUBLIC_LAB_PREVIEW_ORIGIN` | `https://<preview-host>`: exact origin, no trailing slash; `https://` required outside localhost |

Deploy the host first, then the app. Without the variable, the app uses the same-origin fallback and logs a build warning on Vercel production.

### Local development

```sh
yarn dev:isolated                     # app http://localhost:3000, preview http://127.0.0.1:4100 (different sites)
# or manually:
yarn build:preview-host:dev && yarn preview-host
NEXT_PUBLIC_LAB_PREVIEW_ORIGIN=http://127.0.0.1:4100 yarn dev
```

For a production build tested locally, set `LAB_PARENT_ORIGINS=http://localhost:<port>` for the host build, and set `NEXT_PUBLIC_LAB_PREVIEW_ORIGIN=http://127.0.0.1:4100` for the app build.

## Rollback

- **App only:** remove `NEXT_PUBLIC_LAB_PREVIEW_ORIGIN` and redeploy. The app returns to the same-origin fallback, which ED-019 also hardened with `frame-src 'self'`, the link guard and WebRTC removal. This needs no code change.
- **Preview host:** use Vercel Instant Rollback. Runtime files are content-hashed, so each `preview.html` references its own runtime.
- **Version skew:** the protocol is now version 2. A preview from another version is detected at the hello and fails closed ("Preview unavailable: version mismatch") without running code (verified).
- **Full revert:** revert the ED-019 commit.

## Operational limitations

1. Two deployments must stay protocol-compatible. Deploy the host before the app.
2. The app's Vercel preview deployments have unpredictable origins. They work only if their exact origin is in `LAB_PARENT_ORIGINS`. `frame-ancestors` cannot express "this project's previews" without the overly broad `https://*.vercel.app`.
3. The local host server does not compress. Production static hosting compresses: the runtime is 213.6 KB gzip versus 767.8 KB uncompressed.
4. Vercel Hobby is for non-commercial use.
