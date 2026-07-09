# API Migration Gaps — old engine → new `game-engine.api`

Tracks engine-core capabilities (`game-engine.core`, `eu.trentorise.game`) against what the new REST API (`game-engine.api`) exposes. Legend: `[x]` exposed · `[~]` partial · `[ ]` not yet.

## Exposed by the new API

- **Auth** — `POST /api/v1/auth`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/user`
- **Games** — CRUD (`/api/v1/games`), `POST /import`, `GET /{id}/export`, `POST /export`, `GET /{id}/impact`, list filters via `GameCriteria`; terminate via `PUT` (`terminated` flag)
- **Actions** — CRUD (`/games/{gameId}/actions`)
- **Rules** — CRUD + `POST /validate`
- **Point concepts** — CRUD
- **Badges / collections** — CRUD
- **Levels** — list / get / upsert (`POST`) / delete
- **Challenge models** — CRUD (game-definition only)
- **Teams** — CRUD (id == name, members validated in one batch query)
- **Players** — list / get / create / delete
- **Notifications** — read/query (`GET /games/{gameId}/notifications`)
- **Classification / leaderboards** — CRUD + `GET /{id}/board` (general + incremental)
- **Simulation scenarios** — CRUD (`/games/{gameId}/scenarios`)
- **Execution** — `POST /api/v1/executions` (apply action, **synchronous**, guarded against runaway rules), `POST /api/v1/executions/simulations` (synthetic, non-persisting)

## Remaining gaps

### Tier 1 — player-facing gameplay
- [ ] **Player-facing challenge lifecycle** (distinct from model CRUD): `assignChallenge`, `acceptChallenge`, `forceChallengeChoice`, instance `update`, `readChallenges` / `readSingleChallenge`.
- [ ] **Group challenges & invitations** — invite / accept / refuse / cancel, condition checks, active-by-date queries.
- [~] **Player state extras** — basic player CRUD is exposed; still missing: custom-data update (`updateCustomData`), inventory choice activation (`choiceActivation`), advanced search (raw / structured / text).

### Tier 2 — operational / analytics
- [ ] **Game statistics** — `loadGameStats` (aggregated / per-period).
- [ ] **Archive / history** — `readArchives` (archived single & group challenges by state/date).
- [ ] **Execution traces / player-move history** — read of execution logs (`TraceService` writes; old API exposed reads).
- [ ] **Challenge reports** — JSON + CSV export (`readChallengeReportJSON` / `readChallengeReportCSV`).
- [ ] **Player blacklist** — block / unblock / read.
- [ ] **System matching** — `readSystemPlayerState` (auto-match eligible players).
- [~] **Task / job management** — classification/leaderboard jobs are created/updated/deleted through the classifications endpoints and run on JobRunr inside the engine; a generic `TaskService` CRUD + task-data surface is not separately exposed.

## Notes

- Scheduling was migrated from Quartz to **JobRunr inside the engine core**; the engine is a self-configuring library (defaults in core, overridable via `engine.*` from the API). Classification/leaderboard jobs are managed through the classifications endpoints.
- `/{gameId}/impact` is a weak static analysis for this engine's rule style — tracked separately, not a migration gap.
- **Frontend status**: pages exist for actions, badges, challenges, games, levels, players, point-concepts, rules, scenarios, simulation, teams. **Classification / leaderboards frontend is the current in-progress work** (backend done and live-tested).
