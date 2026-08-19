# Driving a game from your own application

Everything the console does, it does by asking this API, and so can you. The console is where a game is designed; the API is how a game is played. Your application sends what your users did, the engine works out what it means, and the points, badges, levels and challenges follow from the rules somebody wrote in the console.

That division is the thing to hold on to while reading. A designer building a game rarely needs this chapter, and an application running one rarely needs anything from it beyond a handful of endpoints: send an event, read a player, read a leaderboard. The rest of what follows exists because sooner or later you will want to do from your own code what the console does through its screens, and it is all reachable.

This chapter explains each group of endpoints in turn: what it is for, what it expects, and what comes back. Every request carrying a body is shown as an example with placeholder values, so you can see the shape of it without reading a schema, and the fields that are required are called out where they matter.

For the exhaustive field-by-field detail the service describes itself. [**Swagger UI**](https://gamification-api.createlab-univaq.it/swagger-ui/index.html) lists every endpoint with its full schema and will send a request for you, and the same description in raw form is at [`/v3/api-docs`](https://gamification-api.createlab-univaq.it/v3/api-docs). Both are generated from the running service, so they describe precisely the version you are talking to, which is worth preferring over any prose when the two disagree.

Note that these are served by the **API**, on its own address rather than the console's. The links above point at the deployed instance; if you are running the engine yourself, the same two paths sit on whatever host and port you gave it, so `/swagger-ui/index.html` and `/v3/api-docs` on `http://localhost:8081` for a default local setup.

Two practical notes before starting. Every path below sits under `/api/v1`, which is left off the tables to keep them readable but is always there. And a game is private to the account that owns it, so nearly everything here begins with getting hold of a token.

---

## 1. How the pieces fit

The vocabulary here is the vocabulary of the [console chapter](/guide/console), which explains each idea properly: a game holds actions, point concepts, badges, levels, challenge models, players, teams and leaderboards, and the rules that connect them. This chapter assumes you have met them and concerns itself only with how they are reached over HTTP.

Two consequences of that arrangement shape almost every request you will write. The first is that **the game is the unit of everything**. It owns each of the pieces above, it belongs to exactly one account, and its id appears in nearly every path, which is why a token that works for one game reaches nothing in another. The second is that **the engine is driven by events, not by writing state**. You do not tell the API that a player has earned fifty points; you tell it the player did something, and the rules decide what that is worth. Almost every mistake made against this API comes from reaching for a setter that does not exist, because the answer is nearly always to send an action and let the rules run.

What you address a thing by varies, and it is worth knowing which is which before hunting for an id. Games, rules, point concepts, badges, challenge models, leaderboards and scenarios are given an id when created, and that id goes in the path. Actions, levels, players, teams and challenge instances are addressed by the name you gave them, because for those the name *is* the identity, which is also why renaming one is either unsupported or amounts to creating another.

## 2. Authentication and authorization

Two ways of carrying the token are accepted on every request, looked for in this order:

1. **httpOnly cookie** named `token` — used by the web app (browser).
2. **`Authorization: Bearer <token>` header** — used by non-browser clients (mobile games, services) that can't rely on a browser's cookie jar.

There is only one kind of token; these are two ways of carrying it, and both are checked the same way.

### Login

```
POST /api/v1/auth
{ "username": "...", "password": "...", "origin": "WEBAPP" | "GAME" }
```

- `origin` is **required**. It does not change the token's lifetime or authority today — it only controls **delivery**:
  - A `Set-Cookie: token=...` header is **always** returned, httpOnly so that browser scripts cannot read it.
  - The token is **also** included in the JSON body (`{"user": {...}, "token": "..."}`) only when `origin: "GAME"` — a browser client never receives the raw token in the body, preserving the httpOnly XSS protection.
- A token lasts 24 hours, whichever origin asked for it.
- `POST /api/v1/auth/logout` clears the cookie. Bearer clients discard the token locally.

### Other account endpoints
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/auth/user` | Current authenticated user |
| `POST` | `/auth/register` | Create a new user account |
| `PUT` | `/auth/update-user` | Change username/password |
| `DELETE` | `/auth/deactivate` | Deactivate the current account |

### Who the token identifies, and who your players are

A token identifies **your account**, not one of your players. There is no player login here: a player record holds scores, badges and challenges and carries no credentials of its own. Every game-scoped request is authorised by asking whether the account behind the token owns the game, so as far as the engine is concerned there is one caller, and that caller is your application.

Authenticating people therefore stays where it already is, in your game, and the join between the two systems is the **player id**. You choose it: `POST /games/{gameId}/players` takes the id in the body rather than generating one, and sending an event for an id that does not exist yet creates that player under exactly the id you used. So when someone signs in to your game, your own account record for that person holds their engine player id, and every call you make on their behalf carries it. Whatever your users are to you, a row in a table or an SSO subject, they are that id to the engine, which never needs their name or their password.

The practical consequence is where the token lives. A token that reaches a browser or a mobile binary can send events as **any** player id, because nothing in the request says which person is behind it. Keep the token on your server, let your own authentication decide whose id goes into a call, and let your server make the call.

### What a token is allowed to reach

A game belongs to exactly one account, and every endpoint scoped to a game asks the same question before doing anything: does the account behind this token own this game? If it does not, the request is refused with `403` and `errorCode: "user_not_authorized"`, whether you asked for the game itself or for anything underneath it — its rules, its players, one player's challenges, a leaderboard board.

Being logged in is therefore not enough on its own. A valid token gets you as far as your own games and no further: there is no sharing, no roles within a game, and no administrator who can reach everyone's. If the game id does not exist at all you get `404` rather than `403`, so a wrong id and someone else's id are told apart.

Exporting is stricter still, and refuses with `errorCode: "export_forbidden"` for a game you do not own even where a read might otherwise have been allowed.

## 3. Available endpoints

Each group below lists its endpoints and then shows the shape of the requests that carry a body. Values are placeholders: what matters is which fields exist and which are required. Endpoints that take no body are fully described by their path and query parameters.

List endpoints filter through query parameters (`?name=...`), and the paged ones — players, notifications, leaderboard boards — also take `page`, `size` and `sort`, returning `{content, totalElements, number, ...}` around the results.

### Games — `/games`
CRUD for the game definition itself, plus import/export and static rule analysis.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/games` | List games you own (filters: `?name=`, `?domain=`, `?terminated=`) |
| `POST` | `/games` | Create a game (must not include an id) |
| `GET` | `/games/{gameId}` | Get a game |
| `PUT` | `/games/{gameId}` | Update game metadata (name/domain/expiration/terminated) — **does not** touch actions/rules/tasks/concepts, which have their own endpoints |
| `DELETE` | `/games/{gameId}` | Delete a game |
| `POST` | `/games/import` | Bulk-import full game definitions |
| `GET` / `POST` | `/games/{gameId}/export` / `/games/export` | Export one or many full game definitions |
| `GET` | `/games/{gameId}/impact` | How the game's rules relate (experimental; see below) |

Creating a game needs only a name and a domain; everything else is added through its own endpoints afterwards.

```http
POST /api/v1/games
{
  "name": "My game",
  "domain": "my-domain"
}
```

`PUT /games/{gameId}` carries the same fields and updates the metadata only.

**Import and export deal in whole games**, and their payload is not a game object but a bundle of four parts: the game itself, its challenge models, its rules, and its scenarios. `GET /games/{gameId}/export` hands you exactly one such bundle, and `POST /games/import` takes a **list** of them, even to import a single game:

```http
POST /api/v1/games/import
[
  {
    "game": {
      "name": "My game",
      "domain": "my-domain",
      "actions": ["attend_lecture"],
      "concepts": [],
      "levels": [],
      "rules": [],
      "tasks": [],
      "expiration": 0,
      "terminated": false
    },
    "challengeModels": [],
    "rules": [
      {"name": "study_points_lecture", "gameId": "", "content": "package eu.trentorise.game.model\n\nrule \"...\"\nwhen\nthen\nend"}
    ],
    "scenarios": []
  }
]
```

`game`, `challengeModels` and `rules` must all be present, empty lists included; only `scenarios` may be left out. The practical way to build one of these is not by hand: export a game you already have, edit the result, and post it back. The only rules imported are the ones in the bundle's top-level `rules`. The `rules` field inside `game` is discarded on the way in, so whatever it says makes no difference and there is nothing to gain by filling it, which is why the example above leaves it empty. A hand-written bundle that puts its rules there and nowhere else imports a game with no rules at all.

Exporting several at once takes the ids you want:

```http
POST /api/v1/games/export
["{gameId}", "{anotherGameId}"]
```

`/impact` derives how a game's rules bear on one another without running them. It is experimental: a relationship it cannot resolve is dropped silently rather than reported, so treat a quiet result as "nothing found" rather than "nothing there", and keep using `/executions/simulations` to test.

### Actions — `/games/{gameId}/actions`
The vocabulary of events a game reacts to. An action is just a name.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/actions` | List the game's actions (filter: `?name=`) |
| `POST` | `/actions` | Add an action |
| `PUT` | `/actions/{actionId}` | Rename an action |
| `DELETE` | `/actions/{actionId}` | Remove an action |

```http
POST /api/v1/games/{gameId}/actions
{
  "name": "attend_lecture"
}
```

The engine also dispatches internal events of its own, named with a reserved `scogei_` prefix and created for you when a feature needs them — a scheduled leaderboard brings `scogei_classification` with it. These are **not** listed by `GET /actions`, cannot be renamed or deleted, and a name of your own starting with that prefix is refused with `action_name_reserved`. Rules may still match them: `Action( id == "scogei_classification" )` is how a leaderboard run is reacted to.

### Rules — `/games/{gameId}/rules`
Drools scripts, stored one per document.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/rules` | List the game's rules (filter: `?name=`) |
| `GET` | `/rules/{ruleId}` | Get one rule |
| `POST` | `/rules` | Create a rule |
| `PUT` | `/rules/{ruleId}` | Replace a rule |
| `DELETE` | `/rules/{ruleId}` | Delete a rule |
| `POST` | `/rules/validate` | Compile without saving |

`gameId`, `name` and `content` are all required, including on validate:

```http
POST /api/v1/games/{gameId}/rules
{
  "gameId": "{gameId}",
  "name": "study_points_lecture",
  "content": "package eu.trentorise.game.model\n\nrule \"study points\"\nwhen\n    Action( id == \"attend_lecture\" )\n    $pc : PointConcept( name == \"study_points\" )\nthen\n    $pc.setScore($pc.getScore() + 10);\n    update($pc);\nend"
}
```

`POST /rules/validate` takes the identical body and returns a list of messages, empty when the rule compiles. It saves nothing, so send a candidate here before creating it: a rule that fails to compile would otherwise be stored and break the game's next execution.

**Two names, not one.** The document's `name` is how the API addresses the rule; the `rule "..."` string inside `content` is how Drools addresses it. They are independent. A duplicate-name error refers to the Drools name and means a genuinely different rule in the same game declares it, since the rule being edited is excluded from that check by its document id — so changing a rule's Drools name on update is safe.

### Point Concepts — `/games/{gameId}/point-concepts`
A named score tracked per player and per team.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/point-concepts` | List the game's concepts |
| `GET` | `/point-concepts/{pointId}` | Get one concept |
| `POST` | `/point-concepts` | Create a concept |
| `PATCH` | `/point-concepts/{pointId}` | Update a concept |
| `DELETE` | `/point-concepts/{pointId}` | Delete a concept |

Only `name` is required; a new concept starts at `score: 0`.

```http
POST /api/v1/games/{gameId}/point-concepts
{
  "name": "study_points",
  "periods": {
    "weekly": {
      "identifier": "weekly",
      "start": 1740787200000,
      "end": null,
      "period": 604800000,
      "capacity": 10
    }
  }
}
```

**Periods** are the substantial part. Each entry keys a recurring window: `start` is required and anchors the grid the windows are laid on, `end` may be null for a period that never closes, `period` is one window's length **in milliseconds**, and `capacity` caps how many elapsed windows are kept. Reading a concept back also returns each period's `instances`, the elapsed windows with their scores, which is computed and cannot be written.

**A `PATCH` reaches every player.** Changing a concept rewrites its periods' definitional fields across every player state in the game, leaving accumulated scores untouched, dropping periods you removed and adding new ones empty. Without that, a player who met the concept before the edit would keep playing against the old definition.

### Badges — `/games/{gameId}/badges`
Badge **collections**: a named group of badge names a player can earn.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/badges` | List collections |
| `GET` | `/badges/{collectionId}` | Get one collection |
| `POST` | `/badges` | Create a collection |
| `PUT` | `/badges/{collectionId}` | Replace a collection |
| `DELETE` | `/badges/{collectionId}` | Delete a collection |

```http
POST /api/v1/games/{gameId}/badges
{
  "name": "achievements",
  "hidden": false,
  "badges": ["bronze", "silver", "gold"]
}
```

`hidden` keeps a collection out of what is shown to players while rules still award into it.

### Levels — `/games/{gameId}/levels`
A level ties a point concept to an ordered set of thresholds.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/levels` | List levels |
| `GET` | `/levels/{levelId}` | Get one level |
| `POST` | `/levels` | Create or replace a level, matched by name |
| `DELETE` | `/levels/{lvlName}` | Delete a level |

```http
POST /api/v1/games/{gameId}/levels
{
  "name": "Scholar",
  "pointConceptName": "study_points",
  "thresholds": [
    {"name": "Freshman", "value": 0, "index": 0},
    {"name": "Sophomore", "value": 100, "index": 1,
     "config": {"choices": 1, "availableModels": ["weekly_study_goal"], "activeModels": []}}
  ]
}
```

A threshold's `config` is what turns crossing it into an offer: `choices` is how many challenges the player may activate, chosen from `availableModels`, and the offer lands in their inventory.

There is no `PUT`. `POST` matches an existing level **by name**, so it updates one that exists and creates one that does not — which also means a level cannot be renamed, since a new name is read as a new level and only one level may bind a given point concept.

### Challenge Models — `/games/{gameId}/challenges`
Templates that concrete challenges are built from: a name and the variables that vary per instance.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/challenges` | List models |
| `POST` | `/challenges` | Create a model |
| `PUT` | `/challenges/{challengeId}` | Replace a model |
| `DELETE` | `/challenges/{challengeId}` | Delete a model |

```http
POST /api/v1/games/{gameId}/challenges
{
  "name": "weekly_study_goal",
  "variables": ["target", "bonus"]
}
```

### Players — `/games/{gameId}/players`
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/players` | Paged summary of the game's players, optional `?playerId=` filter |
| `GET` | `/players/{playerId}` | One player's full state |
| `POST` | `/players` | Create or save a player state |
| `DELETE` | `/players/{playerId}` | Delete a player state |

**The list and the detail return different things.** A list entry is a summary, carrying only who the player is and their levels, because a game with thousands of players would otherwise return every score and badge of each:

```json
{
  "content": [
    {"playerId": "alice", "gameId": "{gameId}", "levels": [{"levelName": "Scholar", "levelValue": "Freshman", "levelIndex": 0, "pointConcept": "study_points"}]}
  ],
  "totalElements": 1, "number": 0
}
```

Fetch a single player for the whole state: `playerId`, `gameId`, `pointConcepts`, `badgeCollections`, `challenges`, `levels`, `inventory`, `customData` and `groupChallenges`. Creating one takes the same shape, and in practice you rarely need to: the engine creates a player the first time an execution names an id it has not seen.

```http
POST /api/v1/games/{gameId}/players
{
  "playerId": "alice"
}
```

### Teams — `/games/{gameId}/teams`
A team holds players, scores alongside them, and can be ranked with them.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/teams` | List teams |
| `GET` | `/teams/{teamId}` | Get one team |
| `POST` | `/teams` | Create a team |
| `PUT` | `/teams/{teamId}` | Replace a team |
| `DELETE` | `/teams/{teamId}` | Delete a team |

```http
POST /api/v1/games/{gameId}/teams
{
  "name": "Team Alpha",
  "members": ["alice", "bob"]
}
```

Every member must already be a player of the game; one that is not fails the whole request with `invalid_team_members`. A team is addressed by the identifier it was created with, as a player is, so `{teamId}` is that name rather than a generated id.

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

`modelName` names the template, `instanceName` names this one instance, and `data` supplies the model's variables:

```http
POST /api/v1/games/{gameId}/players/{playerId}/challenges
{
  "modelName": "weekly_study_goal",
  "instanceName": "alice-weekly",
  "challengeType": "PROPOSED",
  "start": "2026-03-01T00:00:00Z",
  "end": "2026-03-08T00:00:00Z",
  "data": {"target": 50, "bonus": 25},
  "hide": false
}
```

`PUT /challenges/{instanceName}` adjusts `start`, `end` and `hide` on an existing instance. The two state moves take no body at all:

```http
POST /api/v1/games/{gameId}/players/{playerId}/challenges/{instanceName}/accept
POST /api/v1/games/{gameId}/players/{playerId}/challenges/force-choice
```

A challenge only advances toward `COMPLETED` because a rule says so. Nothing here completes one for you: the rules read the player's scores and call `completed()` when the target is met, which is why a challenge with no rule watching it stays where it is forever.

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

The player in the path is the proposer; the guests are named in the body:

```http
POST /api/v1/games/{gameId}/players/{playerId}/group-challenges/invitations
{
  "challengeName": "library-sprint",
  "challengeModelName": "groupCooperative",
  "guestIds": ["bob", "carol"],
  "pointConceptName": "study_points",
  "periodName": "weekly",
  "challengeTarget": 100,
  "challengeStart": "2026-03-01T00:00:00Z",
  "challengeEnd": "2026-03-08T00:00:00Z",
  "reward": {
    "percentage": 10,
    "threshold": 50,
    "calculationPointConceptName": "study_points",
    "calculationPeriodName": "weekly",
    "targetPointConceptName": "credits",
    "targetPeriodName": null,
    "bonusScore": {"bob": 25}
  }
}
```

The three replies take no body:

```http
POST /api/v1/games/{gameId}/players/{playerId}/group-challenges/{challengeName}/accept
POST /api/v1/games/{gameId}/players/{playerId}/group-challenges/{challengeName}/refuse
POST /api/v1/games/{gameId}/players/{playerId}/group-challenges/{challengeName}/cancel
```

`accept` and `refuse` are the guest's to make, `cancel` the proposer's, and only while the challenge is still proposed. A player may hold at most **one** pending invitation as proposer and **three** as guest; a further invite is refused. Who won is not decided here: the engine settles it on a schedule once the challenge has run, so a freshly accepted challenge shows no outcome yet.

### Player Inventory — `/games/{gameId}/players/{playerId}/inventory`
Read a player's available challenge **choices** (offered when a level threshold is crossed) and activate one:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/inventory` | `{challengeChoices: [{modelName, state}], challengeActivationActions}` |
| `POST` | `/inventory/activations` | Activate one of those choices |

```http
POST /api/v1/games/{gameId}/players/{playerId}/inventory/activations
{
  "type": "CHALLENGE_MODEL",
  "name": "weekly_study_goal"
}
```

`name` is the model to activate. `type` may be omitted, in which case it is taken as `CHALLENGE_MODEL`, which is the only kind of choice there is today; any other value is refused.

Activating spends the choice: the challenge becomes active on the player and the remaining count drops. Choices cannot be created here — they arrive because the player crossed a level threshold configured to offer them.

### Player Blacklist — `/games/{gameId}/players/{playerId}/blacklist`
Lets a player record other players they've blocked.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/blacklist` | `{gameId, playerId, blockedPlayers: string[]}` |
| `POST` | `/blacklist/{otherPlayerId}` | Block a player (idempotent) |
| `DELETE` | `/blacklist/{otherPlayerId}` | Unblock a player |

Both carry no body; the player to block is in the path:

```http
POST /api/v1/games/{gameId}/players/{playerId}/blacklist/{otherPlayerId}
```

**Important limitation**: this is currently **record-only**. The block list is not yet consulted by the group-challenge invite flow above — a blocked player can still be invited. In the core engine, the blacklist is only enforced inside the (unexposed) system-matching flow. This matches the old engine's own behavior — it's a pre-existing limitation, not a regression — but don't rely on it to prevent unwanted invites today.

### Leaderboards / Classifications — `/games/{gameId}/classifications`
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/classifications` | List the game's leaderboards (filter: `?name=`) |
| `GET` | `/classifications/{id}` | Get one |
| `POST` | `/classifications` | Create — `{name, type: GENERAL\|INCREMENTAL, pointConceptName, itemsToNotificate, cronExpression, periodName}` |
| `PUT` | `/classifications/{id}` | Update |
| `DELETE` | `/classifications/{id}` | Delete (also unschedules its recurring job) |
| `GET` | `/classifications/{id}/board?timestamp=&periodInstanceIndex=` | Ranked, paged board |

```http
POST /api/v1/games/{gameId}/classifications
{
  "name": "weekly_study",
  "type": "INCREMENTAL",
  "pointConceptName": "study_points",
  "periodName": "weekly",
  "itemsToNotificate": 3
}
```

A `GENERAL` board ranks all-time scores and requires a `cronExpression` instead of a `periodName`:

```http
POST /api/v1/games/{gameId}/classifications
{
  "name": "overall_study",
  "type": "GENERAL",
  "pointConceptName": "study_points",
  "itemsToNotificate": 3,
  "cronExpression": "0 0 8 * * MON"
}
```

The cron does not compute the ranking. **The board is always worked out live** from current scores whenever you ask for it, so it is never stale; the schedule only decides when the top places are notified. An `INCREMENTAL` board ranks within one named period of the concept and needs no cron.

Reading a board takes optional `timestamp` or `periodInstanceIndex` to ask about a past window rather than the current one, and the two are mutually exclusive:

```http
GET /api/v1/games/{gameId}/classifications/{id}/board?periodInstanceIndex=0&page=0&size=20
```

### Scenarios — `/games/{gameId}/scenarios`
A saved simulation: an input state and the output expected from it, so the same check can be re-run later.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/scenarios` | List scenarios |
| `GET` | `/scenarios/{scenarioId}` | Get one scenario |
| `POST` | `/scenarios` | Create a scenario |
| `PUT` | `/scenarios/{scenarioId}` | Replace a scenario |
| `DELETE` | `/scenarios/{scenarioId}` | Delete a scenario |

```http
POST /api/v1/games/{gameId}/scenarios
{
  "name": "challenge completion",
  "syntheticState": {
    "actionIds": [],
    "pointConcepts": [{"name": "study_points", "score": 60}],
    "challenges": [{"name": "alice-weekly", "modelName": "weekly_study_goal", "state": "ASSIGNED", "fields": {"target": 50}}]
  },
  "expectedOutput": {
    "pointConcepts": [{"name": "study_points", "score": 60}],
    "challenges": [{"name": "alice-weekly", "state": "COMPLETED"}]
  }
}
```

Storing a scenario runs nothing. To run it, send its `syntheticState` to `/executions/simulations` and compare the result against `expectedOutput` yourself; the API keeps the pair, it does not judge it.

### Execution — `/executions`
The engine's runtime entry points.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/executions` | Apply a real action for a real player, **synchronously**, and return the updated state. `{gameId, actionId, playerId, data, executionMoment, customData}` — `actionId` must be one the game declares (§ Actions), `data` is required (send `{}` if unused). |
| `POST` | `/executions/simulations` | Run one or more actions against a **synthetic** player state — nothing is persisted. Returns `initialState`, `finalState`, `firedRules`, and (if `showDetailedChanges: true`) per-rule concept deltas. |

This is the endpoint a running game actually uses. Everything else configures; this plays.

```http
POST /api/v1/executions
{
  "gameId": "{gameId}",
  "playerId": "alice",
  "actionId": "attend_lecture",
  "data": {"hours": 2},
  "executionMoment": "2026-03-04T09:00:00Z"
}
```

`gameId`, `playerId` and `actionId` are required, and so is `data` — send `{}` when the action carries nothing. `actionId` must be one the game declares, or the request is refused. `executionMoment` may be omitted, and then now is used; supplying it is how you replay an event at the time it really happened, which matters when a point concept has periods and the score has to land in the right window. Anything in `data` is readable from a rule as `InputData`.

The response is the player's state after the rules have run, in the same shape as `GET /players/{playerId}`. The call is synchronous, so what comes back is settled, not queued.

Simulating takes a state instead of a player, and persists nothing:

```http
POST /api/v1/executions/simulations
{
  "gameId": "{gameId}",
  "syntheticState": {
    "actionIds": ["attend_lecture"],
    "pointConcepts": [{"name": "study_points", "score": 60}],
    "badgeCollections": [],
    "challenges": []
  },
  "showDetailedChanges": true
}
```

It answers with `initialState`, `finalState` and `firedRules` — which rules ran and in what order — plus the per-rule changes to each concept when `showDetailedChanges` is set. Because nothing is written, this is the safe way to see what a rule will do before any player meets it.

A simulation that cannot settle is stopped rather than left running: too many rule firings comes back as `maximum_simulation_firing_reached`, and taking too long as `simulation_timeout`. A real execution is guarded the same way, with one gap worth knowing — the guard counts rule firings, so a rule whose *consequence* loops internally never yields a firing to count and will hold the request open. On a shared environment, fire actions you have simulated first.

### Notifications — `/games/{gameId}/notifications`
What the engine has announced: a badge earned, a challenge proposed or completed or failed, a group-challenge invitation and its answers, a place on a leaderboard, a level gained.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/notifications` | Paged list (filters: `?playerId=`, `?type=`, `?fromTs=`, `?toTs=`) |

```http
GET /api/v1/games/{gameId}/notifications?playerId=alice&page=0&size=20
```

Read-only: there is no way to post one. Notifications are produced by the engine as a side effect of running, so they are how a client learns that something happened without polling every player. The fields present depend on `type`, so branch on it before reading the rest.

## 4. What happens when a game runs

Configuring a game and running one are different activities, and the second is worth understanding because almost every surprise comes from it.

**Rules are compiled per game, not per request.** The first execution for a game builds its rules into a compiled set held in memory; later executions reuse it. Saving, editing or deleting a rule throws that away so the next execution compiles afresh, which is why a rule takes effect immediately after saving and why a rule that only exists in your editor takes effect never.

**An execution is one action for one player, start to finish.** Sending an action loads the player's state, presents it to the rules together with the action and its `data`, lets every matching rule fire, and saves what changed. The reply is the state afterwards. Two things follow: a rule can only react to what is in front of it, so an action carrying no `data` cannot be told apart from another of the same name; and rules fire in `salience` order, highest first, so a rule that must run after the scoring rules needs a lower salience than they have.

Walking that through, with a rule that scores ten points per lecture:

```http
POST /api/v1/executions
{"gameId": "{gameId}", "playerId": "alice", "actionId": "attend_lecture", "data": {}}
```

`alice` is loaded, or created if this is the first time she has been named. The rule matches, her `study_points` rises by ten, and if that crosses a level threshold she gains the level and any choice it offers. The response carries all of it, and a notification is recorded for whatever was announced.

**Some things happen on a schedule instead.** Leaderboard notifications, group-challenge settlement, challenges timing out into `FAILED`, and the offers made when a level threshold is crossed all run as background jobs inside the engine rather than during your request. So a group challenge does not have a winner the moment its end date passes, and a leaderboard's notifications arrive on its cron rather than when scores change. The board itself is always live; only the announcing is scheduled.

**Nothing runs the checks you saved.** Scenarios are stored, not executed. If you want a saved scenario re-run after a rule change, send it to `/executions/simulations` yourself and compare against its `expectedOutput`.

## 5. When something goes wrong

Every failure comes back in one shape, whatever caused it, so a client needs one error path rather than a dozen:

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

The field to program against is **`errorCode`**. It is a stable string, so branch on it rather than on the HTTP status, which is often shared: a missing game and a game you cannot reach are both refusals but need different handling, and `game_not_found` against `user_not_authorized` tells them apart where `4xx` alone does not. `message` is written for a person and may be reworded; `title` likewise. Treat both as text to show, never as something to compare against.

`details` fills in when a request was rejected field by field, mapping each offending field to what was wrong with it. The example above is a login sent without `origin`. `params` carries the values that belong in the message, so a client that keeps its own translations can build the sentence itself instead of showing the English one.

The codes fall into families, and knowing the family is usually enough:

| Family | Examples | What it means |
|---|---|---|
| Rejected input | `validation`, `rule_validation` | The request was malformed, or a rule would not compile. Read `details`. |
| Not found | `game_not_found`, `rule_not_found`, `action_not_found`, `point_concept_not_found`, `level_not_found`, `badge_not_found`, `challenge_not_found`, `challenge_instance_not_found`, `player_not_found`, `team_not_found`, `scenario_not_found`, `classification_not_found` | The thing addressed does not exist, or is not yours to see. |
| Conflict on create | `game_creation`, `action_creation`, `point_concept_creation`, `badge_creation`, `challenge_creation`, `team_creation`, `scenario_creation`, `classification_creation` | Something with that name already exists, or the payload cannot be created as asked. |
| Reserved name | `action_name_reserved` | The name belongs to the engine's own internal events. Choose another. |
| Identity | `authentication_failed`, `user_not_authenticated`, `user_not_authorized`, `user_not_active`, `username_already_taken` | Wrong credentials, no token, not your game, deactivated account, or a name taken. |
| Running rules | `game_execution_failed`, `rule_simulation`, `simulation_timeout`, `maximum_simulation_firing_reached` | An execution or simulation failed. The last two mean the rules did not settle: they looped, or ran past the allowed number of firings. |
| Import and export | `import_empty`, `import_error`, `export_forbidden` | Nothing to import, an import that could not be read, or a game you may not export. |
| Storage | `duplicate_key`, `data_access`, `invalid_team_members` | The store refused the write. `invalid_team_members` means a listed member is not a player of that game. |
| Anything else | `generic` | Unhandled, returned as `500`. If you see one, it is worth reporting. |
