# API Migration Gaps — old engine → new `game-engine.api`

Features supported by the engine core (`game-engine.core`, `eu.trentorise.game`) but **not yet exposed** by the new REST API (`game-engine.api`, `it.smartcommunitylab.gamification.gameengineapi`).

Derived by diffing the engine core's public capability surface (services/managers) against the endpoints the new API currently registers. Use the checkboxes to track porting progress.

## Already exposed by the new API (baseline)

- Auth — `POST /api/v1/auth`, `GET /api/v1/auth/user`
- Games — CRUD (`/api/v1/games`), `POST /import`, `GET /{id}/impact`
- Rules — CRUD (`/api/v1/games/{gameId}/rules`), `POST /validate`
- Point concepts — CRUD (`/api/v1/games/{gameId}/point-concepts`)
- Badges / collections — CRUD (`/api/v1/games/{gameId}/badges`)
- Challenge **models** — CRUD (`/api/v1/games/{gameId}/challenges`) — *game-definition only* (confirmed: backed by `gameService.readChallengeModels`/`saveChallengeModel`/`deleteChallengeModel`)
- Simulation — `POST /api/v1/simulate` (synthetic state, no persistence)

---

## Tier 1 — blocks real runtime use

- [ ] **Execute an action / run the engine** — `Workflow.apply(gameId, actionId, playerId, [executionMoment], data, factObjects)`. Submit a player action/event so rules fire and player state is persisted. Today only `simulate` exists (synthetic, non-persisting), so a game cannot actually be *played* through the new API.
- [ ] **Player state & data** — entire `PlayerService` read/write surface is unexposed:
  - [ ] Read a player's state (`loadState`, with merge/filter options)
  - [ ] List players, paginated (`readPlayers`)
  - [ ] Search players — raw / structured / text queries (`search`)
  - [ ] Read a player's points / badges / challenges (`DBPlayerManager.readPlayerState` with selective concepts)
  - [ ] Save / delete a player state (`saveState`, `deleteState`)
  - [ ] Update **custom data** (`updateCustomData`)
  - [ ] Activate **inventory** choice (`choiceActivation`)
- [ ] **Notifications** — all `NotificationManager` read/query variants (per game, per player, time-range, include/exclude types, paginated).

## Tier 2 — core gamification features

- [ ] **Levels** — `upsertLevel`, `deleteLevel`, threshold add/update/delete, `calculateLevels`. (No levels controller; point-concepts and badges exist but levels do not.)
- [ ] **Challenge assignment & lifecycle** (player-facing, distinct from model CRUD): `assignChallenge`, `acceptChallenge`, `forceChallengeChoice`, instance `update`, `readChallenges` / `readSingleChallenge`.
- [ ] **Group challenges & invitations** — invite / accept / refuse / cancel, condition checks, active-by-date queries.
- [ ] **Leaderboards / classification** — `classifyAllPlayerStates`, period-based `classifyPlayerStatesWithKey`. (No leaderboard endpoint.)
- [ ] **Teams** — save/read teams, add/remove members.

## Tier 3 — operational / analytics

- [ ] **Scheduled tasks / jobs** — `TaskService` create/update/destroy game tasks (classification, cron) + task data read/write.
- [ ] **Game statistics** — `loadGameStats` (aggregated / per-period).
- [ ] **Archive / history** — `readArchives` (archived single & group challenges by state/date).
- [ ] **Execution traces / player-move history** — read of execution logs (`TraceService` writes; old API exposed reads).
- [ ] **Challenge reports** — JSON + CSV export (`readChallengeReportJSON` / `readChallengeReportCSV`).
- [ ] **Player blacklist** — block / unblock / read.
- [ ] **System matching** — `readSystemPlayerState` (auto-match eligible players).

## Minor / lifecycle

- [ ] **Game export** (import exists; export does not).
- [ ] **Game activate / terminate** and **load-by-owner / by-domain / only-active** filters.
- [ ] **Actions** — listing/definition of a game's actions.

---

## Notes

- `/games/{gameId}/challenges` is **challenge models** (game definition), confirmed against the controller — player-facing challenge operations are therefore genuinely absent.
- This list is "engine-core capability minus new endpoints." The original REST API may have had a few thin wrappers beyond core (health/console) not captured here.
- Impact analysis (`/{gameId}/impact`) is exposed but is a weak static analysis for this engine's rule style — see prior discussion; tracked separately, not a migration gap.
