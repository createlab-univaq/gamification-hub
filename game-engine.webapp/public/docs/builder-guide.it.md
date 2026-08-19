# Scrivere regole senza scrivere codice

Di tutto quello che si crea nella console, la regola è l'unica cosa che è davvero un programma. Il resto sono dichiarazioni: un'azione ha un nome, una medaglia ha una collezione, un livello ha delle soglie. Una regola invece ha condizioni, rami ed effetti, ed è scritta nel linguaggio che parla il motore Drools incorporato. Il builder serve proprio a questo: farti scrivere la prima regola funzionante senza prima imparare Drools.

È un editor a due pannelli. A sinistra monti la regola con blocchi che si incastrano; a destra compare il codice Drools che quei blocchi descrivono, e lì puoi scrivere a mano. Nessuno dei due lati è finto, ma uno dei due è la fonte della verità, e sapere quale ti risparmia parecchia confusione più avanti. In questo capitolo vediamo cosa fa ogni blocco, in cosa si traduce, cosa si incastra con cosa e dove le due viste smettono di combaciare del tutto.

Se non hai ancora letto la [sezione 6 del capitolo sulla console](/guide/console/6), parti da lì: spiega cosa *è* una regola, quali fatti il motore mette davanti alle tue condizioni e i pochi su cui finirai per lavorare quasi sempre. Qui lo diamo per assodato e parliamo dell'editor.

---

## 1. Due viste della stessa regola

Quello che viene salvato è il codice Drools. Non i blocchi, non la loro posizione sulla tela: la regola che finisce nel tuo gioco è il contenuto dell'editor di destra, ed è quella che il motore compila. I blocchi servono a produrre e a leggere quel testo, e vengono ricostruiti da lì ogni volta che il testo cambia.

C'è una conseguenza pratica da mettere subito in chiaro. Riaprire una regola non ti restituisce la tela che avevi lasciato, perché quella tela non è mai stata salvata. Viene letto il codice memorizzato, ne nascono i blocchi corrispondenti e vengono disposti da capo, in alto a sinistra. Una regola costruita con una certa cura nella disposizione torna ordinata ma sistemata a modo suo, e non hai perso niente: quella disposizione non ha mai voluto dire nulla per il motore.

Ne viene anche che i due pannelli non sono due editor che si litigano lo stesso documento. Si sincronizzano nei due sensi, ognuno con un ritardo di quattro decimi di secondo circa, così nessuno dei due ti ostacola mentre scrivi: tocchi qualcosa sulla tela e il codice viene rigenerato da tutta l'area di lavoro, scrivi nell'editor di codice e il testo viene letto e la tela ricostruita di conseguenza. Tutto ciò che Drools sa esprimere e che nessun blocco copre lo puoi comunque scrivere: resiste finché il parser lo capisce abbastanza da dargli un blocco in cui stare, ed è esattamente il mestiere dei blocchi «raw» presenti in ogni categoria.

La rigenerazione riscrive tutto, non aggiorna dei pezzi. Il generatore attraversa l'area di lavoro e stampa il file da zero in un ordine fisso: prima gli import, poi i global, poi i tipi dichiarati, poi le funzioni, infine le regole. Dove hai messo le cose sulla tela non conta. Due regole sulla stessa tela escono nell'ordine in cui stanno dall'alto verso il basso, e fra due alla stessa altezza passa prima quella più a sinistra, ma le regole vengono sempre dopo le funzioni, per quanto in alto tu le abbia trascinate.

Quando il codice non si riesce a leggere, la tela resta esattamente com'era e l'errore compare nella console dei messaggi. È la normalità mentre stai scrivendo a metà un pattern, e non c'è da preoccuparsi: i blocchi smettono di seguirti finché il testo non torna sensato. Il guasto opposto, cioè un'area di lavoro che non si riesce a trasformare in testo, arriva come avviso e non come errore. In entrambi i casi, mentre lavori nel pannello di testo conviene tenere quella console aperta.

Una cosa non sopravvive all'andata e ritorno, e tanto vale saperlo prima di scoprirlo: la forma. Commenti, righe vuote e la tua indentazione non vengono conservati, perché quello che torna è stampato dalla struttura letta e non tenuto da parte parola per parola. Quello che la regola *dice*, invece, fa il viaggio in tutti e due i sensi, compresi i suoi cinque attributi: il testo che ti ritrovi è la stessa regola impaginata diversamente, non una versione ridotta.

## 2. L'area di lavoro

L'editor occupa la pagina con tre pannelli ridimensionabili. La **tela** è quello grande a sinistra, dove trascini i blocchi dalla cassetta e li unisci. L'**editor di codice** sta a destra, ed è un editor vero e proprio, con numeri di riga, parentesi accoppiate ed evidenziazione della sintassi. La **console dei messaggi** resta nascosta finché non la chiami e si apre sotto la tela.

Ogni divisore si trascina, e ogni pannello si può chiudere contro il bordo e riaprire. Passandoci sopra compaiono dei comandi che fanno proprio questo: chiudere il pannello di un lato, allargarlo fino a occupare tutto, oppure afferrare la maniglia e trascinare. Se preferisci lavorare solo a blocchi, chiudi l'editor di codice; se preferisci scrivere Drools a mano e usare la tela solo per controllare la struttura, chiudi la tela.

La tela si comporta come una qualsiasi area di lavoro Blockly. La rotellina fa zoom, trascinando lo sfondo ti sposti, in un angolo ci sono i comandi dello zoom e c'è un cestino per i blocchi da buttare. I blocchi si agganciano a una griglia, quindi una regola montata in fretta resta comunque allineata. I colori seguono i temi chiaro e scuro della console, e cambiando tema la tela si ridipinge subito.

In cima alla pagina ci sono il **nome** della regola e tre pulsanti. Il nome è un campo di testo e per una regola nuova parte vuoto; serve per salvare, ed è il nome con cui la regola verrà elencata. **Valida** compila quello che hai davanti senza salvarlo. **Salva** lo memorizza. **Console** mostra o nasconde il pannello dei messaggi, che è dove finiscono gli esiti della validazione e le proteste del parser.

![L'area di lavoro dell'editor di regole](/docs/images/rule-builder-area.png "L'area di lavoro: tela, editor di codice e console dei messaggi")

## 3. I blocchi, categoria per categoria

La cassetta ha cinque categorie e trentanove blocchi diversi, quaranta voci in tutto perché `return` compare in due posti. Ogni categoria ha il suo colore, ed è il modo più rapido per capire dove va un blocco quando sulla tela ne hai qualche decina.

### Globals

Tutto quello che vive fuori dalle regole: cosa importa il file, cosa dichiara, quali funzioni di appoggio definisce. In una regola di gamification, qui di solito non ti serve niente oltre a un paio di import.

| Blocco | A cosa serve | Cosa scrive |
|---|---|---|
| `imports` | Contenitore per la riga del package e la catena degli import | Ogni riga contenuta, una per riga |
| `package` | Il package del file di regole. Va **dentro** il contenitore degli import | `package eu.trentorise.game.model` |
| `import` | Un import Java, con le classi del motore già suggerite | `import eu.trentorise.game.model.PointConcept;` |
| `globals` | Contenitore delle dichiarazioni global | Ogni global contenuto |
| `global` | Un valore reso disponibile a tutte le regole | `global com.example.MyService myService;` |
| `declare` | Un tipo di fatto tutto tuo | `declare MyFact` … `end` |
| `attribute` | Un campo tipizzato dentro un `declare` | `myField : String` |
| `function` | Una funzione di appoggio, col corpo fatto di blocchi conseguenza | `function void myFunction() { … }` |
| `return` | Esce da una funzione, con o senza valore | `return expr;` oppure `return;` |

![Il cassetto Globals](/docs/images/rule-builder-globals.png "I blocchi della categoria Globals")

### Rules

Un blocco solo, e da lì parte ogni regola. Porta il nome, i cinque attributi e i due incastri che tengono le condizioni e le conseguenze.

La salience decide chi scatta prima quando più regole corrispondono, dalla più alta, e se vale zero non viene nemmeno scritta. Agenda group e ruleflow group, se li lasci vuoti, non compaiono, e quando ci sono vengono scritti fra virgolette, perché Drools lì si aspetta una stringa e senza scarta la regola in blocco. `no-loop` e `lock-on-active` invece vengono scritti sempre, spuntati o no. Se lasci vuoto il `when` o il `then` la regola viene comunque emessa, con un commento al posto della metà mancante: una regola incompleta compila, non rompe il file.

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

Riempiono il `when` di una regola. I pattern trovano i fatti; il resto li combina o li qualifica.

| Blocco | A cosa serve | Cosa scrive |
|---|---|---|
| `binding / type` | Un pattern legato a una variabile, coi vincoli dentro | `$pc : PointConcept( … )` |
| `type` | Lo stesso senza binding, da usare dentro `not` ed `exists` | `PointConcept( … )` |
| `not` | Corrisponde quando la condizione interna non vale | `not( … )` |
| `exists` | Corrisponde se almeno un fatto soddisfa la condizione interna | `exists( … )` |
| `forall` | Corrisponde se la soddisfano tutti | `forall( … )` |
| `AND group` | Raggruppa esplicitamente più condizioni | `( a b )` su più righe |
| `OR group` | Corrisponde se ne vale almeno una | `( a or b )` su più righe |
| `from` | Prende un pattern da una collezione o da un'espressione | `$x : Type( … ) from $collection` |
| `eval` | Un'espressione booleana qualsiasi | `eval( expression )` |
| `raw condition` | Codice Drools inserito così come lo scrivi | quello che scrivi |

`not`, `exists`, `forall` e `from` accettano una sola condizione interna, e usano solo la prima dell'incastro. Impilarne due dentro un `not` fa sparire la seconda senza dire niente. Per negare una combinazione metti un `AND group` dentro al `not` e impila i pattern lì.

![Il cassetto Conditions](/docs/images/rule-builder-conditions.png "I blocchi della categoria Conditions")

### Constraints

Stanno dentro un pattern e dicono come deve essere fatto il fatto trovato. Il pattern raccoglie quanti ne impili e li scrive separati da virgola dentro le sue parentesi.

| Blocco | A cosa serve | Cosa scrive |
|---|---|---|
| `campo operatore valore` | Confronta un campo. Gli operatori sono `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `not contains`, `memberOf`, `not memberOf`, `matches` e `not matches` | `name == "study_points"` |
| `binding : campo` | Cattura il valore di un campo in una variabile da usare nel `then` | `$val : score` |
| `raw` | Un vincolo scritto come vuoi | `score != null` |

### Consequences

Riempiono il `then`, e sono anche i mattoni del corpo di una funzione e di ogni ciclo o ramo. È la categoria più grossa, perché copre sia la programmazione normale sia le azioni proprie del motore.

| Blocco | A cosa serve | Cosa scrive |
|---|---|---|
| `modify` | Cambia un fatto legato chiamandoci i setter. È così che punteggi e medaglie vengono davvero assegnati | `modify($pc) { setScore(50) }` |
| `call metodo ( args )` | Una chiamata dentro un `modify`, più di una separate da virgola | la consuma `modify` |
| `insert` | Mette un fatto nuovo in memoria di lavoro | `insert(new Object());` |
| `retract` | Toglie dalla memoria di lavoro un fatto legato | `retract($pc);` |
| `global` | Esegue un'istruzione, tipicamente su un global | `utils.log("msg");` |
| `while` | Un ciclo while | `while (cond) { … }` |
| `for ( tipo var : collezione )` | Un for-each su una collezione | `for (Object item : $collection) { … }` |
| `for ( init ; cond ; update )` | Un for contato | `for (int i = 0; i < n; i++) { … }` |
| `instantiate` | Dichiara e inizializza una variabile locale | `String myVar = new String();` |
| `call ogg . metodo ( args )` | Chiama un metodo su qualcosa | `$obj.method();` |
| `switch` | Uno switch su un'espressione, che contiene i casi | `switch ($variable) { … }` |
| `case` | Un caso dentro uno switch | `case "value": …` |
| `default` | Il caso di ripiego dentro uno switch | `default: …` |
| `if` | Un condizionale con un ramo | `if (cond) { … }` |
| `if / else` | Un condizionale con due rami | `if (cond) { … } else { … }` |
| `return` | Ritorna, soprattutto nei corpi delle funzioni | `return expr;` |
| `code` | Java o MVEL come lo scrivi, col punto e virgola aggiunto se lo dimentichi | quello che scrivi |

Se agganci un `if` direttamente nell'incastro `else` di un `if / else`, viene riconosciuto e scritto come `else if` invece che come blocco annidato: una sequenza di condizioni esce come l'avresti scritta a mano.

![Il cassetto Consequences](/docs/images/rule-builder-consequences.png "I blocchi della categoria Consequences")

## 4. Cosa si collega a cosa

I blocchi non si uniscono in combinazioni che non potrebbero compilare: è la parte della validazione che ottieni gratis. Ogni incastro accetta un solo tipo di blocco, e la forma delle tacche segue la stessa regola, tanto che una conseguenza infilata in un `when` semplicemente non si attacca.

L'elenco dei tipi è breve. Le condizioni vanno nel `when` e dentro i blocchi di raggruppamento e negazione. I vincoli vanno solo dentro un pattern. Le conseguenze vanno nel `then`, nel corpo di una funzione e nel corpo di ogni ciclo, ramo e caso. Gli import vanno solo nel loro contenitore, i global solo nel loro, gli attributi solo dentro un `declare`. Un `call` sta solo dentro un `modify`, e `case` e `default` solo dentro uno `switch`.

I contenitori, invece, non si agganciano a niente. `imports`, `globals`, `declare`, `function` e `rule` non hanno tacche né sopra né sotto, perché sono gli elementi più esterni di un file e stanno direttamente sulla tela.

Ed è qui l'unica vera trappola dell'editor. **Vengono scritti solo i blocchi riconosciuti al livello più esterno**, e quelli riconosciuti sono esattamente questi: il contenitore degli import, un import da solo, il contenitore dei global, un global da solo, i tipi dichiarati, le funzioni e le regole. Qualunque altra cosa lasciata in giro sulla tela non contribuisce al file. Un pattern parcheggiato di lato mentre riordini una regola non è un errore e nessuno te lo segnala: semplicemente non finisce nel risultato.

Il blocco `package` è quello su cui ci si casca, perché in quella lista non c'è affatto. Pur stando nella categoria Globals viene raccolto solo **dentro** il contenitore degli import: da solo non fa niente, e una regola che avrebbe bisogno della riga del package, con quel blocco lasciato lì accanto, esce senza quella riga. Un `import` o un `global` singolo, invece, è più tollerante e funziona in entrambi i modi, dentro al contenitore o da solo sulla tela: è proprio per questo che il comportamento diverso del `package` sfugge facilmente.

Se un blocco sembra non avere alcun effetto sul codice generato, la ragione è quasi sempre questa: controlla che sia dentro qualcosa, e che quel qualcosa sia uno dei cinque.

## 5. Binding, suggerimenti e tipi di fatto

In Drools le variabili legate cominciano con `$`, e su un pattern ci pensa il builder. Il campo del binding contiene solo il nome, e il `$` viene aggiunto quando si scrive il codice. Se lo metti comunque non fai danni, perché il campo lo toglie: `$pc` e `pc` finiscono entrambi come `$pc`, e non c'è modo di ritrovarsi un `$$pc`.

Altrove, invece, il `$` fa parte del valore e non viene aggiunto. I blocchi `modify` e `retract` scrivono il binding esattamente come lo trovano nel campo, ed è per questo che i valori suggeriti includono già il `$`. Scegliere dalla lista quindi va sempre bene; scriverlo a mano vuol dire metterci anche il `$`, perché senza esce `modify(pc)`, che non è la variabile che hai legato.

Alcuni campi propongono dei valori mentre scrivi. Il tipo di fatto su un pattern offre i fatti che il motore mette in memoria di lavoro, e il blocco `import` offre i loro nomi completi, così un import lo scrivi senza andare a cercare niente. I tipi proposti sono `Action`, `InputData`, `PointConcept`, `BadgeCollectionConcept`, `ChallengeConcept`, `CustomData`, `Player`, `Game`, `GroupChallenge` e `Reward`. Sono suggerimenti, non una lista chiusa: ci puoi scrivere sopra quello che vuoi.

I blocchi `modify` e `retract` suggeriscono una cosa ancora più utile: i binding che esistono davvero sulla tua tela. Vanno a leggere i pattern legati nell'area di lavoro e ti propongono le loro variabili, così il `then` di una regola si monta scegliendo fra quello che il `when` ha già legato, e sbagliare un nome fra le due metà diventa molto più difficile.

## 6. Validare, salvare, mandare in produzione

**Valida** manda al motore quello che c'è nel pannello del codice e lo fa compilare lì, senza salvare niente. È esattamente la compilazione che il motore eseguirà quando il gioco girerà: quello che ti risponde, quindi, è definitivo e non un'approssimazione. Se è tutto in ordine, una breve notifica te lo conferma. Altrimenti si apre la console dei messaggi con l'elenco e la gravità di ognuno: gli errori vogliono dire che la regola non compila, gli avvisi che compila ma qualcosa non torna. Validare non costa niente e non richiede giocatori, quindi tanto vale farlo prima di ogni salvataggio.

**Salva** memorizza la regola nel gioco. Vuole un nome e qualcosa nel pannello del codice, e finché non li ha resta disattivato. Il primo salvataggio ti porta anche all'indirizzo della regola stessa, così il salvataggio successivo la aggiorna invece di crearne una copia; da lì in poi salvare ti lascia nell'editor e ricarica quello che è stato memorizzato.

Dato che la regola che stai scrivendo, finché non la salvi, è solo testo su una pagina, uscire con modifiche pendenti merita un avviso, e l'avviso c'è. Se te ne vai da una regola modificata ti viene chiesta conferma, e vale anche per il pulsante «indietro» del browser e per la chiusura della scheda. Il confronto ignora gli spazi, quindi riformattare non conta come modifica.

Salvare è anche il momento in cui una regola comincia a contare. Il motore compila le regole di un gioco una volta e poi riusa il risultato, e lo scarta ogni volta che una regola viene salvata, modificata o eliminata; l'esecuzione successiva ricompila. Ecco perché una regola salvata entra in funzione subito, e perché una regola che è vissuta soltanto in questo editor non entra in funzione mai. È di gran lunga la spiegazione più frequente di una regola che «non scatta».

Da qui il passo naturale è la [sezione 7 del capitolo sulla console](/guide/console/7): una regola che compila non è detto che sia giusta, e il simulatore esegue le tue regole su un giocatore inventato, così vedi quali sono scattate e cosa è cambiato prima di coinvolgere qualcuno di reale. Quando è ora di mandare eventi veri, si passa al [capitolo sulle API](/guide/api).
