# Campus Quest: a complete guide to the console

This guide explains every feature of the gamification console, one concept at a time: what it is, why it exists, how it behaves, and the options you have when you use it. To keep the explanations concrete rather than abstract, each one is illustrated with a single running example, **Campus Quest**, a university-engagement game where students earn points and badges for attending lectures, handing in assignments and using the library; they level up, join teams, take on challenges, and compete on leaderboards.

Read it front to back for a full tour of the engine, or jump to any section for the concept you need. The **In Campus Quest** boxes show how each idea is put to work, with real values you can reproduce if you want to follow along in the app; but the point of each section is the concept, and Campus Quest is only there to make it tangible.

Throughout, **bold** marks a button or field in the console, and `code` marks a concrete value.

## 1. Create the game

A **game** is the top-level container for everything else in this guide. Its actions, rules, point concepts, badges, players, teams and leaderboards all belong to it, and nothing is shared between games: two games can each have an action called `attend_lecture` and they never interfere. This makes a game a safe unit of work; you can build, export, delete or duplicate one without affecting any other.

You create a game with just a **name** and a **domain**. The domain is a free-text label for grouping related games (for instance, all the games belonging to one product or department); it has no effect on behaviour and exists only to help you organise a long list. Once created, a game is opened from the dashboard, and its left sidebar becomes your table of contents for everything the following sections describe (Rules, Actions, Point Concepts, Badges, Levels, and so on).

A game is also portable. From the dashboard you can **Export** it to a file, which is a complete snapshot (rules, challenge models, levels and all), and **Import** that file elsewhere. Exports are how you back a game up, move it between environments, or hand a working configuration to someone else.

> **In Campus Quest.** On the **Games** dashboard, click **Add**, set **Name** to `Campus Quest` and **Domain** to `campus`, and **Save**. Open it from the list; the rest of this guide works inside this one game.

![The New Game form](/docs/images/create-game.png "Creating Campus Quest: name and domain")

## 2. Actions

An **action** is the vocabulary of events your game understands. It represents something a player can do that the engine may react to, such as a lecture attended or an assignment submitted. Defining an action does two things: it gives that event a stable **id** you can refer to elsewhere, and it lets the engine accept events naming that id. On its own an action does nothing; it carries no points and no logic. The behaviour that turns an action into points, badges or level-ups is written separately, in **Rules** (section 6). Keeping the two apart means you can add, rename or reason about your events without touching your scoring logic, and vice versa.

Actions can also carry **data**. When an event is sent, it may include a small payload of named values, for example a submitted assignment that carries a `grade`, or a library visit that carries a number of `hours`. You never declare this data on the action itself; the shape of the payload is open, and a rule simply reads whichever keys it cares about when an event of that action arrives (section 6 shows how). This keeps actions lightweight: an action is a name, and the data it happens to carry is decided by whoever sends the event and read by whichever rule needs it.

> **In Campus Quest.** Open **Actions** and add five, each with just a name: `attend_lecture`, `submit_assignment`, `use_library`, `join_event` and `answer_quiz`. Two of them are meant to carry data: `submit_assignment` will carry a `grade`, and `use_library` will carry `hours`. Nothing reacts to any of them yet; that is what rules are for.

![The actions list](/docs/images/actions-list.png "Campus Quest's five actions")

## 3. Point Concepts

A **point concept** is a named score the engine tracks independently for every player and every team. A game can define as many as it needs, and they are best thought of as separate currencies: a player can be rich in one and poor in another, and each is earned and spent by its own rules. Separating scores this way lets a single game reward very different kinds of behaviour without mixing them, and lets each one drive its own levels and leaderboards.

The powerful part of a point concept is **periods**. Besides the running all-time total, a concept can track one or more recurring time windows. A period is defined by a **name**, the span of time over which it is valid, and the **length in days** of a single window inside that span. The span opens on a **start** date you have to give and closes on an **end** date you can leave empty: without an end the period goes on opening new windows indefinitely, and with one it stops. The start is more than paperwork, because windows are laid out on a fixed grid from it. A period starting on 1 March with a window length of three days keeps its first tally for 1 to 3 March, opens a fresh one for 4 to 6 March, another for 7 to 9 March, and carries on every three days from there; if an end date is set, the last window is cut short on that date rather than running its full length. An event dated before the start scores nothing in that period, and once the end has passed no further window opens, though in both cases the all-time total still grows. The **kept windows** count caps how many past windows are retained, discarding the oldest beyond it. The engine keeps a separate tally for the current window of each period, resetting when the window rolls over, while the all-time total keeps growing untouched. This is what makes "this week" and "this month" rankings possible: the same concept feeds both an all-time leaderboard and a periodic one (section 15). A concept with no periods is simply an all-time score.

> **In Campus Quest.** Open **Point Concepts** and create three. `study_points` is the main academic score, with a `weekly` period of `7` days, started on any past date and left with no end so the window keeps repeating forward. `credits` is formal course credit, an all-time score with no periods. `social_points` covers campus social life, with a `monthly` period of `30` days. All three start at zero for every player, and the rules in section 6 give the engine reasons to raise them.

![The point concepts list](/docs/images/point-concepts-list.png "The three point concepts, with their periods")

## 4. Badges

A **badge** is a one-off award: a player either has it or does not, in contrast to a point concept, which is a number that rises and falls. Badges are grouped into **collections**, and a collection is either **visible** or **hidden**. A visible collection is shown to the player from the start (typically with its earned and not-yet-earned badges), which is good for advertising goals to aim for. A hidden collection stays invisible until the player earns their first badge from it, which is ideal for secret achievements and surprises.

There is one detail about this engine worth understanding, because it shapes how you set badges up. A badge collection, in the engine's model, *is* the set of badges a player has **earned**. There is no separate catalogue of "possible" badges: whatever a collection contains is what the player has already been granted. The practical consequence is that you create collections **empty** (just a name and a visibility), and the actual badges are granted at play time by **rules** (section 6). If you were to type badge names into a collection at creation, every player would be considered to already hold them.

> **In Campus Quest.** Open **Badges** and create two empty collections: `achievements`, left **Visible**, and `secret_achievements`, set to **Hidden**. Do not add any badges by hand. During play, rules grant `first_lecture`, `bookworm`, `honor_roll` and `social_butterfly` into `achievements`, and the secret `night_owl` into `secret_achievements`. Those rules come in section 6.

![The badge collection form](/docs/images/create-badge.png "Creating the achievements collection")

## 5. Levels

A **level** turns one point concept into a rank. You choose a concept and define an ordered list of named **thresholds**, each with a value; a player's level is the highest threshold their score has reached. Levels give players a sense of progression that a raw number cannot: crossing from one named tier to the next is a milestone, and it is something the engine can react to. A game can define several levels, each based on a different point concept, so the same player can be a veteran on one scale and a novice on another.

Levels do more than label a player. Because the engine knows the exact moment a player crosses a threshold, a threshold can carry a **reward**: reaching it can hand the player a **challenge choice**, an entry that lands in their inventory for them to activate later (sections 12 and 13). This is how a level-up becomes an opportunity rather than just a new title. Configuring that reward needs challenge models to exist first, so it is layered on in section 12.

> **In Campus Quest.** Open **Levels** and add one level on the `study_points` concept, with five thresholds:
>
> | Threshold | Value |
> |-----------|-------|
> | Freshman  | 0     |
> | Sophomore | 100   |
> | Junior    | 300   |
> | Senior    | 600   |
> | Graduate  | 1000  |
>
> Every player starts at **Freshman** and crosses into **Sophomore** at 100 points, and so on. In section 12 the **Sophomore** threshold gains a challenge-choice reward.

![The level form with thresholds](/docs/images/levels-form.png "The Scholar level: five study_points thresholds")

## 6. Rules

Rules are where a game's behaviour actually lives; everything before this was declaring nouns, and rules are the verbs. The engine embeds a **rule engine** (Drools), and each rule has two parts: a **when** part listing conditions, and a **then** part listing consequences. When an event arrives, the engine places a set of **facts** in working memory (the action, its data, the player's current scores and badges, and more), then fires every rule whose **when** conditions match. A rule's **then** part reacts by changing those facts: adding to a score, granting a badge, sending a notification.

You match on facts. The ones you will use most often:

| Fact | Matches | Example |
|------|---------|---------|
| `Action( id == "..." )` | which action happened | `Action( id == "attend_lecture" )` |
| `InputData( $x : data["..."] )` | the payload sent with the action | `InputData( $hours : data["hours"] )` |
| `PointConcept( name == "...", ... )` | a player's point score | `PointConcept( name == "study_points", score >= 100 )` |
| `BadgeCollectionConcept( name == "...", ... )` | a player's badge collection | `badgeEarned not contains "bookworm"` |
| `Game( $gameId : id )`, `Player( $playerId : id )` | the current game and player | used when sending a badge notification |

Two mechanics are worth knowing up front. First, **salience** is a rule's priority: higher-salience rules fire first. This matters when one rule depends on another's result, for example a badge rule that should only run after a point rule has updated the score; giving the badge rule a negative salience makes it wait. Second, a rule guards against repeating itself by checking current state in its **when** part: a badge rule that adds `bookworm` only fires when the collection does *not* already contain `bookworm`, so it grants the badge exactly once.

You author rules on the **Rules** page, which keeps two representations in sync: a visual **block builder** on the left, where you drag conditions and consequences, and a **Drools code** panel beside it, where you can type the rule directly. Editing either updates the other. A **validate** button compiles the rule and reports problems in a console panel, and **save** stores it. Validating before saving is the habit that catches typos and type errors before they ever reach a player. This section stays with what a rule has to say; the [rule builder chapter](/guide/builder) is about the editor itself, block by block, and is the place to look when a block you have placed seems to make no difference to the rule it should be producing.

Before the first rule, a word about the few lines that sit above every one of them, because they are the most common reason a rule that looks correct refuses to compile. A rule is compiled as a small source file, so every type it names must be resolvable. Declaring `package eu.trentorise.game.model` at the top is what lets you write `Action`, `InputData`, `PointConcept` and `BadgeCollectionConcept` without importing them, since that is the package those types live in. Anything outside it has to be imported by name: `eu.trentorise.game.notification.BadgeNotification` to send a badge notification, or `eu.trentorise.game.core.Utility` together with `global Utility utils;` if you want to log from a rule. Leave the package line out and you must import every type you name, the concepts included. Validate reports an unresolved type as an error before you can save, so nothing broken reaches a player, but knowing this turns a puzzling failure into an obvious one.

The simplest useful rule adds to a score when an action happens. This one gives 10 `study_points` for every lecture attended, and needs nothing above it but the package line:

```
package eu.trentorise.game.model

rule "study points for lecture"
when
    Action( id == "attend_lecture" )
    $pc : PointConcept( name == "study_points" )
then
    $pc.setScore($pc.getScore() + 10);
    update($pc);
end
```

The `when` part matches two facts: the lecture action, and the player's `study_points` concept (bound to `$pc` so the `then` part can change it). The `then` part raises the score and calls `update` to tell the engine the fact changed. Reading data from the event works the same way, by matching an `InputData` fact and binding the key you want.

![The rule builder: blocks, code and console](/docs/images/rules-form.png "Building study_points_lecture")

A couple of notes on how rules are organised. Each saved rule is its own file, but a single file may hold more than one `rule "..." ... end` block: the engine compiles them all and they stay independent. That is allowed, yet it makes a file harder to read and maintain, so the clean approach is one rule per file. One name is special: a rule called `constants` is read as a plain properties file (`key = value` lines) instead of Drools code, and each key is published as a global constant your rules can use (after declaring it with `global` at the top of a rule). It is the tidy place to keep thresholds and tunable numbers rather than repeating literals across rules.

> **In Campus Quest.** The game uses nine rules, in two groups. The snippets below show only the `rule ... end` blocks; each is saved as its own rule and carries the same header described above, meaning the `package` line plus an import for anything outside that package. Make sure to put the necessary imports in every rule you write, or it will not validate. The **point rules** award scores from actions:
>
> ```
> rule "study points for library"          // + hours * 5 study_points on use_library
> when
>     Action( id == "use_library" )
>     InputData( $hours : data["hours"] )
>     $pc : PointConcept( name == "study_points" )
> then
>     Double hours = $hours != null ? ((Number) $hours).doubleValue() : 0.0;
>     $pc.setScore($pc.getScore() + hours * 5);
>     update($pc);
> end
>
> rule "credits for assignment"            // +3 credits on submit_assignment
> when
>     Action( id == "submit_assignment" )
>     $pc : PointConcept( name == "credits" )
> then
>     $pc.setScore($pc.getScore() + 3);
>     update($pc);
> end
>
> rule "social points for event"           // +20 social_points on join_event
> when
>     Action( id == "join_event" )
>     $pc : PointConcept( name == "social_points" )
> then
>     $pc.setScore($pc.getScore() + 20);
>     update($pc);
> end
> ```
>
> The **badge rules** grant a badge once a condition is met, and each one has to import the notification type because it lives outside the model package. They use a low `salience` so they run after the point rules have updated scores. The pattern is identical every time, so here is one in full, header included, and the rest as their distinctive lines:
>
> ```
> package eu.trentorise.game.model
> import eu.trentorise.game.notification.BadgeNotification;
>
> rule "bookworm badge"
>     salience -10
> when
>     Game( $gameId : id )
>     Player( $playerId : id )
>     PointConcept( name == "study_points", score >= 100 )
>     $bc : BadgeCollectionConcept( name == "achievements", badgeEarned not contains "bookworm" )
> then
>     $bc.getBadgeEarned().add("bookworm");
>     insert( new BadgeNotification($gameId, $playerId, "bookworm") );
>     update( $bc );
> end
> ```
>
> - **first_lecture**: condition `Action( id == "attend_lecture" )`; grants `first_lecture` in `achievements`.
> - **social_butterfly**: condition `PointConcept( name == "social_points", score >= 20 )`; grants `social_butterfly` in `achievements`.
> - **honor_roll**: conditions `Action( id == "submit_assignment" )`, `InputData( $grade : data["grade"] )` plus `eval( $grade != null && ((Number)$grade).doubleValue() >= 28 )`; grants `honor_roll` in `achievements`.
> - **night_owl**: conditions `Action( id == "use_library" )`, `InputData( $hours : data["hours"] )` plus `eval( ((Number)$hours).doubleValue() >= 3 )`; grants `night_owl` in the hidden `secret_achievements` collection.

## 7. Simulate & test

Because rules only fire on real events, you would otherwise have to send events to a real player to find out whether a rule behaves, which risks corrupting live state. The engine avoids this entirely with the **Scenarios** page: it runs your rules against a **synthetic** (made-up) player whose starting state you describe by hand. You set up a score here, an empty collection there, choose an action to fire, and the engine executes your real rules against that throwaway player without touching anyone real.

The value of a simulation is not just that it runs, but that it is fully **observable**. The output shows exactly which rules **fired**, what **changed** (each score before and after, each badge earned), and a small **graph** of state before and after. This turns rule debugging from guesswork into inspection: if a badge you expected did not appear, you can see whether its rule fired at all and, if it did not, which condition failed to match.

A simulation also becomes a **regression test**. Once you know the correct result, you fill in the **expected outcome** and save the scenario; from then on it passes only when a future run still produces that result. Re-running your saved scenarios after any rule change is how you catch a rule you accidentally broke before it reaches real players.

Whether a rule *compiles* is a smaller question than whether it behaves, and it has a quicker answer. [Validating from the builder](/guide/builder/7) compiles a rule and reports its problems without a player, a scenario or a saved rule, so it is worth clearing before you spend a simulation on it.

One more tool sits alongside simulation. The **impact analysis** is a static diagram of how your rules relate to each other (which rule's output can trigger or block another), computed without running anything. As a rule set grows, it is the quickest way to spot an unintended interaction, such as one rule quietly disabling another.

> **In Campus Quest.** Open **Scenarios**, add one named `lecture reaches Sophomore`, and build a synthetic player with the `attend_lecture` action, a `study_points` concept starting at `95`, and an empty `achievements` collection. Simulate. Because the score starts one lecture short of 100, the +10 crosses the threshold: the output shows `study points for lecture`, `first_lecture_badge` and `bookworm_badge` firing, `study_points` going 95 to 105, and both badges earned. Save it with that expected outcome and it guards those three rules from then on.

![The simulation inputs](/docs/images/simulation-inputs.png "A synthetic student one lecture away from 100 points")

![The simulation result](/docs/images/simulation-output.png "Fired rules and the resulting changes")

## 8. Challenge models

A **challenge** sets a single player a specific goal to reach within a time window, and a **challenge model** is the reusable template it is built from. The model names a kind of challenge and declares its **variables**: the values that vary from one concrete challenge to the next, such as the target to reach. Defining the template once means you can hand out many challenges of the same kind, each with its own target and dates, without redefining the shape each time.

A model is inert by itself; it challenges no one until a concrete challenge is created from it and assigned to a player. That assignment is where the variables get their values. There are two ways a model gets used: assigned directly to a player, or offered as a level-up reward that the player activates from their inventory. Both are covered in section 12. Group challenges are deliberately not built from these models; they use their own built-in types, described in section 14.

> **In Campus Quest.** Open **Challenge Models** and create one named `weekly_study_goal` with a single variable, `target` (the number of study points to reach). Section 12 assigns it to a player and also wires it into the Sophomore level-up reward.

![The challenge model form](/docs/images/challenges-form.png "The weekly_study_goal model with a target variable")

## 9. Players

A **player** is a participant in one game, and the unit that carries **state**. Everything the engine tracks about someone (their point scores, earned badges, current level, active challenges and inventory) hangs off their player record. A player exists only within its game; the same person taking part in two games has two independent player records.

In production you rarely create players by hand. The usual pattern is that the first time your application sends an event for a previously unseen id, the engine creates that player automatically, so your player list simply grows as real people start participating. Creating players in advance, in the console, is mainly useful for setting up a known starting cast, as this guide does, or for seeding accounts before launch. Either way, opening a player reaches their **details** page, the single place to inspect their totals, badges, level, challenges and inventory.

> **In Campus Quest.** Open **Players** and add five students: `alice`, `bob`, `carol`, `dave` and `eve`. Each is empty for now (zero points, no badges) because no events have happened; section 11 changes that. Opening any of them shows the details page you will return to throughout the later sections.

![The players list](/docs/images/players-list.png "The five Campus Quest students")

## 10. Teams

A **team** is a named group of players, but with an important twist: a team is itself a **scoreable entity**. It holds the same kind of state as a player (its own point scores, badges and level), so it is not merely a label over a set of members; it can earn, level up and be ranked in its own right. This lets a game reward collective activity separately from individual activity, and lets teams and individuals appear together on the same leaderboard.

Because a team scores like a player, it earns points the same way a player does: from events **addressed to the team**. When your application sends an event with a team's id in place of a player's, the engine runs the rules for the team and updates the team's own scores; this is how you reward genuinely team-wide activity such as a group study session. A separate, more advanced possibility is to have each member's *individual* activity roll up into their team's totals automatically, so that when a member attends a lecture the team's score rises too. That is not automatic and needs a specific rule pattern, which section 16 covers in full.

> **In Campus Quest.** Open **Teams** and create `Team Alpha` with members `alice` and `bob`, and `Team Beta` with `carol` and `dave`. That leaves `eve` with no team, which is fine; membership is optional. In section 11 both teams earn points from team-addressed events.

![The team form](/docs/images/teams-form.png "Team Alpha with alice and bob")

## 11. Sending events (playing the game)

Everything up to here has been design: you have described *what can happen* (actions), *what it is worth* (rules, points, badges, levels), and *who is playing* (players and teams). None of it does anything until the game is actually played, and playing is the one part that does not live in the console at all. It lives in your **application**.

An **event** is how the outside world tells the engine that something happened. When a real student attends a lecture or hands in an assignment, your application (a mobile app, a website, a backend job) sends the engine a short message saying "this player just did this action". The console is where you *design and observe* the game; your application is what *feeds* it. Each event is a single call to the engine's API, and the instant it arrives the engine does exactly what you watched in the simulator, only for real: it runs your rules for that player, adds points, grants any badges, and recalculates their level.

This is the one thing the console deliberately cannot do for you. There is no screen here that plays a game: no button that awards a point, no form that marks an action as done. Every real event reaches the engine through its API and no other way, which is why a game can be finished in the console and still show nothing happening until an application starts talking to it. The [API chapter](/guide/api) covers that side in full, and [what happens when a game runs](/guide/api/5) is the part that explains an execution from the call to the state it leaves behind. What follows here is enough to see the shape of it.

An event carries four things: **which game** it belongs to, **which player** did it, **which action** happened (an id from section 2), and any **extra data** the action needs (a `grade`, a number of `hours`). Concretely, your application logs in once to get an access token and then posts events. A plain event looks like this:

```
POST /api/v1/executions
{
  "gameId":   "<your game id>",
  "playerId": "alice",
  "actionId": "attend_lecture",
  "data":     {}
}
```

and one that carries data looks like this:

```
{ "playerId": "bob", "actionId": "submit_assignment", "data": { "grade": 24 } }
```

Giving a **team** points works identically: you send the event with the team's id in place of the player's, because a team is a scoreable entity too (section 10). If you would rather a team's score build up automatically from what its members do, rather than sending team-addressed events by hand, that is the propagation pattern in section 16.

> **In Campus Quest.** To reproduce the exact example state this guide relies on, send:
>
> - **alice**: `attend_lecture` twelve times, then `submit_assignment` with grade `30`, `use_library` with `4` hours, and one `join_event`.
> - **bob**: `attend_lecture` six times, `submit_assignment` with grade `24`, and one `join_event`.
> - **carol**: `attend_lecture` three times, and `use_library` with `2` hours.
> - **team-alpha**: `attend_lecture` eight times and one `join_event`.
> - **team-beta**: `attend_lecture` five times.
>
> Afterwards, open **alice**: she has 140 `study_points` (Sophomore), 3 `credits`, 20 `social_points`, and every badge including the secret `night_owl`. bob and carol have less, and both teams have points of their own. This accumulated state is what the leaderboards in section 15 rank.

![A populated player profile](/docs/images/execution-result.png "alice after her events: points, level and badges")

## 12. Challenges for a player

Where a challenge model (section 8) is a template, an assigned **challenge** is a concrete instance of it: a specific goal, with specific variable values and specific dates, handed to one player. A challenge has a **lifecycle**. It is usually created in a `PROPOSED` state, meaning the player has been offered it but has not committed; the player can then **accept** it, moving it to `ASSIGNED`, or decline it. This proposal step lets you offer challenges players can opt into rather than forcing goals on them.

There are two distinct ways a player comes to have a challenge, and it is worth separating them. The first is a **direct assignment**: you (or your application) create the challenge for the player outright. When your application does this through the API, it supplies the model's variable values in the request's `data`, for example `{"target": 200}`, exactly as it supplies event data. The second way is as a **level-up reward**: instead of assigning a fixed challenge, a level threshold can offer the player a *choice* of challenge, which lands in their inventory to activate when they wish (section 13). A threshold's reward is configured with a small block specifying how many choices the player gets and which models are available.

Everything in this lifecycle is also available over the engine's API, the same authenticated API your application uses to send events. Your app can assign a challenge, and the player can accept or decline it, directly from your own interface; from then on the player advances the challenge simply by sending the normal action events. So the console screens shown here each have a counterpart your application can call in production.

> **In Campus Quest.** Open **alice**, click **Assign challenge**, pick the `weekly_study_goal` model, name the instance `alice-weekly`, leave the initial state `PROPOSED`, set a start and end date, and save. It appears on her page as `PROPOSED`; clicking **Accept** moves it to `ASSIGNED`.
>
> For the level-up reward, revisit **Levels**, open the level, and on the **Sophomore** threshold add a threshold challenge configuration: set **number of choices** to `1` and add `weekly_study_goal` to the available models. Now crossing into Sophomore hands the player a choice, which section 13 picks up.

![Assigning a challenge](/docs/images/assign-challenge-form.png "Proposing weekly_study_goal to alice")

## 13. Player inventory and choices

A player's **inventory** holds things they have been granted but not yet spent, and the main thing it holds is challenge **choices**. When a player earns a choice (typically by crossing a level threshold configured with a reward, as in section 12), the inventory gains an available **activation**: a decision the player gets to make. Rather than the engine forcing a specific challenge on them, the player is handed agency, and they choose which of the offered challenges to activate.

Activating a choice spends it: the chosen challenge becomes active on the player, and the count of available activations drops accordingly. This is the mechanism that turns a level-up from a cosmetic title change into something the player *does*: reaching a milestone puts a decision in their hands. Alongside the player-driven activation, an admin **Force** control can activate a choice on the player's behalf, which is useful for testing the flow or for support overrides.

> **In Campus Quest.** Give `dave` ten `attend_lecture` events (the API way from section 11); this pushes him to 100 `study_points`, across the Sophomore threshold, so he earns the choice configured there. Open **dave** and look at the **inventory** section: it shows **Available activations: 1** and the `weekly_study_goal` choice with an **Activate** button. Click **Activate**; the challenge becomes active and the count drops to 0. The **Force** button does the same automatically.

![A player's inventory with a challenge choice](/docs/images/player-inventory.png "dave's level-up choice, ready to activate")

## 14. Group challenges

A **group challenge** sets several players against a shared objective, and it is a distinct feature from the individual challenges of section 12. The key difference is that a group challenge is not built from a model you define; instead you pick one of three **built-in types**, each defining how the members' progress combines and who wins:

- **groupCooperative**, shown as *Cooperative, the combined score must reach the target*: everyone's progress is added together and compared with the target. If the total reaches it, every member wins; if it falls short, nobody does. The engine also caps each member's contribution at what is still missing, so the last person to act cannot overshoot on everyone's behalf.
- **groupCompetitivePerformance**, shown as *Competitive, highest score wins*: the members are ranked against each other and the highest score wins. The target is not what decides the outcome here, so the winner is simply whoever gained most during the challenge, and a tie is shared rather than broken.
- **groupCompetitiveTime**, shown as *Competitive, everyone reaching the target wins*: each member is measured against the target on their own. Everybody who reaches it wins, so this is a race against the goal rather than against each other, and it can end with all of them winning or none.

In all three, what is measured is the progress a member makes on the chosen point concept **during** the challenge, not the total they already had, and a member's recorded progress never exceeds the target.

Like individual challenges, a group challenge has an invitation lifecycle. One player is the **proposer**, who sets it up and **invites** the others as **guests**; each guest may **accept** or **decline** before it begins, and the proposer may **cancel** it while it is still `PROPOSED`. This means a group challenge only starts among players who have opted in. Once it is accepted and running, it proceeds until its end date, at which point the engine settles it according to its type and awards the reward.

As with individual challenges, the whole invitation lifecycle is exposed over the API: your application can create the invitation, guests can accept or refuse, and the proposer can cancel, all through API calls rather than the console. This lets you run group challenges entirely inside your own app.

> **In Campus Quest.** Open **alice** and, in the group challenges area, click **Invite**. Select `bob` as a guest, choose the `groupCooperative` type, set the point concept to `study_points` and a combined **target** of `300`, set start and end dates and a reward, and send. The challenge shows as `PROPOSED` for both alice (proposer) and bob (guest); open **bob**, find the `study-buddies` challenge, and click **Accept** to move it to `ASSIGNED`.

![A group challenge invitation](/docs/images/group-challenge.png "alice's cooperative challenge, accepted by bob")

## 15. Leaderboards

A **leaderboard** ranks entities by a point concept, and it is where all the accumulated state from playing finally becomes a visible competition. A leaderboard is computed live from current scores, so it always reflects the latest state. There are two kinds, and the difference maps directly onto point-concept periods (section 3):

- **General**: an all-time ranking by a concept's total.
- **Incremental**: a ranking over one of the concept's **periods**, so it resets each window. This is how you get a "this week" or "this month" board that starts fresh while the all-time totals keep growing.

Because teams score like players (section 10), a leaderboard can rank individuals and teams together. A **scope** toggle at the top of the board switches between **Players** only, **Teams** only, and **All** together, with teams marked by a group icon so you can tell them apart. Separately, a general leaderboard can carry a **cron** schedule and a number of **positions to notify**; the cron is the schedule on which the engine hands out position rewards and notifications to the top finishers. The schedule governs rewards, not the ranking you see, which is always live.

> **In Campus Quest.** Open **Leaderboards** and create three. `overall_study` is General on `study_points`, with `3` positions to notify and a weekly cron. `weekly_study` is Incremental on `study_points` over the `weekly` period. `social_monthly` is Incremental on `social_points` over the `monthly` period. Open `overall_study`, click **Show**, and set the scope to **All**: the ranking is `alice` (140), `dave` (100), **Team Alpha** (80), `bob` (60), **Team Beta** (50), `carol` (40), `eve` (0). The incremental boards mirror the all-time one for now because every event landed in the current window, but in a running game each new period starts empty and fills as players act.

![A leaderboard board with the scope toggle](/docs/images/leaderboard.png "overall_study, All scope: players and teams ranked together")

## 16. Team scoring by propagation (advanced)

Section 10 gave teams points the simple way, with events addressed straight to the team. This section explains the more advanced alternative: making a team's score build up **automatically** from what its members do, so that when a member attends a lecture, their team's total rises too. This is not automatic behaviour you switch on; it is a pattern you write into your rules, and it is worth understanding as a recipe even though Campus Quest itself keeps the simple approach.

The reason it takes a special pattern is that, normally, an event only touches the one player it was sent for; nothing about scoring a player reaches their teams. To bridge that gap, two cooperating rules are needed. The first, the **player-side** rule, does its usual scoring and then raises a flag telling the engine "run this same action for my teams too". The engine responds by re-running the action for each of the player's teams. The second, the **team-side** rule, is what actually scores the team when that re-run happens. The two are told apart by matching `Player(team == false)` on the player side and `Player(team == true)` on the team side.

The engine carries the relevant numbers across for you. In rule terms, the flag is an `UpdateTeams` fact you `insert`, loaded via `addData` with whatever values the team rule will need; when the engine re-runs the action for a team, it hands those values to the team-side rule inside a `Transmission` fact. Here is the lecture rule from section 6 rewritten as a propagating pair:

```
package eu.trentorise.game.model

// player side: score the student, then ask the engine to update their teams
rule "study points for lecture (player)"
when
    Action( id == "attend_lecture" )
    Player( $pid : id, team == false )
    $pc : PointConcept( name == "study_points" )
then
    $pc.setScore($pc.getScore() + 10);
    update($pc);
    UpdateTeams ut = new UpdateTeams();
    ut.addData("playerId", $pid);
    ut.addData("points", 10);
    insert(ut);
end

// team side: when a member's lecture propagates here, score the team
rule "study points for lecture (team)"
when
    Transmission( $points : data["points"] != null )
    Player( team == true )
    $pc : PointConcept( name == "study_points" )
then
    $pc.setScore($pc.getScore() + ((Number) $points).doubleValue());
    update($pc);
end
```

Swapping the single `study_points_lecture` rule for this pair makes every lecture a member attends also lift their team's `study_points`, with no team-addressed events needed. The reverse direction, a team action cascading down to each member, works the same way using an `UpdateMembers` flag and a `Team` fact on the member side. Two things are essential: put the values you need into `addData` (an empty `UpdateTeams` carries nothing, so the team rule would have nothing to read), and always guard the two rules with `team == false` and `team == true` so each fires only in the right place.

## 17. Blocking players

Sometimes two players should not be paired, for instance after someone misbehaves in a shared activity. To support this, each player can keep a **blocked list**: other players they will not be matched with. The immediate, concrete effect is on group challenges (section 14): a player on your blocked list does not appear as an option when you invite guests, so the block quietly prevents the pairing rather than having to be enforced case by case.

Blocking is **per player** and **one-directional**. The block lives on the blocker's record and affects only their matching; alice blocking eve keeps eve out of alice's invitations, but does nothing to stop eve from listing alice. Reversing a block is just removing the entry from the list.

Blocking and unblocking are API calls too, so your application can manage a player's blocked list directly, for example offering a "block this player" control in your own interface.

> **In Campus Quest.** Open **alice**, find the **blocked players** area, and block `eve`; she now appears in alice's blocked list and will not surface when alice invites guests to a group challenge. Removing `eve` from the list lifts the block.

![A player's blocked list](/docs/images/block-player.png "alice has blocked eve")

## 18. Notifications

**Notifications** are the engine's record of the meaningful moments in play: a badge earned, a challenge won or lost, a leaderboard position reached. They are produced automatically as the game runs, both by your rules (each badge rule in section 6 sends one) and by scheduled tasks such as leaderboard cron runs. It helps to be clear about where they surface. The console shows brief pop-ups for actions you take inside it, but a player's notification *history* is meant to be read by your application through the API and shown in your own interface, over the same channel that sends events and reads state. In other words, the console is the operator's view; the player's view is something you build.

## Conclusion

You have now seen the whole engine, end to end. A game gives you a vocabulary of actions; point concepts, badges and levels turn those actions into scores, awards and ranks; rules tie everything together, and the simulator lets you prove they behave before any real player is touched. On that foundation, challenges (individual and group), inventories and choices give players goals and agency; players and teams accumulate state from the events your application sends; leaderboards turn that state into competition; and team scores can even be made to roll up automatically.

The point to carry away is that none of this is specific to studying. Campus Quest was only a lens: every concept here is reusable. Swap in your own actions, point concepts and rules, and the same building blocks model any score-based experience, whether that is a fitness tracker, a customer-loyalty program, or an internal engagement platform. The console never assumes what your game is about; it only gives you the parts.

A good next step is to make the example your own. Change a rule and re-run its scenario to watch the saved test catch the difference; add a new action and reward it; invent a badge and write the rule that grants it. Once the pieces feel familiar, start a fresh game and build for your own domain, and come back to any section here when you need to check exactly how a feature behaves. The guide is meant to be read once from front to back, then kept as a reference.

When the design stops being the hard part and connecting a real application does, carry on to the [API chapter](/guide/api). It is the same engine seen from the other side: how to get a token, how to reach each of the things you built here from code, and how an event becomes a score.
