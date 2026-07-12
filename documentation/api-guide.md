# Gamification Engine API — Guide

A feature-complete reference for `game-engine.api`, the REST layer over the `game-engine.core` gamification engine (games, rules, points, badges, levels, challenges, teams, leaderboards, and player state, all driven by a Drools rule engine).

This guide explains **concepts and flows**. For the exhaustive parameter/schema-level reference, use the live **Swagger UI** (`/swagger-ui.html`) or the raw spec (`/v3/api-docs`) — every endpoint is tagged and documented there.

Base path for all endpoints below: `/api/v1`.

---

## 1. Core concepts

- **Game** — the top-level container. Owned by exactly one user (`game.owner`). Everything else (actions, rules, point concepts, badges, levels, challenge models, teams, players, leaderboards) is scoped to a game.
- **Action** — a named event a game reacts to (e.g. `walk`). Clients fire actions via `POST /executions`; the engine's Drools rules evaluate against the current player state and the action.
- **Rule** — a Drools DRL script attached to a game. Rules read/write **concepts** (points, badges) in response to actions.
- **Point Concept / Badge Collection** — the "currency"/collectibles a game tracks per player (e.g. `steps`, a badge collection).
- **Level** — a named progression tied to a point concept, made of **thresholds** (score → level, optionally unlocking challenge models).
- **Challenge Model** — a template for a challenge (name + variables). Player-facing challenge *instances* are created from a model via assignment or invitation.
- **Player** — a per-game player state: point concepts, badges, active challenges, group challenges, inventory.
- **Leaderboard (Classification)** — a ranked view over a point concept, either `GENERAL` (all-time, cron-refreshed) or `INCREMENTAL` (per period).

---

## 2. Authentication

Two transports are accepted on every request, tried in this order (`AuthTokenResolver`):

1. **httpOnly cookie** named `token` — used by the web app (browser).
2. **`Authorization: Bearer <token>` header** — used by non-browser clients (mobile games, services) that can't rely on a browser's cookie jar.

Both resolve to the same JWT validation pipeline — there is only one kind of token, just two ways to carry it.

### Login

```
POST /api/v1/auth
{ "username": "...", "password": "...", "origin": "WEBAPP" | "GAME" }
```

- `origin` is **required**. It does not change the token's lifetime or authority today — it only controls **delivery**:
  - The `Set-Cookie: token=...` header is **always** sent (httpOnly, `Secure` per `custom.jwt.cookie.secure`, `SameSite` per `custom.jwt.cookie.same-site`, default `Strict`).
  - The token is **also** included in the JSON body (`{"user": {...}, "token": "..."}`) only when `origin: "GAME"` — a browser client never receives the raw token in the body, preserving the httpOnly XSS protection.
- JWT claims: `sub` = username, `userId` = the user's id, standard `iat`/`exp`. Lifetime is `custom.jwt.expiration` (default 86400s / 24h) — **the same for both origins**; there is currently no shorter-lived admin token vs. longer-lived game token distinction (discussed, not implemented).
- `POST /api/v1/auth/logout` clears the cookie. Bearer clients simply discard the token locally — there's no server-side revocation list.

### Other account endpoints
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/auth/user` | Current authenticated user |
| `POST` | `/auth/register` | Create a new user account |
| `PUT` | `/auth/update-user` | Change username/password |
| `DELETE` | `/auth/deactivate` | Deactivate the current account |

### Known limitation — no instant revocation
Deactivating a user (`active: false`) is checked at **login time** only. A JWT issued before deactivation stays valid for its full lifetime (up to 24h) — the resource server validates signature + expiry per request but never re-checks the DB. This is an accepted tradeoff (deactivation is rare); enforcing it would require a per-request DB lookup.

### Public (unauthenticated) endpoints
`POST /auth`, `POST /auth/logout`, `POST /auth/register`, Swagger/OpenAPI paths, `/actuator/health/**`, `/actuator/prometheus`. Everything else requires a valid token.

---

## 3. Authorization model

Every game-scoped endpoint is guarded by:

```java
@PreAuthorize("@methodSecurityDetails.canAccessGame(#gameId)")
```

`canAccessGame` is a strict **ownership** check: `authenticatedUser.id == game.owner`. There is no sharing, no team-based roles, no admin override — if you don't own the game, every endpoint under it returns `403`. A missing `gameId` returns `404` before the ownership check even runs.

---

## 4. Errors

Every error (validation, not-found, conflict, auth failure, unhandled exception) returns the same shape:

```json
{
  "title": "Validation Error!",
  "message": "One or more values are not correct.",
  "timestamp": "2026-07-12T08:38:13Z",
  "details": { "origin": "must not be null" },
  "errorCode": "validation",
  "params": []
}
```

`details` is populated for field-level validation errors (field → message); `params` carries structured args for message templating on the client (e.g. i18n interpolation). A catch-all `Exception` handler returns `500` with `errorCode: "generic"` for anything unhandled — this is intentional, not a gap to chase.

Common `errorCode` values: `validation`, `rule_validation`, `authentication_failed`, `user_not_authenticated`, `user_not_authorized`, `user_not_active`, `username_already_taken`, `*_not_found` (game/rule/action/point_concept/level/badge/challenge/player/team/scenario/classification), `*_creation` (conflict on create), `duplicate_key`, `data_access`, `game_execution_failed`, `import_empty`, `generic`.

---

## 5. Conventions

- **Filtering**: most list endpoints accept a *criteria* query object bound automatically from query params (e.g. `GET /rules?name=foo&gameId=...`). Each domain's criteria fields are listed below.
- **Pagination**: endpoints backed by MongoDB paging (players, notifications, leaderboard boards) accept Spring's standard `page`, `size`, `sort` query params and return a `Page<T>` envelope (`content`, `totalElements`, `number`, etc.).
- **IDs**: games use Mongo ObjectIds; catalog-style sub-resources (actions, teams, levels) are keyed by their natural name.
- **CORS**: same-origin only in the current config (`http://localhost:[*]` for local dev) — the web app and API are expected to share an origin via a reverse proxy in any other environment, so cookies stay same-site and no CORS/CSRF machinery is needed in production. Non-browser clients (bearer token) aren't subject to CORS at all.

---

## 6. Domain reference

### Games — `/games`
CRUD for the game definition itself, plus import/export and static rule analysis.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/games` | List games owned by the current user (filter: `GameCriteria`) |
| `POST` | `/games` | Create a game (must not include an id) |
| `GET` | `/games/{gameId}` | Get a game |
| `PUT` | `/games/{gameId}` | Update game metadata (name/domain/expiration/terminated) — **does not** touch actions/rules/tasks/concepts, which have their own endpoints |
| `DELETE` | `/games/{gameId}` | Delete a game |
| `POST` | `/games/import` | Bulk-import full game definitions |
| `GET` / `POST` | `/games/{gameId}/export` / `/games/export` | Export one or many full game definitions |
| `GET` | `/games/{gameId}/impact` | Static rule-impact analysis (best-effort; see note below) |

**Note**: `/impact` is a heuristic static analyzer for this engine's rule style — it will not catch every rule interaction and is not a substitute for testing via `/executions/simulations`.

### Actions — `/games/{gameId}/actions`
The vocabulary of events a game reacts to. `GET` (list, filter by name), `POST` (add), `PUT /{actionId}` (rename), `DELETE /{actionId}`.

### Rules — `/games/{gameId}/rules`
Drools DRL scripts. `GET`/`POST`/`PUT /{ruleId}`/`DELETE /{ruleId}` plus `POST /validate` (compiles the given content against the game without persisting — use before saving to catch Drools errors, including cross-rule duplicate-name clashes).

**Gotcha**: a rule's Drools name (the `rule "..."` string inside `content`) is independent of its Mongo document name field. When validating an edit, the engine excludes the rule being edited from the duplicate-name check by its **document id**, not by name — so renaming a rule's Drools name on update is safe and won't false-positive as a duplicate against itself. A duplicate-name error means a genuinely different rule in the same game declares the same Drools name.

### Point Concepts — `/games/{gameId}/point-concepts`
Standard CRUD (`GET`/`GET /{id}`/`POST`/`PATCH /{id}`/`DELETE /{id}`). New concepts start at `score: 0`.

### Badges — `/games/{gameId}/badges`
Badge **collections** (a named group of badge strings, e.g. `["bronze","silver","gold"]`). CRUD, `hidden` flag controls player-facing visibility.

### Levels — `/games/{gameId}/levels`
A level ties a name + point concept to an ordered list of **thresholds** (`name`, `value`, `index`, and `config` — choices count + available/active challenge models unlocked at that threshold). `GET`/`GET /{levelId}`/`POST` (upsert by name)/`DELETE /{lvlName}`.

### Challenge Models — `/games/{gameId}/challenges`
Templates (`name` + a set of `variables`) that player-facing challenge instances and group-challenge invitations are created from. Standard CRUD.

### Teams — `/games/{gameId}/teams`
A team is `{id, gameId, name, members: string[]}` (member ids validated against the game's players in one batch query). Standard CRUD.

### Players — `/games/{gameId}/players`
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/players` | Paged list of player states, optional `?playerId=` filter |
| `GET` | `/players/{playerId}` | Single player state, enriched with group challenges |
| `POST` | `/players` | Create/save a player state |
| `DELETE` | `/players/{playerId}` | Delete a player state |

A player state bundles: `pointConcepts`, `badgeCollections`, `challenges` (single), `groupChallenges`, `inventory`.

### Player Challenges — `/games/{gameId}/players/{playerId}/challenges`
The **single-player** challenge lifecycle. `ChallengeState` enum: `PROPOSED → ASSIGNED → ACTIVE → COMPLETED | FAILED | REFUSED | AUTO_DISCARDED | CANCELED`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/challenges` | Assign a challenge instance (`modelName`, `instanceName`, `challengeType` — a `ChallengeState` value, e.g. `"PROPOSED"` or `"ASSIGNED"` — `start`/`end`, `data`) |
| `GET` | `/challenges` | List the player's challenge instances |
| `GET` | `/challenges/{instanceName}` | Get one instance |
| `PUT` | `/challenges/{instanceName}` | Edit `start`/`end`/`hide` |
| `POST` | `/challenges/{instanceName}/accept` | Accept a `PROPOSED` instance → `ASSIGNED` |
| `POST` | `/challenges/force-choice` | Force the player's pending inventory choice (see Inventory below) |
| `DELETE` | `/challenges/{instanceName}` | Delete an instance |

### Group Challenges — `/games/{gameId}/players/{playerId}/group-challenges`
Multi-player challenges created via **invitation**, not the model-CRUD above. The invited model **must** be one of the three reserved group-challenge models — an arbitrary single-challenge model is rejected:

- `groupCompetitivePerformance`
- `groupCompetitiveTime`
- `groupCooperative`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/group-challenges` | List the player's group challenges |
| `POST` | `/group-challenges/invitations` | Invite one or more guests (`challengeModelName`, `guestIds`, `pointConceptName`, `challengeTarget`, `challengeStart`/`End`, `reward: {percentage, threshold, calculation/target PointConceptName, calculation/target PeriodName, bonusScore}`) |
| `POST` | `/group-challenges/{challengeName}/accept` | Guest accepts |
| `POST` | `/group-challenges/{challengeName}/refuse` | Guest refuses |
| `POST` | `/group-challenges/{challengeName}/cancel` | Proposer cancels |

A player may have at most **1** pending invitation as proposer and **3** as guest at a time (fixed in core, not configurable via the API). Winner resolution and failure transitions run as **scheduled JobRunr jobs** inside the engine (see §7), not synchronously on invite.

### Player Inventory — `/games/{gameId}/players/{playerId}/inventory`
Read a player's available challenge **choices** (offered when a level threshold is crossed) and activate one:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/inventory` | `{challengeChoices: [{modelName, state}], challengeActivationActions}` |
| `POST` | `/inventory/activations` | Activate a choice: `{type, name}` — `type` must be a known choice type (currently `"CHALLENGE_MODEL"`) or a `400` is returned |

Choices are populated by the level-threshold auto-choice flow, not created directly via this API.

### Player Blacklist — `/games/{gameId}/players/{playerId}/blacklist`
Lets a player record other players they've blocked.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/blacklist` | `{gameId, playerId, blockedPlayers: string[]}` |
| `POST` | `/blacklist/{otherPlayerId}` | Block a player (idempotent) |
| `DELETE` | `/blacklist/{otherPlayerId}` | Unblock a player |

**Important limitation**: this is currently **record-only**. The block list is not yet consulted by the group-challenge invite flow above — a blocked player can still be invited. In the core engine, the blacklist is only enforced inside the (unexposed) system-matching flow. This matches the old engine's own behavior — it's a pre-existing limitation, not a regression — but don't rely on it to prevent unwanted invites today.

### Leaderboards / Classifications — `/games/{gameId}/classifications`
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/classifications` | List (filter: `ClassificationCriteria`) |
| `GET` | `/classifications/{id}` | Get one |
| `POST` | `/classifications` | Create — `{name, type: GENERAL\|INCREMENTAL, pointConceptName, itemsToNotificate, cronExpression, periodName}` |
| `PUT` | `/classifications/{id}` | Update |
| `DELETE` | `/classifications/{id}` | Delete (also unschedules its recurring job) |
| `GET` | `/classifications/{id}/board?timestamp=&periodInstanceIndex=` | Ranked, paged board |

- `GENERAL` requires `cronExpression` (drives the periodic notification job; **the board itself is always computed live**, on demand, from current scores — the cron only affects when notifications fire).
- `INCREMENTAL` ranks within a named period of the point concept (`periodName`) and needs no cron.
- `timestamp` and `periodInstanceIndex` on `/board` are mutually exclusive.

### Scenarios — `/games/{gameId}/scenarios`
Saved simulation fixtures (`syntheticState` + `expectedOutput`) used by the frontend's simulation/testing UI. Standard CRUD.

### Execution — `/executions`
The engine's runtime entry points.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/executions` | Apply a real action for a real player, **synchronously**, and return the updated state. `{gameId, actionId, playerId, data, executionMoment, customData}` — `actionId` must be one the game declares (§ Actions), `data` is required (send `{}` if unused). |
| `POST` | `/executions/simulations` | Run one or more actions against a **synthetic** player state — nothing is persisted. Returns `initialState`, `finalState`, `firedRules`, and (if `showDetailedChanges: true`) per-rule concept deltas. |

`/executions` is guarded against runaway rules (infinite-loop DRL) at the engine level — but a rule that intentionally loops (e.g. a `while(true)` test rule) will still hang that request. Only fire actions you know are safe in a shared environment.

### Notifications — `/games/{gameId}/notifications`
Read-only (`GET`, paged, filter: `NotificationCriteria`). Notification payloads vary by `type` (badge, challenge assigned/proposed/completed/failed, group-challenge invite/accept/refuse/cancel, classification position, level gained, generic message, raw game event) — see `NotificationDTO` for the full field union. There is no write-side API; notifications are produced internally by the engine.

---

## 7. Engine execution model (background)

- Rules are compiled per-game into a Drools `KieContainer`, rebuilt when rules/actions change.
- `POST /executions` calls the engine **synchronously** (`Workflow.applySync`) — the response reflects the fully-updated player state.
- Scheduling runs on **JobRunr inside `game-engine.core`** (migrated from Quartz): a handful of global engine jobs (challenge failure sweep, group-challenge performance check, game-stats aggregation, job cleanup) plus one recurring job per classification/leaderboard and per level's auto-choice task. These are self-registering at startup for every active game — there's no separate generic job-management API surface.


## 8. Explore it live

- **Swagger UI**: `/swagger-ui.html` — every controller is tagged by domain (matching the sections above) with a summary + description per endpoint.
- **OpenAPI spec**: `/v3/api-docs` — consumed by the web app's own type generation (`@hey-api/openapi-ts`), so it's always in sync with the deployed API.
