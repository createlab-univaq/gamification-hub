# Gamification Engine — Application Guide

A walkthrough of what you can do in this console: every page, what it shows, and what each action does. For the underlying REST API, see the developer documentation in the project repository.

---

## 1. Signing in

The login page lets you **sign in** with a username and password, or **switch to registration** to create a new account. The language switcher (flag icon, top of the page) changes the console's language between English and Italian at any time — your choice is remembered for future visits.

Once signed in, you land on the **Games** dashboard.

---

## 2. Games — the dashboard

The dashboard lists every game you own. From here you can:

- **Search** games by name.
- **Create a new game** — name, domain, and (optionally) an expiration date.
- **Import games** — upload a full game definition (rules, challenge models, and metadata together) instead of building one from scratch.
- **Export** one or more games to a file, e.g. to back them up or move them to another environment.
- Click a game to **open it** — this takes you into that game's own section, with a sidebar covering everything below (Rules, Actions, Point Concepts, Players, Teams, Leaderboards, Badges, Levels, Scenarios, Challenge Models).
- **Edit** a game's name, domain, or terminated status, or **delete** it entirely.

A **terminated** game is marked as no longer active — its data stays intact, but it signals the game has concluded.

---

## 3. Rules

Rules are the logic that reacts to player actions (e.g. "when a player walks, award 10 steps"). The rule editor gives you two ways to write one, kept in sync:

- **Visual builder** — drag-and-drop blocks (conditions, actions, variables) without writing code by hand.
- **Code editor** — the equivalent raw rule script, for direct editing.
- A **console panel** shows validation output and save results.

Before saving, use **Validate** to compile the rule against the game and catch errors early — including a rule that would conflict with another rule already in the game. **Save** persists it; the list view lets you search, edit, or delete existing rules.

### Impact analysis
A separate page (reachable from the Rules section) shows a **graph of how your rules interact** — which rules can trigger or block one another. It's a best-effort visualization to help you reason about complex rule sets before things go live; it won't catch everything, so testing via Scenarios (below) is still the reliable way to confirm behavior.

---

## 4. Actions

The list of named events your game listens for (e.g. `walk`, `check-in`). You can add new action names, rename them, or remove ones no longer used by any rule. Actions are what you reference when writing rule conditions, and what a player-facing client fires to make the engine react.

---

## 5. Point Concepts

The numeric "currencies" your game tracks per player — e.g. `steps`, `points`, `coins`. Create, rename, or delete them here. A point concept's score always starts at zero for a new player and moves according to what your rules do with it.

---

## 6. Badges

Badges are organized into **collections** — a named group of badges a player can earn (e.g. a "milestones" collection containing `bronze`, `silver`, `gold`). You manage collections here: create one, list the badges inside it, and mark a collection **hidden** if you don't want it visible to players until earned.

---

## 7. Levels

A level ties a **point concept** to a series of **thresholds** — score values that represent progression (e.g. "Novice" at 0, "Expert" at 500). Each threshold can also unlock a set of **challenge models**, letting players choose from new challenges once they cross it. You define the thresholds in order; the console lets you add, edit, or remove them, and choose how many challenge choices a player gets at each one.

---

## 8. Challenge Models

Challenge models are **templates** — a name plus a set of variables — that get turned into actual challenges for players, either by direct assignment or through group invitations (see Players, below). Manage the templates here; the console's Player pages are where challenges are actually assigned to people.

---

## 9. Teams

A team groups a set of players together under a name. Create a team, add or remove members (picked from the game's existing players), rename it, or delete it. Teams exist as an organizational grouping — group challenges (below) are a separate, invitation-based mechanism.

---

## 10. Players

The players list shows everyone registered in the game, with search and the ability to **add** a new player (by id) or **remove** one. Clicking a player opens their **details page**, which is the most feature-rich page in the console:

- **Point concepts & badges** — the player's current scores and earned badges, at a glance.
- **Challenges** — the player's individual challenge instances. You can **assign** a new challenge (pick a model, give it an instance name, a start/end window), **accept** a proposed one on the player's behalf, **edit** its dates or visibility, or **delete** it.
- **Inventory** — challenge *choices* the player has been offered (typically from crossing a level threshold). If one is available, you can **activate** it, or **force** the player's next pending choice if they haven't picked yet.
- **Group challenges** — multiplayer challenges. You can **invite** other players to a group challenge (choosing the challenge model, target, reward, and guests), and for existing invitations: **accept**, **refuse**, or **cancel** them, depending on whether this player is the proposer or a guest.
- **Blocked players** — a personal block list this player maintains against other players. You can **block** a player (picking them from the game's player list) or **unblock** one already on the list. This is currently a record only — it doesn't yet prevent a blocked player from being invited to a group challenge.

---

## 11. Leaderboards

Leaderboards (called **classifications**) rank players by a point concept. Two kinds:

- **General** — an all-time ranking, refreshed on a schedule you define (a cron expression).
- **Incremental** — ranks players within a specific recurring period of the point concept (e.g. weekly), no schedule needed.

Create one by naming it, picking its type and point concept, and (for General) a refresh schedule. Open a leaderboard to see its **board** — a live, paginated ranking with the top three highlighted, computed from current scores at the moment you view it (not just at the last scheduled refresh).

---

## 12. Scenarios (Simulation)

Scenarios let you **test rule behavior safely**, without touching any real player. A scenario defines a synthetic starting state (point concepts, badges, active challenges) and a sequence of actions to fire; running it shows you the resulting state, which rules fired, and — if you ask for detailed output — exactly what each rule changed. You can also save an **expected outcome** alongside a scenario, turning it into a repeatable regression check: run it again later and see whether the result still matches what you expect.

This is the recommended way to validate rule changes before relying on them for real players.

---

## 13. Account settings

From Settings you can change your **username or password**, or **deactivate your account**. Deactivating is immediate for new logins, though a session already in progress remains valid until it naturally expires.
