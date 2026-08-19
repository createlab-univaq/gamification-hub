# GamificationHub: an overview

GamificationHub turns rules into a game. You describe what the people using your application can do, what each of those things is worth, and what they add up to; the platform keeps score for everyone, forever, and tells you where they stand.

It is not a game, and it is not a replacement for your application. It is the scorekeeper the two of you agree on: your application reports what happened, the platform decides what it means, and both sides stay responsible for what they already do well. Nothing here assumes what your game is about. The same parts model a fitness tracker, a customer loyalty scheme and a university engagement programme, because none of them are built into the platform: they are built out of it.

### What the platform does

A game here is a set of definitions and a set of rules. The definitions are the nouns: the **actions** that can happen, the **point concepts** that hold scores, the **badges** that can be earned, the **levels** that rank people, the **challenge models** that set goals. The rules are the verbs, and they are where the game actually lives: when this happens, add that; when this score passes that number, grant this badge.

**Designing one takes no code.** Every part of a game is a form in the console: name an action, add a score, create a badge collection, set the thresholds of a level, describe a challenge, put players into teams, open a leaderboard. There is nothing to generate, nothing to deploy and nothing to keep in step by hand. The game you describe is the game that runs, and you can change your mind about any of it later without asking anyone.

**The rules are the one part that is genuinely logic**, and the only place where anything resembling programming remains. A rule decides when something should happen and what should happen, and that is a small program however it is written. So the console gives you a visual editor instead of a blank page: you assemble a rule out of blocks that only fit together in ways that make sense, and the code is written out for you as you go. You can read that code, and type in it directly if you would rather, but you never have to start from it.

**Testing comes before anything real.** A game can be run against an invented player whose starting state you make up: a score here, an empty collection there, one action to fire. What comes back is not a yes or no but the whole story, which rules fired and what each of them changed. Once you know the answer is right you save it as the expected result, and from then on that run is a test you can repeat after every change. No real player is touched by any of it.

**Shipping is just saving.** There is no publish step and no build to wait for: a saved rule applies to the next event that arrives. The only code anybody writes is in your own application, and it is a short list — report what somebody did, read back what they have earned. Everything between those two is the game you designed.

So the division of labour ends up an honest one. The platform holds no opinion of its own: it has no built-in idea of a good score, no default reward and no scoring you cannot see. What it takes off your hands is the machinery, and what it leaves you is the part that was always yours, which is deciding what deserves to be rewarded.

### The pieces, and how they fit together

Three things make up the platform, and they meet at the rules.

The **console** is the web application you are reading this in. Every part of a game is created and inspected here: actions, scores, badges, levels, challenge models, players, teams, leaderboards, and the rules that connect them. It is also where a game is tested, against invented players, before anything real touches it.

The **rule engine** is the part that actually runs. Rules are written in the language of Drools, a mature rule engine embedded in the platform, and the console gives you both a visual editor and the code, kept in step. When an event arrives, the engine puts the facts of the moment in front of every rule and lets the ones that match fire.

The **API** is how a game is played. It is a normal HTTP interface, and it is the only way in: your application sends events, reads player state, and manages challenges through it. The console itself uses nothing else, so anything you can do by hand you can do from code.

Underneath, the platform stores every game, rule and player state on the server, and runs scheduled work on a timetable you set, such as handing out leaderboard rewards. You configure that; you do not operate it.

### How this guide is organised

Three chapters follow this one, in the order a game is usually built.

**[The Console](/guide/console)** is the long one, and the place to start. It walks through every concept in the order you would create it, from making a game to sending its first events, and explains each idea before using it: actions, point concepts and their periods, badges, levels, rules, simulation, challenges, players, teams, leaderboards, notifications. Read it front to back once and the platform stops being surprising.

**[The rule builder](/guide/builder)** goes deeper into one screen: the visual editor, block by block. What each block writes, what can connect to what, how the blocks and the code stay in step, and how to validate a rule before saving it. Read it when the console chapter has you writing rules and you want to stop typing them.

**[The API](/guide/api)** is the same platform from the other side, for whoever is wiring an application to it: authentication, the endpoints grouped by what they address, and what happens during an execution. Read it when the design is settled and something real has to talk to the engine.
