# Building rules without writing code

A rule is the only part of a game that is really a program. Everything else you create in the console is a declaration: an action has a name, a badge has a collection, a level has thresholds. A rule has conditions, branches and side effects, and it is written in the language the embedded Drools engine reads. The builder exists so that you do not have to learn Drools before you can write your first working rule.

It is a two-panel editor. On the left you assemble a rule out of blocks that snap together; on the right the Drools code those blocks describe is written out as you work, and you can type in it directly. Neither side is the "real" one in the sense of being the only one that counts, but one of them is the source of truth, and knowing which saves a great deal of confusion later. This chapter covers what each block does, what it turns into, what can plug into what, and where the two views stop agreeing perfectly.

If you have not read [section 6 of the console chapter](/guide/console/6) yet, start there. It explains what a rule *is*: the facts the engine puts in front of your conditions, and the handful of them you will match on almost every time. This chapter assumes that and concerns itself with the editor.

---

## 1. Two views of the same rule

What gets saved is the Drools code. Not the blocks, not their positions on the canvas: the rule you store against your game is the contents of the right-hand editor, and that is what the engine compiles. The blocks are a way of producing and inspecting that text, and they are rebuilt from it whenever the text changes.

That has a practical consequence worth taking on board early. Opening an existing rule does not restore the canvas you left behind, because the canvas was never saved. The stored code is parsed, blocks are created to match it, and they are laid out fresh from the top left. A rule you built in a careful arrangement will come back tidy but rearranged, and nothing is lost by it, because the arrangement never meant anything to the engine.

It also means the two panels are not two editors competing for the same document. The blocks describe the text. The text can be edited directly, and the blocks catch up. Anything Drools can express that no block covers can still be typed, and it will survive as long as the parser understands it well enough to give it a block to live in, which is what the raw blocks in each category are for.

## 2. The workspace

The editor fills the page in three resizable panels. The **canvas** is the large one on the left, where blocks are dragged out of the toolbox and joined together. The **code editor** is on the right, a proper code editor with line numbers, bracket matching and Java-flavoured syntax highlighting. The **message console** is hidden until you ask for it and opens under the canvas.

Every panel divider can be dragged, and each panel can be collapsed to the edge and brought back. Hovering a divider reveals a small set of controls for exactly that: collapse the panel on one side, expand it to fill the space, or grab the handle and drag. If you prefer to work entirely in blocks, collapse the code editor; if you would rather write Drools by hand and use the canvas only to check your structure, collapse the canvas.

The canvas behaves the way a Blockly workspace does. The mouse wheel zooms, dragging the background pans, there are zoom controls in the corner, and a trashcan accepts blocks you want rid of. Blocks snap to a grid, so a rule you assemble stays roughly aligned without any effort. The colours follow the console's own light and dark themes, and switching theme re-skins the canvas immediately.

At the top of the page sit the rule's **name** and three buttons. The name is a plain text field and starts empty for a new rule; it is required before you can save, and it is the name the rule is listed under. **Validate** compiles what you have without storing it. **Save** stores it. **Console** shows or hides the message panel, which is where validation results and any parse complaints appear.

![The rule builder workspace](/docs/images/rule-builder-area.png "The builder workspace: canvas, code editor and message console")

## 3. Keeping blocks and text in step

The two views synchronise in both directions, each on a short delay of about four tenths of a second so that neither fights your typing. Change anything on the canvas and the code is regenerated from the whole workspace. Type in the code editor and the text is parsed, and the canvas is rebuilt from the result.

Regeneration is wholesale rather than incremental. The generator walks the workspace and writes the file out from scratch in a fixed order: imports first, then globals, then declared types, then functions, then rules. Where you happen to have placed things on the canvas has no effect on that order. Two rules on the same canvas are emitted in the order they sit top to bottom, the leftmost winning between two at the same height, but rules always come after functions no matter where you dragged them.

When the code will not parse, the canvas is left exactly as it was and the failure is reported in the message console as an error. This is the normal state of affairs while you are halfway through typing a pattern, and it is not something to worry about: the blocks simply stop tracking until the text is coherent again. A failure in the other direction, where the workspace cannot be turned into text, is reported as a warning instead. Both are reasons to keep the console open when you are working in the text panel.

One thing does not survive the round trip, and it is worth knowing before it surprises you: formatting. Comments, blank lines and your own indentation are not preserved, because what comes back is printed from the parsed structure rather than kept verbatim. What a rule *says* does make the journey in both directions, its five attributes included, so the text you get back is the same rule differently laid out rather than a lesser version of it.

## 4. The blocks, category by category

The toolbox has five categories holding thirty-nine distinct blocks, with forty entries in total because `return` is offered in two places. Each category is colour-coded, and a block's colour is the quickest way to tell where it belongs once your canvas has a few dozen on it.

### Globals

Everything that lives outside a rule: what the file imports, what it declares, and the helper functions it defines. In a gamification rule you will usually need nothing here beyond a couple of imports.

| Block | What it is for | What it writes |
|---|---|---|
| `imports` | Container for the package line and the import chain | Each contained line, one per line |
| `package` | The rule file's package. Belongs **inside** the imports container | `package eu.trentorise.game.model` |
| `import` | One Java import, with the engine's own classes suggested | `import eu.trentorise.game.model.PointConcept;` |
| `globals` | Container for global declarations | Each contained global |
| `global` | A value made available to every rule | `global com.example.MyService myService;` |
| `declare` | A custom fact type of your own | `declare MyFact` … `end` |
| `attribute` | One typed field inside a `declare` | `myField : String` |
| `function` | A helper function, its body built from consequence blocks | `function void myFunction() { … }` |
| `return` | Returns from a function, with or without a value | `return expr;` or `return;` |

![The Globals category](/docs/images/rule-builder-globals.png "The Globals blocks")

### Rules

One block, and the one every rule starts from. It carries the rule's name, its five attributes, and the two statement sockets that hold the conditions and the consequences.

Salience decides firing order when several rules match, highest first, and is left out of the output when it is zero. The agenda group and the ruleflow group are omitted when blank, and both are written out quoted, because Drools expects a string there and rejects the rule outright without it. `no-loop` and `lock-on-active` are always written, whether ticked or not. Leave the `when` or `then` socket empty and the rule is still emitted, with a comment standing in for the missing half, so an unfinished rule still compiles rather than breaking the file.

```
rule "study_points_lecture"
    salience 10
    no-loop true
    lock-on-active false
    when
        Action( id == "attend_lecture" )
        $pc : PointConcept( name == "study_points" )
    then
        modify($pc) { setScore($pc.getScore() + 10) }
end
```

### Conditions

These fill a rule's `when`. Patterns match facts; the rest combine or qualify those patterns.

| Block | What it is for | What it writes |
|---|---|---|
| `binding / type` | A fact pattern bound to a variable, with constraints inside | `$pc : PointConcept( … )` |
| `type` | The same without a binding, for use inside `not` and `exists` | `PointConcept( … )` |
| `not` | Matches when the inner condition does not hold | `not( … )` |
| `exists` | Matches when at least one fact satisfies the inner condition | `exists( … )` |
| `forall` | Matches when every fact satisfies the inner condition | `forall( … )` |
| `AND group` | Explicit grouping of several conditions | `( a b )` across lines |
| `OR group` | Matches when any one of the grouped conditions holds | `( a or b )` across lines |
| `from` | Draws a pattern from a collection or expression | `$x : Type( … ) from $collection` |
| `eval` | An arbitrary boolean expression | `eval( expression )` |
| `raw condition` | Drools code inserted exactly as typed | whatever you type |

`not`, `exists`, `forall` and `from` each take a single inner condition, and only the first one in the socket is used. Stacking two patterns inside a `not` will silently ignore the second. To negate a combination, put an `AND group` inside the `not` and stack the patterns in there.

![The Conditions category](/docs/images/rule-builder-conditions.png "The Conditions blocks")

### Constraints

These go inside a pattern, and describe what the matched fact must look like. A pattern collects however many you stack in it and writes them out comma-separated inside its brackets.

| Block | What it is for | What it writes |
|---|---|---|
| `field operator value` | Compares a field. The operator list covers `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `not contains`, `memberOf`, `not memberOf`, `matches` and `not matches` | `name == "study_points"` |
| `binding : field` | Captures a field's value into a variable for use in the `then` | `$val : score` |
| `raw` | A constraint expression inserted as typed | `score != null` |

### Consequences

These fill a rule's `then`, and they are also what a function's body and every loop or branch body is built from. This is the largest category, because it covers ordinary programming as well as the engine-specific actions.

| Block | What it is for | What it writes |
|---|---|---|
| `modify` | Changes a bound fact by calling setters on it. This is how scores and badges are actually awarded | `modify($pc) { setScore(50) }` |
| `call method ( args )` | One call inside a `modify`, several separated by commas | consumed by `modify` |
| `insert` | Puts a new fact into working memory | `insert(new Object());` |
| `retract` | Removes a bound fact from working memory | `retract($pc);` |
| `global` | Runs a statement, typically a call on a global | `utils.log("msg");` |
| `while` | A while loop | `while (cond) { … }` |
| `for ( type var : collection )` | A for-each loop over a collection | `for (Object item : $collection) { … }` |
| `for ( init ; cond ; update )` | A counted loop | `for (int i = 0; i < n; i++) { … }` |
| `instantiate` | Declares and initialises a local variable | `String myVar = new String();` |
| `call obj . method ( args )` | Calls a method on something | `$obj.method();` |
| `switch` | A switch over an expression, holding cases | `switch ($variable) { … }` |
| `case` | One case inside a switch | `case "value": …` |
| `default` | The fallback case inside a switch | `default: …` |
| `if` | A conditional with one branch | `if (cond) { … }` |
| `if / else` | A conditional with both branches | `if (cond) { … } else { … }` |
| `return` | Returns, mainly for function bodies | `return expr;` |
| `code` | Java or MVEL inserted as typed, with a semicolon added if you omit one | whatever you type |

Chaining an `if` straight into the `else` socket of an `if / else` is recognised and written as `else if` rather than as a nested block, so a run of conditions reads the way you would have written it by hand.

![The Consequences category](/docs/images/rule-builder-consequences.png "The Consequences blocks")

## 5. What can connect to what

Blocks will not join in combinations that could not compile, which is most of the validation you get for free. Each socket accepts one kind of block, and the notch shapes follow the same rule, so an attempt to drop a consequence into a `when` simply will not stick.

The kinds are straightforward once listed. Conditions go in a rule's `when` and inside the grouping and negation blocks. Constraints go only inside a pattern. Consequences go in a rule's `then`, in a function body, and in the body of every loop, branch and case. Import lines go only inside the imports container, globals only inside the globals container, attributes only inside a `declare`. A `call` belongs only inside a `modify`, and `case` and `default` only inside a `switch`.

The containers themselves join nothing. `imports`, `globals`, `declare`, `function` and `rule` have no notches at the top or bottom, because they are the outermost things in a file and sit directly on the canvas.

Which brings up the one trap in the whole editor. **Only blocks recognised at the top level are written out**, and the recognised list is exactly the imports container, a lone import, the globals container, a lone global, declared types, functions and rules. Anything else left loose on the canvas contributes nothing to the file. A stray pattern parked to one side while you rearrange a rule is not an error and will not be reported; it simply is not part of the output.

The `package` block is the one that catches people, because it is not on that list at all. Despite living in the Globals category it is only picked up **inside** the imports container, so dropped on its own it does nothing, and a rule that needs a package line but has that block sitting loose beside the imports comes out without one. A single `import` or `global` is more forgiving and works either way, inside the container or by itself on the canvas, which is exactly why the `package` behaving differently is easy to miss.

If a block seems to have no effect on the generated code, this is nearly always why: check that it is inside something, and that the something is one of the five.

## 6. Bindings, suggestions and fact types

Bound variables in Drools start with a `$`, and on a fact pattern the builder handles that for you. Its binding field holds the bare name and the `$` is added when the code is written. Typing one in anyway is fine, because the field strips it, so `$pc` and `pc` both end up as `$pc` in the output and there is no way to produce `$$pc`.

Elsewhere the `$` is part of the value rather than added to it. The `modify` and `retract` blocks write their binding out exactly as the field holds it, which is why the values they suggest already include the `$`. Picking a suggestion is therefore always right, and typing one of those by hand means typing the `$` as well; leaving it off produces `modify(pc)`, which is not the variable you bound.

Some fields suggest values as you type them. The fact type on a pattern offers the fact types the engine puts in working memory, and the import block offers their fully qualified names, so an import can be filled in without looking anything up. The types on offer are `Action`, `InputData`, `PointConcept`, `BadgeCollectionConcept`, `ChallengeConcept`, `CustomData`, `Player`, `Game`, `GroupChallenge` and `Reward`. These are suggestions rather than a closed list, and anything else can be typed over them.

The `modify` and `retract` blocks suggest something more useful still: the bindings that actually exist on your canvas. Both read the bound patterns from the workspace and offer their variables, which means the `then` half of a rule can be assembled by picking from what the `when` half has already bound, and a typo between the two halves is much harder to make.

## 7. Validating, saving and taking effect

**Validate** sends what is in the code panel to the engine and compiles it there, without storing anything. This is the same compilation the game does when it runs, so it is the real answer rather than an approximation. A clean result is confirmed with a brief notification. Anything else opens the message console and lists the results with their severity: errors mean the rule will not compile, warnings mean it will but something looks questionable. Validating costs nothing and needs no player, so there is no reason not to do it before every save.

**Save** stores the rule against the game. It needs both a name and something in the code panel, and stays disabled until it has them. Saving a rule for the first time also moves you to that rule's own address, so the next save updates it instead of creating a second copy; after that, saving keeps you in the editor and reloads what was stored.

Because the rule you are editing is only text on a page until it is saved, leaving with unsaved changes is worth a warning, and you get one. Navigating away from a modified rule asks for confirmation first, and that includes the browser's own back button and closing the tab. The comparison ignores whitespace, so reformatting alone does not count as a change.

Saving is also the moment a rule starts to matter. The engine compiles a game's rules once and reuses them, throwing that away whenever a rule is saved, edited or deleted; the next execution then compiles afresh. That is why a saved rule takes effect immediately, and why a rule that only ever existed in this editor takes effect never. It is the single most common reason for a rule that "does not fire".

From here, [section 7 of the console chapter](/guide/console/7) is the natural next step: a compiled rule is not necessarily a correct one, and the simulator runs your rules against a made-up player so you can see which fired and what changed before any real player is involved. When you are ready to send real events, that is the [API chapter](/guide/api).
