# Deployment plan (not yet implemented)

Goal: **one config** that works for both (a) everything on a single machine via docker-compose, and (b) frontend on one machine, API on another — without changing code, cookies, or CORS.

## Key principle
Always make the **browser talk to a single origin**: put nginx in front of the **frontend** and have it proxy `/api` to wherever the API lives. Then "single machine" vs "split" is just *which upstream nginx forwards to* — the browser only ever sees one origin.

Consequences:
- Cookie is always first-party → `SameSite=Strict` always works.
- **No CORS** (can delete the CORS config) and **no CSRF tokens** needed.
- FE base URL is the relative `/api/v1` → **build once, deploy anywhere** (no per-env rebuild).

## The single knob
`API_UPSTREAM` — the nginx proxy target.
- Single machine: `http://api:8080` (compose service name).
- Split: `https://api.internal.example.com` (remote API). Browser still hits only the FE origin.

## Artifacts to add
- `game-engine.webapp/nginx.conf.template` — serves the SPA (`try_files … /index.html`) and `location /api/ { proxy_pass ${API_UPSTREAM}; }` (no trailing slash → preserves `/api/v1/...`; `envsubst` makes it a literal at container start).
- `game-engine.webapp/Dockerfile` — multi-stage: `node` build → `nginx` serve.
- `game-engine.webapp/.env.production` — `VITE_GAMIFICATION_API_BASE_URL=/api/v1`.
- `game-engine.api/Dockerfile` — maven build core+api → JRE run.
- `docker-compose.yml` — `mongo` + `api` + `web`; `web` sets `API_UPSTREAM`.

## Settings
- `CUSTOM_JWT_COOKIE_SECURE` = `false` for local http, `true` behind TLS.
- Cookie `SameSite=Strict` always (same-origin).
- TLS terminates at the `web`/nginx layer (or a front LB), not the API.

## Blockers to resolve first
1. `npm run build` runs `tsc -b` which currently has ~278 pre-existing type errors → FE image build fails at that step. Fix the errors or relax the build script to `vite build`.
2. The API mixes `spring.mongodb.*` (non-standard) and `spring.data.mongodb.*` for Mongo config — reconcile so the container env (`SPRING_DATA_MONGODB_URI`) is actually honored.
