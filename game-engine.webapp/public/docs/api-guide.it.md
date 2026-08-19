# Guidare un gioco dalla tua applicazione

La console non fa niente di magico: chiede tutto a queste API, e puoi chiederlo anche tu. Nella console un gioco si progetta, con le API un gioco si gioca. La tua applicazione racconta cosa hanno fatto le persone, il motore decide cosa significa, e punteggi, medaglie, livelli e sfide arrivano dalle regole scritte nella console.

Chi progetta un gioco, di questo capitolo non ha quasi bisogno. E un'applicazione che ne fa girare uno se la cava con pochi endpoint: manda un evento, leggi un giocatore, leggi una classifica. Il resto c'è perché prima o poi vorrai fare dal codice quello che la console fa dalle sue schermate, e non c'è nulla che ti sia precluso.

Qui sotto trovi un gruppo di endpoint alla volta: a cosa serve, cosa vuole ricevere, cosa restituisce. Dove una richiesta ha un corpo c'è un esempio con valori di esempio, così ne vedi la forma senza passare da uno schema e i campi obbligatori sono segnalati.

Il dettaglio campo per campo, invece, lo dà il servizio stesso. Su [**Swagger UI**](https://gamification-api.createlab-univaq.it/swagger-ui/index.html) trovi ogni endpoint con lo schema completo, e da lì puoi anche provarlo; la stessa descrizione in forma grezza sta su [`/v3/api-docs`](https://gamification-api.createlab-univaq.it/v3/api-docs). Sono generate dal servizio in funzione, quindi saranno sempre la prima fonte di verità ed il punto di partenza di questa guida.

Attenzione a un dettaglio: queste sono esposte dall'**API**, non dalla console, quindi vivono a un altro indirizzo. I link qui sopra portano all'istanza pubblicata. Se il motore lo stai facendo girare tu, gli stessi due percorsi stanno sull'host e sulla porta che gli hai dato: in locale, di solito, `http://localhost:8081/swagger-ui/index.html` e `http://localhost:8081/v3/api-docs`.

Ancora due cose prima di partire. Tutti i percorsi che seguono stanno sotto `/api/v1`: nelle tabelle lo omettiamo per non appesantirle, ma c'è sempre. E un gioco è privato dell'account che lo possiede, quindi si comincia praticamente sempre procurandosi un token.

---

## 1. Come si incastrano i pezzi

I nomi delle cose sono quelli del [capitolo sulla console](/guide/console), dove ognuna è spiegata per bene: un gioco contiene azioni, concetti di punteggio, medaglie, livelli, modelli di sfida, giocatori, squadre e classifiche, più le regole che li tengono insieme. Diamo per scontato che tu li conosca già; qui interessa solo come si raggiungono via HTTP.

Da questa struttura escono due conseguenze che pesano su quasi ogni richiesta. La prima: **tutto gira attorno al gioco**. Il gioco possiede ognuno di quei pezzi, appartiene a un account solo, e il suo id compare in quasi ogni percorso. Ecco perché un token che apre un gioco non apre nulla di un altro. La seconda: **il motore si comanda con gli eventi, non scrivendo lo stato**. Non comunichi che un giocatore ha guadagnato cinquanta punti; comunichi che ha fatto qualcosa, e quanto vale lo decidono le regole. Gran parte degli errori contro queste API nasce dal cercare un setter che non esiste: la risposta, quasi sempre, è mandare un'azione e lasciar lavorare le regole.

Un'ultima avvertenza, utile prima di mettersi a caccia di un id: non tutto si indirizza allo stesso modo. Giochi, regole, concetti di punteggio, medaglie, modelli di sfida, classifiche e scenari ricevono un id alla creazione, e va quello nel percorso. Azioni, livelli, giocatori, squadre e istanze di sfida si chiamano invece col nome che gli hai dato, perché per loro il nome *è* l'identità. Da qui anche il fatto che rinominarli non sia previsto, o equivalga a crearne un altro.

## 2. Autenticazione e autorizzazione

Il token può arrivare in due modi:

1. **cookie httpOnly** chiamato `token`, quello dell'applicazione web nel browser.
2. **header `Authorization: Bearer <token>`**, per chi non è un browser (giochi mobile, servizi) e coi cookie non può contare.

Il token e la verifica di esso sono sempre li stessi: cambia solo come lo usi.

### Accesso

```
POST /api/v1/auth
{ "username": "...", "password": "...", "origin": "WEBAPP" | "GAME" }
```

- `origin` è **obbligatorio**, ma non tocca né la durata del token né cosa ti permette di fare: decide **come viene restituito**.
  - L'header `Set-Cookie: token=...` arriva **sempre**, ed è httpOnly: nessuno script del browser può leggerlo.
  - Nel corpo della risposta (`{"user": {...}, "token": "..."}`) il token compare **solo** con `origin: "GAME"`. A un browser non lo mandiamo mai in chiaro, altrimenti la protezione httpOnly non servirebbe a nulla.
- Un token vale 24 ore, da qualunque origine sia stato chiesto.
- `POST /api/v1/auth/logout` cancella il cookie. Chi usa il bearer semplicemente lo butta.

### Altri endpoint dell'account
| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/auth/user` | L'utente autenticato in questo momento |
| `POST` | `/auth/register` | Creare un account |
| `PUT` | `/auth/update-user` | Cambiare username o password |
| `DELETE` | `/auth/deactivate` | Disattivare il proprio account |

### Chi identifica il token, e chi sono i tuoi giocatori

Il token identifica **il tuo account**, non un tuo giocatore. Nel motore i giocatori non fanno login: il loro record contiene punteggi, medaglie e sfide, ma non ha credenziali proprie. Ogni richiesta relativa a un gioco viene autorizzata verificando che l'account dietro al token sia il proprietario di quel gioco: per il motore esiste quindi un solo chiamante, la tua applicazione.

L'autenticazione delle persone resta perciò un compito del tuo gioco, e il punto di collegamento fra i due sistemi è **l'id del giocatore**. Lo scegli tu: `POST /games/{gameId}/players` riceve l'id nel corpo della richiesta invece di generarlo, e inviare un evento per un id inesistente crea quel giocatore proprio con l'id che hai usato. Quando un utente accede al tuo gioco, quindi, sei tu a conservare nel suo account l'id che gli corrisponde nel motore, e ogni chiamata che fai a suo nome usa quell'id. Qualunque cosa siano i tuoi utenti dalla tua parte, una riga in una tabella o un soggetto SSO, per il motore sono quell'id: del loro nome e della loro password non sa nulla.

Da qui la regola su dove tenere il token. Un token che finisce in un browser o in un'app distribuita può inviare eventi a nome di **qualsiasi** giocatore, perché nella richiesta non c'è nulla che indichi chi sia la persona reale. Conservalo sul tuo server, decidi lì quale id inserire in ogni chiamata, ed effettua le chiamate dal server.

### Fin dove arriva un token

Un gioco appartiene a un account solo. Ogni endpoint legato a un gioco, prima di fare qualsiasi cosa, si chiede sempre la stessa cosa: l'account dietro questo token possiede questo gioco? Se la risposta è no, arriva un `403` con `errorCode: "user_not_authorized"`. Vale per il gioco e per tutto ciò che gli sta sotto: regole, giocatori, le sfide di un giocatore, la tabella di una classifica.

Autenticarsi, insomma, non basta. Un token valido ti porta sui tuoi giochi e si ferma lì: niente condivisione, niente ruoli interni a un gioco, nessun amministratore che possa entrare in quelli degli altri. Se poi l'id del gioco non esiste proprio, la risposta è `404` e non `403` — così un id sbagliato e l'id di un altro restano due cose diverse.

Con l'esportazione siamo più severi ancora: un gioco che non è tuo viene rifiutato con `errorCode: "export_forbidden"`, anche dove una semplice lettura sarebbe passata.

## 3. Gli endpoint disponibili

Ogni gruppo elenca i suoi endpoint e poi mostra com'è fatta la richiesta, dove ne serve una. I valori sono inventati: conta quali campi esistono e quali sono obbligatori. Gli endpoint senza corpo li descrivono già per intero il percorso e i parametri in query.

Chi elenca filtra con i parametri in query (`?name=...`). I paginati — giocatori, notifiche, tabelle delle classifiche — accettano inoltre `page`, `size` e `sort`, e avvolgono i risultati in `{content, totalElements, number, ...}`.

### Giochi — `/games`
Il gioco in sé, più importazione, esportazione e analisi statica delle regole.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/games` | Elenca i giochi che possiedi (filtri: `?name=`, `?domain=`, `?terminated=`) |
| `POST` | `/games` | Crea un gioco (senza id) |
| `GET` | `/games/{gameId}` | Legge un gioco |
| `PUT` | `/games/{gameId}` | Aggiorna nome, dominio, scadenza e stato; **non** tocca azioni, regole o concetti, che hanno endpoint propri |
| `DELETE` | `/games/{gameId}` | Elimina un gioco |
| `POST` | `/games/import` | Importa giochi interi |
| `GET` / `POST` | `/games/{gameId}/export` / `/games/export` | Esporta uno o più giochi interi |
| `GET` | `/games/{gameId}/impact` | Come si legano fra loro le regole del gioco (sperimentale, vedi sotto) |

Per creare un gioco bastano un nome e un dominio; il resto si aggiunge poi, dai rispettivi endpoint.

```http
POST /api/v1/games
{
  "name": "Il mio gioco",
  "domain": "mio-dominio"
}
```

`PUT /games/{gameId}` vuole gli stessi campi e si limita a quei dati.

**Importazione ed esportazione ragionano per giochi interi.** Quello che si scambiano non è un gioco, però, ma un pacchetto in quattro parti: il gioco, i suoi modelli di sfida, le sue regole, i suoi scenari. `GET /games/{gameId}/export` ti dà esattamente un pacchetto del genere; `POST /games/import` ne vuole una **lista**, anche per importarne uno soltanto:

```http
POST /api/v1/games/import
[
  {
    "game": {
      "name": "Il mio gioco",
      "domain": "mio-dominio",
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

`game`, `challengeModels` e `rules` ci devono essere tutti, anche da vuoti; solo `scenarios` si può lasciare fuori. Scriverne uno a mano, comunque, non è la strada: esporta un gioco che hai già, modifica il risultato e rimandalo. Le uniche regole che entrano davvero sono quelle del `rules` in cima al pacchetto. Il campo `rules` dentro `game` viene scartato all'ingresso: quello che ci scrivi non conta, e riempirlo non serve a niente. Per questo nell'esempio qui sopra è vuoto. Chi mette le sue regole solo lì dentro si ritrova un gioco importato senza nemmeno una regola.

Per esportarne più di uno basta la lista degli id:

```http
POST /api/v1/games/export
["{gameId}", "{unAltroGameId}"]
```

`/impact` ricava come le regole si influenzano a vicenda senza eseguirne nemmeno una. È sperimentale, e il modo in cui sbaglia conta: un legame che non riesce a risolvere lo scarta in silenzio, senza dirtelo. Un risultato vuoto significa quindi "non ho trovato niente", non "non c'è niente"; per verificare davvero resta `/executions/simulations`.

### Azioni — `/games/{gameId}/actions`
Il vocabolario di eventi a cui il gioco reagisce. Un'azione è solo un nome.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/actions` | Elenca le azioni del gioco (filtro: `?name=`) |
| `POST` | `/actions` | Aggiunge un'azione |
| `PUT` | `/actions/{actionId}` | Rinomina un'azione |
| `DELETE` | `/actions/{actionId}` | Rimuove un'azione |

```http
POST /api/v1/games/{gameId}/actions
{
  "name": "attend_lecture"
}
```

Il motore però muove anche eventi suoi, riconoscibili dal prefisso riservato `scogei_`, che nascono da soli quando una funzionalità ne ha bisogno: una classifica pianificata si porta dietro `scogei_classification`. In `GET /actions` non li vedi, rinominarli o cancellarli non si può, e un nome tuo che cominci per `scogei_` viene rifiutato con `action_name_reserved`. Le regole, al contrario, li intercettano benissimo: `Action( id == "scogei_classification" )` è proprio il modo di reagire al calcolo di una classifica.

### Regole — `/games/{gameId}/rules`
Script Drools, uno per documento.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/rules` | Elenca le regole del gioco (filtro: `?name=`) |
| `GET` | `/rules/{ruleId}` | Legge una regola |
| `POST` | `/rules` | Crea una regola |
| `PUT` | `/rules/{ruleId}` | Sostituisce una regola |
| `DELETE` | `/rules/{ruleId}` | Elimina una regola |
| `POST` | `/rules/validate` | Compila senza salvare |

`gameId`, `name` e `content` sono obbligatori, anche quando validi:

```http
POST /api/v1/games/{gameId}/rules
{
  "gameId": "{gameId}",
  "name": "study_points_lecture",
  "content": "package eu.trentorise.game.model\n\nrule \"study points\"\nwhen\n    Action( id == \"attend_lecture\" )\n    $pc : PointConcept( name == \"study_points\" )\nthen\n    $pc.setScore($pc.getScore() + 10);\n    update($pc);\nend"
}
```

`POST /rules/validate` vuole lo stesso corpo identico e risponde con un elenco di messaggi, vuoto se la regola compila. Non salva nulla, e conviene passarci prima di creare davvero: una regola che non compila, se la salvi, resta lì e fa saltare la prima esecuzione del gioco.

**I nomi sono due, non uno.** Il `name` del documento è quello con cui la regola si indirizza dalle API; la stringa dentro `rule "..."` è quella con cui la conosce Drools. Non hanno legami tra loro. Un errore di nome duplicato riguarda il nome per Drools, e vuol dire che un'altra regola dello stesso gioco dichiara lo stesso: la regola che stai modificando è esclusa dal controllo tramite il suo id, quindi cambiarle il nome Drools non crea problemi.

### Concetti di punteggio — `/games/{gameId}/point-concepts`
Un punteggio con un nome, tenuto per ogni giocatore e per ogni squadra.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/point-concepts` | Elenca i concetti del gioco |
| `GET` | `/point-concepts/{pointId}` | Legge un concetto |
| `POST` | `/point-concepts` | Crea un concetto |
| `PATCH` | `/point-concepts/{pointId}` | Aggiorna un concetto |
| `DELETE` | `/point-concepts/{pointId}` | Elimina un concetto |

Obbligatorio c'è solo `name`; un concetto nuovo parte da `score: 0`.

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

La parte interessante sono i **periodi**. Ogni voce descrive una finestra che si ripete: `start` è obbligatorio e fissa la griglia su cui cadono le finestre, `end` può essere `null` per un periodo che non si chiude mai, `period` è quanto dura una finestra **in millisecondi**, `capacity` dice quante finestre passate conservare. Rileggendo il concetto trovi anche le `instances` di ogni periodo, cioè le finestre già trascorse col loro punteggio: sono calcolate, non si scrivono.

**Una `PATCH` tocca tutti i giocatori.** Modificare un concetto riscrive i campi di definizione dei suoi periodi nello stato di ogni giocatore del gioco: i punteggi accumulati restano dov'erano, i periodi che hai rimosso spariscono, quelli nuovi arrivano vuoti. Senza questo passaggio, un giocatore che aveva già incontrato il concetto continuerebbe a giocare sulla definizione vecchia.

### Medaglie — `/games/{gameId}/badges`
Si lavora per **collezioni**: un gruppo di medaglie con un nome, che un giocatore può conquistare.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/badges` | Elenca le collezioni |
| `GET` | `/badges/{collectionId}` | Legge una collezione |
| `POST` | `/badges` | Crea una collezione |
| `PUT` | `/badges/{collectionId}` | Sostituisce una collezione |
| `DELETE` | `/badges/{collectionId}` | Elimina una collezione |

```http
POST /api/v1/games/{gameId}/badges
{
  "name": "achievements",
  "hidden": false,
  "badges": ["bronze", "silver", "gold"]
}
```

Con `hidden` la collezione non viene mostrata ai giocatori, mentre le regole continuano tranquillamente ad assegnarci medaglie.

### Livelli — `/games/{gameId}/levels`
Un livello lega un concetto di punteggio a una serie ordinata di soglie.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/levels` | Elenca i livelli |
| `GET` | `/levels/{levelId}` | Legge un livello |
| `POST` | `/levels` | Crea o sostituisce un livello, riconosciuto dal nome |
| `DELETE` | `/levels/{lvlName}` | Elimina un livello |

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

Il `config` di una soglia è quello che trasforma il superarla in una proposta: `choices` dice quante sfide il giocatore potrà attivare, scegliendole tra gli `availableModels`, e la proposta finisce nel suo inventario.

Un `PUT` non c'è. La `POST` riconosce il livello **dal nome**: se esiste lo aggiorna, se non esiste lo crea. Ne viene anche che un livello non si può rinominare, perché un nome nuovo viene letto come un livello nuovo, e a un concetto di punteggio può corrispondere un livello solo.

### Modelli di sfida — `/games/{gameId}/challenges`
Gli stampi da cui nascono le sfide vere: un nome e le variabili che cambiano di volta in volta.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/challenges` | Elenca i modelli |
| `POST` | `/challenges` | Crea un modello |
| `PUT` | `/challenges/{challengeId}` | Sostituisce un modello |
| `DELETE` | `/challenges/{challengeId}` | Elimina un modello |

```http
POST /api/v1/games/{gameId}/challenges
{
  "name": "weekly_study_goal",
  "variables": ["target", "bonus"]
}
```

### Giocatori — `/games/{gameId}/players`
| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/players` | Elenco paginato e sintetico dei giocatori, con filtro opzionale `?playerId=` |
| `GET` | `/players/{playerId}` | Lo stato completo di un giocatore |
| `POST` | `/players` | Crea o salva lo stato di un giocatore |
| `DELETE` | `/players/{playerId}` | Elimina lo stato di un giocatore |

**Elenco e dettaglio non restituiscono la stessa cosa.** Nell'elenco ogni voce è una sintesi: chi è il giocatore e a che livelli sta, e nient'altro. Un gioco con migliaia di giocatori, altrimenti, si porterebbe dietro ogni punteggio e ogni medaglia di ognuno.

```json
{
  "content": [
    {"playerId": "alice", "gameId": "{gameId}", "levels": [{"levelName": "Scholar", "levelValue": "Freshman", "levelIndex": 0, "pointConcept": "study_points"}]}
  ],
  "totalElements": 1, "number": 0
}
```

Per lo stato intero chiedi il singolo giocatore, e ottieni `playerId`, `gameId`, `pointConcepts`, `badgeCollections`, `challenges`, `levels`, `inventory`, `customData` e `groupChallenges`. Crearne uno vuole la stessa forma, ma serve raramente: al motore basta che un'esecuzione nomini un id mai visto, e il giocatore lo crea lui.

```http
POST /api/v1/games/{gameId}/players
{
  "playerId": "alice"
}
```

### Squadre — `/games/{gameId}/teams`
Una squadra raccoglie giocatori, accumula punteggio accanto a loro, e con loro può finire in classifica.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/teams` | Elenca le squadre |
| `GET` | `/teams/{teamId}` | Legge una squadra |
| `POST` | `/teams` | Crea una squadra |
| `PUT` | `/teams/{teamId}` | Sostituisce una squadra |
| `DELETE` | `/teams/{teamId}` | Elimina una squadra |

```http
POST /api/v1/games/{gameId}/teams
{
  "name": "Team Alpha",
  "members": ["alice", "bob"]
}
```

Ogni membro deve già essere un giocatore del gioco: se uno non lo è, salta tutta la richiesta con `invalid_team_members`. Una squadra, come un giocatore, si indirizza con l'identificativo che le hai dato: `{teamId}` è quel nome, non un id generato.

### Sfide di un giocatore — `/games/{gameId}/players/{playerId}/challenges`
Il ciclo di vita di una sfida **individuale**, che passa per `PROPOSED → ASSIGNED → ACTIVE → COMPLETED | FAILED | REFUSED | AUTO_DISCARDED | CANCELED`.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `POST` | `/challenges` | Assegna un'istanza di sfida |
| `GET` | `/challenges` | Elenca le sfide del giocatore |
| `GET` | `/challenges/{instanceName}` | Legge un'istanza |
| `PUT` | `/challenges/{instanceName}` | Cambia `start`, `end` e `hide` |
| `POST` | `/challenges/{instanceName}/accept` | Accetta un'istanza `PROPOSED`, che diventa `ASSIGNED` |
| `POST` | `/challenges/force-choice` | Forza la scelta in sospeso nell'inventario (vedi sotto) |
| `DELETE` | `/challenges/{instanceName}` | Elimina un'istanza |

`modelName` dice da quale modello nasce, `instanceName` dà un nome a questa singola sfida, `data` riempie le variabili del modello:

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

`PUT /challenges/{instanceName}` ritocca `start`, `end` e `hide` su una sfida che c'è già. I due passaggi di stato, invece, non hanno corpo:

```http
POST /api/v1/games/{gameId}/players/{playerId}/challenges/{instanceName}/accept
POST /api/v1/games/{gameId}/players/{playerId}/challenges/force-choice
```

Una sfida arriva a `COMPLETED` solo se lo dice una regola. Qui non c'è nulla che la completi per te: sono le regole a guardare i punteggi del giocatore e a chiamare `completed()` quando l'obiettivo è raggiunto. Una sfida che nessuna regola sorveglia resta ferma per sempre.

### Sfide di gruppo — `/games/{gameId}/players/{playerId}/group-challenges`
Sfide tra più giocatori. Nascono da un **invito**, non dai modelli visti sopra, e il modello invitato **deve** essere uno dei tre riservati al gruppo: un modello di sfida normale viene rifiutato.

- `groupCompetitivePerformance`
- `groupCompetitiveTime`
- `groupCooperative`

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/group-challenges` | Elenca le sfide di gruppo del giocatore |
| `POST` | `/group-challenges/invitations` | Invita uno o più ospiti |
| `POST` | `/group-challenges/{challengeName}/accept` | L'ospite accetta |
| `POST` | `/group-challenges/{challengeName}/refuse` | L'ospite rifiuta |
| `POST` | `/group-challenges/{challengeName}/cancel` | Il proponente annulla |

Il giocatore nel percorso è il proponente; gli ospiti vanno nel corpo:

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

Le tre risposte all'invito non hanno corpo:

```http
POST /api/v1/games/{gameId}/players/{playerId}/group-challenges/{challengeName}/accept
POST /api/v1/games/{gameId}/players/{playerId}/group-challenges/{challengeName}/refuse
POST /api/v1/games/{gameId}/players/{playerId}/group-challenges/{challengeName}/cancel
```

`accept` e `refuse` tocca all'ospite, `cancel` al proponente, e solo mentre la sfida è ancora proposta. Un giocatore può tenere al massimo **un** invito in sospeso come proponente e **tre** come ospite: oltre, l'invito viene rifiutato. Chi vince non si stabilisce qui — i conti li chiude il motore su pianificazione, a sfida conclusa, quindi una sfida appena accettata non ha ancora nessun esito.

### Inventario del giocatore — `/games/{gameId}/players/{playerId}/inventory`
Le **scelte** di sfida che un giocatore ha a disposizione, quelle che gli tocca quando supera una soglia di livello, e come attivarne una.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/inventory` | `{challengeChoices: [{modelName, state}], challengeActivationActions}` |
| `POST` | `/inventory/activations` | Attiva una di quelle scelte |

```http
POST /api/v1/games/{gameId}/players/{playerId}/inventory/activations
{
  "type": "CHALLENGE_MODEL",
  "name": "weekly_study_goal"
}
```

`name` è il modello da attivare. `type` puoi anche ometterlo: viene inteso `CHALLENGE_MODEL`, che oggi è l'unico tipo di scelta esistente. Qualunque altro valore viene rifiutato.

Attivare consuma la scelta: la sfida diventa attiva sul giocatore e le attivazioni che gli restano scendono. Le scelte da qui non si creano — arrivano perché il giocatore ha superato una soglia configurata per offrirle.

### Giocatori bloccati — `/games/{gameId}/players/{playerId}/blacklist`
Serve a un giocatore per segnare gli altri giocatori che ha bloccato.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/blacklist` | `{gameId, playerId, blockedPlayers: string[]}` |
| `POST` | `/blacklist/{otherPlayerId}` | Blocca un giocatore (idempotente) |
| `DELETE` | `/blacklist/{otherPlayerId}` | Sblocca un giocatore |

Corpo non serve: chi bloccare sta nel percorso.

```http
POST /api/v1/games/{gameId}/players/{playerId}/blacklist/{otherPlayerId}
```

**Un limite da conoscere**: per ora l'elenco viene solo **registrato**. Gli inviti alle sfide di gruppo, quelli di poco sopra, non lo guardano affatto: un giocatore bloccato può ancora essere invitato. Nel motore la lista pesa soltanto dentro l'abbinamento automatico, che non è esposto. Funzionava così anche nel vecchio motore, quindi è un limite di sempre e non una regressione — ma oggi non affidarti a questo per evitare inviti indesiderati.

### Classifiche — `/games/{gameId}/classifications`
| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/classifications` | Elenca le classifiche del gioco (filtro: `?name=`) |
| `GET` | `/classifications/{id}` | Legge una classifica |
| `POST` | `/classifications` | Crea una classifica |
| `PUT` | `/classifications/{id}` | Aggiorna una classifica |
| `DELETE` | `/classifications/{id}` | Elimina una classifica, e con lei la sua pianificazione |
| `GET` | `/classifications/{id}/board?timestamp=&periodInstanceIndex=` | La tabella, ordinata e paginata |

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

Una classifica `GENERAL` ordina i punteggi di sempre, e al posto del `periodName` vuole una `cronExpression`:

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

Il cron non calcola niente. **La tabella si ricava sul momento**, dai punteggi correnti, ogni volta che la chiedi: vecchia non è mai. La pianificazione dice solo quando notificare le prime posizioni. Una `INCREMENTAL` ordina dentro un periodo del concetto, e di cron non ha bisogno.

Per leggere la tabella puoi passare `timestamp` oppure `periodInstanceIndex`, se ti interessa una finestra passata invece di quella corrente. I due si escludono a vicenda:

```http
GET /api/v1/games/{gameId}/classifications/{id}/board?periodInstanceIndex=0&page=0&size=20
```

### Scenari — `/games/{gameId}/scenarios`
Una simulazione messa da parte: uno stato di partenza e il risultato che ti aspetti, così la stessa verifica la puoi rifare quando vuoi.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/scenarios` | Elenca gli scenari |
| `GET` | `/scenarios/{scenarioId}` | Legge uno scenario |
| `POST` | `/scenarios` | Crea uno scenario |
| `PUT` | `/scenarios/{scenarioId}` | Sostituisce uno scenario |
| `DELETE` | `/scenarios/{scenarioId}` | Elimina uno scenario |

```http
POST /api/v1/games/{gameId}/scenarios
{
  "name": "completamento sfida",
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

Salvare uno scenario non esegue nulla. Per farlo girare manda il suo `syntheticState` a `/executions/simulations`, e il confronto con `expectedOutput` lo fai tu: le API tengono da parte la coppia, non la giudicano.

### Esecuzione — `/executions`
Qui il motore entra in azione.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `POST` | `/executions` | Applica un'azione vera a un giocatore vero, in modo **sincrono**, e restituisce lo stato aggiornato |
| `POST` | `/executions/simulations` | Fa girare una o più azioni su uno stato **finto**, senza salvare niente |

È l'endpoint che un gioco in funzione usa davvero. Tutto il resto configura: qui si gioca.

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

Obbligatori sono `gameId`, `playerId`, `actionId` e anche `data`: se l'azione non porta niente, mandagli `{}`. `actionId` deve essere tra le azioni dichiarate dal gioco, altrimenti la richiesta viene rifiutata. `executionMoment` è opzionale e se manca vale adesso; indicarlo serve a ripresentare un evento nel momento in cui è capitato davvero, cosa che conta quando un concetto ha dei periodi e il punteggio deve cadere nella finestra giusta. Quello che metti in `data`, una regola lo legge come `InputData`.

La risposta è lo stato del giocatore dopo il passaggio delle regole, nella stessa forma di `GET /players/{playerId}`. La chiamata è sincrona: quello che torna è già definitivo, non in coda.

Simulare vuole uno stato al posto di un giocatore, e non scrive niente:

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

Torna `initialState`, `finalState` e `firedRules`, cioè quali regole sono scattate e in che ordine; con `showDetailedChanges` arrivano anche le modifiche regola per regola su ogni concetto. Dato che non si scrive nulla, è il modo sicuro di vedere cosa combina una regola prima che la incontri un giocatore vero.

Una simulazione che non si ferma viene interrotta, non lasciata correre: troppe attivazioni tornano come `maximum_simulation_firing_reached`, un tempo eccessivo come `simulation_timeout`. Anche l'esecuzione vera è protetta così, con una falla che conviene conoscere: il controllo conta le attivazioni delle regole, e una regola la cui *conseguenza* cicla al suo interno non produce nessuna attivazione da contare, quindi tiene aperta la richiesta. Su un ambiente condiviso, manda azioni che hai già simulato.

### Notifiche — `/games/{gameId}/notifications`
Quello che il motore ha annunciato: una medaglia conquistata, una sfida proposta, completata o fallita, un invito a una sfida di gruppo e le sue risposte, un posto in classifica, un livello raggiunto.

| Metodo | Percorso | A cosa serve |
|---|---|---|
| `GET` | `/notifications` | Elenco paginato (filtri: `?playerId=`, `?type=`, `?fromTs=`, `?toTs=`) |

```http
GET /api/v1/games/{gameId}/notifications?playerId=alice&page=0&size=20
```

Sola lettura: crearne una non si può. Le notifiche escono dal motore mentre lavora, e sono quindi il modo in cui un client scopre che è successo qualcosa senza andare a interrogare ogni giocatore. Quali campi ci sono dipende da `type`: guarda quello per primo.

## 4. Cosa accade mentre un gioco gira

Configurare un gioco e farlo girare sono due mestieri diversi. Il secondo vale la pena capirlo, perché è da lì che escono quasi tutte le sorprese.

**Le regole si compilano una volta per gioco, non a ogni richiesta.** Alla prima esecuzione le regole del gioco finiscono in un insieme compilato che resta in memoria, e le esecuzioni dopo lo riusano. Salvare, modificare o cancellare una regola manda via quell'insieme, così la prossima esecuzione ricompila da zero: per questo una regola vale subito dopo il salvataggio, e per questo una regola che vive solo nel tuo editor non vale mai.

**Un'esecuzione è un'azione per un giocatore, dall'inizio alla fine.** Mandi un'azione, il motore carica lo stato del giocatore, lo mette davanti alle regole insieme all'azione e ai suoi `data`, lascia scattare tutte quelle che corrispondono e salva ciò che è cambiato. La risposta è lo stato di dopo. Da qui due cose. Una regola vede solo quello che ha davanti, quindi due azioni con lo stesso nome e senza `data` sono indistinguibili. E le regole scattano in ordine di `salience`, dalla più alta: una regola che deve girare dopo quelle di punteggio vuole una salience più bassa delle loro.

Vediamolo tutto insieme, con una regola che dà dieci punti per ogni lezione:

```http
POST /api/v1/executions
{"gameId": "{gameId}", "playerId": "alice", "actionId": "attend_lecture", "data": {}}
```

`alice` viene caricata, o creata se il suo nome compare per la prima volta. La regola corrisponde, i suoi `study_points` salgono di dieci, e se così supera una soglia guadagna il livello e la scelta che quella soglia offre. Nella risposta c'è tutto, e di quello che è stato annunciato resta una notifica.

**Certe cose, invece, avvengono su pianificazione.** Le notifiche delle classifiche, i conti finali delle sfide di gruppo, le sfide che scadono in `FAILED`, le proposte che nascono al superamento di una soglia: girano tutte come lavori in background dentro il motore, non dentro la tua richiesta. Perciò una sfida di gruppo non ha un vincitore nell'istante in cui scade, e le notifiche di una classifica arrivano quando dice il cron, non quando cambiano i punteggi. La tabella, quella, è sempre calcolata sul momento: pianificato è solo l'annuncio.

**Le verifiche che hai salvato non le esegue nessuno.** Gli scenari si conservano, non si eseguono. Se dopo aver cambiato una regola vuoi rifarne girare uno, mandalo tu a `/executions/simulations` e confrontalo con il suo `expectedOutput`.

## 5. Quando qualcosa va storto

Gli errori tornano tutti nella stessa forma, qualunque sia la causa, così di strade per gestirli ne serve una e non dodici:

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

Il campo su cui costruire il codice è **`errorCode`**: è una stringa stabile, e conviene ragionare su quella e non sullo stato HTTP, che spesso è lo stesso per casi molto diversi. Un gioco che non esiste e un gioco che non puoi raggiungere sono entrambi rifiuti, ma vanno gestiti diversamente: `game_not_found` e `user_not_authorized` li distinguono, un `4xx` da solo no. `message` e `title` sono scritti per una persona e possono cambiare formulazione: mostrali, non confrontarli.

`details` si riempie quando la richiesta è stata bocciata campo per campo, e a ogni campo sbagliato associa il motivo. Quello dell'esempio è un accesso mandato senza `origin`. In `params` ci sono i valori che nel messaggio andrebbero inseriti, così un client con le sue traduzioni può comporre la frase da sé invece di mostrare quella inglese.

I codici si dividono in famiglie, e di solito riconoscere la famiglia basta:

| Famiglia | Esempi | Cosa significa |
|---|---|---|
| Richiesta non valida | `validation`, `rule_validation` | La richiesta è malformata, o una regola non compila. Guarda `details`. |
| Non trovato | `game_not_found`, `rule_not_found`, `action_not_found`, `point_concept_not_found`, `level_not_found`, `badge_not_found`, `challenge_not_found`, `challenge_instance_not_found`, `player_not_found`, `team_not_found`, `scenario_not_found`, `classification_not_found` | Quello che hai chiesto non esiste, oppure non è tuo. |
| Conflitto in creazione | `game_creation`, `action_creation`, `point_concept_creation`, `badge_creation`, `challenge_creation`, `team_creation`, `scenario_creation`, `classification_creation` | Con quel nome esiste già qualcosa, o il contenuto non si può creare come lo hai chiesto. |
| Nome riservato | `action_name_reserved` | Il nome appartiene agli eventi interni del motore. Scegline un altro. |
| Identità | `authentication_failed`, `user_not_authenticated`, `user_not_authorized`, `user_not_active`, `username_already_taken` | Credenziali sbagliate, token assente, gioco non tuo, account disattivato, username già preso. |
| Esecuzione delle regole | `game_execution_failed`, `rule_simulation`, `simulation_timeout`, `maximum_simulation_firing_reached` | Un'esecuzione o una simulazione è andata male. Gli ultimi due dicono che le regole non si sono fermate: hanno ciclato, o hanno passato il numero di attivazioni consentito. |
| Importazione ed esportazione | `import_empty`, `import_error`, `export_forbidden` | Niente da importare, un'importazione illeggibile, o un gioco che non puoi esportare. |
| Archiviazione | `duplicate_key`, `data_access`, `invalid_team_members` | La scrittura è stata rifiutata. Con `invalid_team_members` uno dei membri elencati non è un giocatore di quel gioco. |
| Tutto il resto | `generic` | Non gestito, torna come `500`. Se ne vedi uno, vale la pena segnalarlo. |
