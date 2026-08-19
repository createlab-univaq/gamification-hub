# Campus Quest: guida completa alla console

Questa guida spiega tutto quello che la console sa fare, un concetto alla volta: che cos'è, perché esiste, come si comporta e cosa puoi decidere tu. Per non restare nell'astratto, ogni spiegazione poggia su un unico esempio che ritorna sempre, **Campus Quest**, un gioco pensato per il coinvolgimento degli studenti universitari: si guadagnano punti e medaglie frequentando lezioni, consegnando compiti e usando la biblioteca, si sale di livello, si entra in squadra, si affrontano sfide e si compete nelle classifiche.

Puoi leggerla dall'inizio alla fine per farti un giro completo del motore, oppure andare direttamente alla sezione che ti serve. I riquadri **In Campus Quest** mostrano ogni idea messa in pratica, con valori veri che puoi riprodurre se vuoi seguire passo passo nell'app; il centro di ogni sezione resta però il concetto, e Campus Quest serve solo a renderlo concreto.

Nel testo, il **grassetto** indica un pulsante o un campo nella console, e il `codice` indica un valore concreto.

## 1. Crea il gioco

Il **gioco** è il contenitore che sta sopra a tutto il resto di questa guida. Azioni, regole, concetti di punteggio, medaglie, giocatori, squadre e classifiche appartengono a lui, e fra un gioco e l'altro non si condivide niente: due giochi possono avere entrambi un'azione `attend_lecture` senza mai darsi fastidio. Ne viene che un gioco è un'unità di lavoro sicura: puoi costruirne uno, esportarlo, eliminarlo o duplicarlo senza toccare gli altri.

Per creare un gioco bastano un **nome** e un **dominio**. Il dominio è un'etichetta libera che serve a raggruppare giochi affini, per esempio tutti quelli di un prodotto o di un reparto; sul comportamento non incide, esiste solo per non perderti in un elenco lungo. Una volta creato, il gioco si apre dalla dashboard, e la barra laterale a sinistra diventa l'indice di tutto quello che raccontano le sezioni successive: Regole, Azioni, Concetti di punteggio, Medaglie, Livelli e via così.

Un gioco è anche trasportabile. Dalla dashboard lo **esporti** in un file, che ne è l'istantanea completa (regole, modelli di sfida, livelli, tutto), e quel file lo **importi** altrove. È così che se ne fa un backup, che lo si sposta da un ambiente all'altro, o che si consegna a qualcun altro una configurazione già funzionante.

> **In Campus Quest.** Nella dashboard **Giochi**, clicca **Aggiungi**, imposta **Nome** su `Campus Quest` e **Dominio** su `campus`, e **Salva**. Aprilo dall'elenco; il resto di questa guida lavora dentro questo unico gioco.

![Il form del nuovo gioco](/docs/images/create-game.png "Creazione di Campus Quest: nome e dominio")

## 2. Azioni

Un'**azione** è il vocabolario di eventi che il tuo gioco comprende. Rappresenta qualcosa che un giocatore può fare e a cui il motore può reagire, come una lezione frequentata o un compito consegnato. Definire un'azione fa due cose: dà a quell'evento un **id** stabile a cui riferirti altrove, e permette al motore di accettare eventi che nominano quell'id. Da sola un'azione non fa niente: non porta punti e non porta logica. Il comportamento che trasforma un'azione in punti, medaglie o passaggi di livello si scrive altrove, nelle **Regole** (sezione 6). Tenere separate le due cose ti permette di aggiungere, rinominare o ripensare i tuoi eventi senza toccare la logica dei punteggi, e viceversa.

Le azioni possono anche portare dei **dati**. Un evento, quando viene inviato, può portare con sé qualche valore con un nome: un compito consegnato con il suo `grade` (voto), una visita in biblioteca con il numero di `hours` (ore). Questi dati non si dichiarano sull'azione: la loro forma è libera, e quando arriva un evento di quell'azione la regola legge semplicemente le chiavi che le interessano (la sezione 6 mostra come). Questo mantiene leggere le azioni: un'azione è un nome, e i dati che porta sono decisi da chi invia l'evento e letti dalla regola che ne ha bisogno.

> **In Campus Quest.** Apri **Azioni** e aggiungine cinque, ognuna con solo un nome: `attend_lecture`, `submit_assignment`, `use_library`, `join_event` e `answer_quiz`. Due di esse sono pensate per portare dati: `submit_assignment` porterà un `grade`, e `use_library` porterà `hours`. Ancora nulla reagisce a esse; è a questo che servono le regole.

![L'elenco delle azioni](/docs/images/actions-list.png "Le cinque azioni di Campus Quest")

## 3. Concetti di punteggio

Un **concetto di punteggio** è un punteggio con un nome, che il motore tiene separato per ogni giocatore e per ogni squadra. Un gioco può definirne quanti gliene servono, e conviene pensarli come valute diverse: un giocatore può essere ricco in una e povero in un'altra, e ognuna la si guadagna e la si spende con le proprie regole. Tenere i punteggi distinti così permette a un solo gioco di premiare comportamenti molto diversi senza confonderli, e permette a ognuno di alimentare i livelli e le classifiche che gli competono.

La parte più interessante di un concetto di punteggio sono i **periodi**. Oltre al totale progressivo di sempre, un concetto può tracciare una o più finestre temporali ricorrenti. Un periodo si definisce con un **nome**, l'arco di tempo in cui è valido e la **durata in giorni** di una singola finestra all'interno di quell'arco. L'arco si apre su una data di **inizio** che devi indicare e si chiude su una data di **fine** che puoi lasciare vuota: senza fine il periodo continua ad aprire nuove finestre a tempo indeterminato, indicandola invece si ferma. L'inizio non è una formalità, perché le finestre vengono disposte su una griglia fissa a partire da lì. Un periodo che parte il 1 marzo con una finestra di tre giorni tiene il primo conteggio dall'1 al 3 marzo, ne apre uno nuovo dal 4 al 6, un altro dal 7 al 9, e continua così ogni tre giorni; se è indicata una data di fine, l'ultima finestra viene troncata a quella data invece di durare per intero. Un evento con data precedente all'inizio non porta punti a quel periodo, e una volta passata la fine non si apre più nessuna finestra; in entrambi i casi, però, il totale di sempre continua a crescere. Il numero di **finestre mantenute** limita quante finestre passate vengono conservate, scartando le più vecchie oltre quel numero. Il motore tiene un conteggio separato per la finestra corrente di ogni periodo, azzerandolo quando la finestra si rinnova, mentre il totale di sempre continua a crescere intatto. È questo che rende possibili le classifiche "di questa settimana" e "di questo mese": lo stesso concetto alimenta sia una classifica di sempre sia una periodica (sezione 15). Un concetto senza periodi è semplicemente un punteggio di sempre.

> **In Campus Quest.** Apri **Concetti di punteggio** e creane tre. `study_points` è il punteggio accademico principale, con un periodo `weekly` di `7` giorni, fatto partire da una qualsiasi data passata e lasciato senza fine così che la finestra continui a ripetersi in avanti. `credits` sono i crediti formali del corso, un punteggio di sempre senza periodi. `social_points` copre la vita sociale del campus, con un periodo `monthly` di `30` giorni. Tutti e tre partono da zero per ogni giocatore, e le regole della sezione 6 danno al motore dei motivi per farli crescere.

![L'elenco dei concetti di punteggio](/docs/images/point-concepts-list.png "I tre concetti di punteggio, con i loro periodi")

## 4. Medaglie

Una **medaglia** è un riconoscimento una tantum: un giocatore ce l'ha oppure no, a differenza di un concetto di punteggio, che è un numero che sale e scende. Le medaglie sono raggruppate in **collezioni**, e una collezione è **visibile** oppure **nascosta**. Una collezione visibile è mostrata al giocatore fin dall'inizio (di solito con le sue medaglie guadagnate e non ancora guadagnate), il che è utile per pubblicizzare gli obiettivi da raggiungere. Una collezione nascosta resta invisibile finché il giocatore non guadagna la sua prima medaglia al suo interno, il che è ideale per i traguardi segreti e le sorprese.

C'è un dettaglio del motore che vale la pena capire, perché cambia il modo in cui imposti le medaglie. Nel suo modello, una collezione di medaglie *è* l'insieme delle medaglie che un giocatore ha **guadagnato**. Non esiste un catalogo a parte delle medaglie "possibili": quello che una collezione contiene è quello che al giocatore è già stato dato. In pratica, quindi, le collezioni si creano **vuote**, con un nome e una visibilità e nient'altro, e le medaglie vere arrivano durante il gioco dalle **regole** (sezione 6). Se scrivessi dei nomi di medaglia in una collezione al momento di crearla, risulterebbero già guadagnate da tutti.

> **In Campus Quest.** Apri **Medaglie** e crea due collezioni vuote: `achievements`, lasciata **Visibile**, e `secret_achievements`, impostata su **Nascosta**. Non aggiungere medaglie a mano. Durante il gioco, le regole conferiscono `first_lecture`, `bookworm`, `honor_roll` e `social_butterfly` in `achievements`, e la segreta `night_owl` in `secret_achievements`. Quelle regole arrivano nella sezione 6.

![Il form della collezione di medaglie](/docs/images/create-badge.png "Creazione della collezione achievements")

## 5. Livelli

Un **livello** trasforma un concetto di punteggio in un rango. Scegli un concetto e definisci un elenco ordinato di **soglie** con nome, ognuna con un valore; il livello di un giocatore è la soglia più alta che il suo punteggio ha raggiunto. I livelli danno ai giocatori un senso di progressione che un numero grezzo non può dare: passare da un rango con nome al successivo è un traguardo, ed è qualcosa a cui il motore può reagire. Un gioco può definire diversi livelli, ciascuno basato su un concetto di punteggio differente, così che lo stesso giocatore possa essere un veterano su una scala e un novizio su un'altra.

I livelli non si limitano a mettere un'etichetta su un giocatore. Il motore sa l'istante esatto in cui qualcuno supera una soglia, e per questo una soglia può portare con sé una **ricompensa**: raggiungerla può consegnare al giocatore una **scelta di sfida**, che finisce nel suo inventario perché la attivi quando vuole (sezioni 12 e 13). È così che salire di livello diventa un'occasione e non soltanto un titolo nuovo. Configurare quella ricompensa richiede che i modelli di sfida esistano già, quindi la aggiungiamo nella sezione 12.

> **In Campus Quest.** Apri **Livelli** e aggiungi un livello sul concetto `study_points`, con cinque soglie:
>
> | Soglia    | Valore |
> |-----------|--------|
> | Freshman  | 0      |
> | Sophomore | 100    |
> | Junior    | 300    |
> | Senior    | 600    |
> | Graduate  | 1000   |
>
> Ogni giocatore parte da **Freshman** e passa a **Sophomore** a 100 punti, e così via. Nella sezione 12 la soglia **Sophomore** acquisisce una ricompensa a scelta di sfida.

![Il form del livello con le soglie](/docs/images/levels-form.png "Il livello Scholar: cinque soglie di study_points")

## 6. Regole

Nelle regole sta il comportamento vero di un gioco: fino a qui abbiamo dichiarato dei sostantivi, le regole sono i verbi. Dentro al motore c'è un **motore di regole** (Drools), e ogni regola ha due metà: il **when**, che elenca le condizioni, e il **then**, che elenca le conseguenze. Quando arriva un evento, il motore mette in memoria di lavoro una serie di **fatti** (l'azione, i suoi dati, i punteggi e le medaglie che il giocatore ha in quel momento, e altro ancora) e poi fa scattare tutte le regole il cui **when** trova corrispondenza. Il **then** reagisce cambiando quei fatti: aumenta un punteggio, conferisce una medaglia, manda una notifica.

Le condizioni si scrivono sui fatti. Quelli che userai più spesso:

| Fatto | Corrisponde a | Esempio |
|-------|---------------|---------|
| `Action( id == "..." )` | quale azione è avvenuta | `Action( id == "attend_lecture" )` |
| `InputData( $x : data["..."] )` | i dati inviati con l'azione | `InputData( $hours : data["hours"] )` |
| `PointConcept( name == "...", ... )` | il punteggio di un giocatore | `PointConcept( name == "study_points", score >= 100 )` |
| `BadgeCollectionConcept( name == "...", ... )` | la collezione di medaglie di un giocatore | `badgeEarned not contains "bookworm"` |
| `Game( $gameId : id )`, `Player( $playerId : id )` | il gioco e il giocatore correnti | usati per inviare una notifica di medaglia |

Vale la pena conoscere subito due meccanismi. Primo, la **salience** è la priorità di una regola: chi ha la salience più alta scatta prima. Conta quando una regola dipende dal risultato di un'altra, per esempio una regola di medaglia che deve scattare solo dopo che una regola di punteggio ha aggiornato il punteggio; darle una salience negativa la fa aspettare. Secondo, una regola si difende dal ripetersi guardando lo stato attuale nel proprio **when**: la regola che aggiunge `bookworm` scatta solo se la collezione *non* contiene già `bookworm`, così la medaglia viene conferita una volta sola.

Le regole si scrivono nella pagina **Regole**, che tiene sincronizzate due rappresentazioni: un **costruttore a blocchi** visuale a sinistra, dove trascini condizioni e conseguenze, e un pannello di **codice Drools** accanto, dove puoi digitare la regola direttamente. Modificare l'una aggiorna l'altra. Un pulsante **valida** compila la regola e segnala i problemi in un pannello console, e **salva** la memorizza. Validare prima di salvare è l'abitudine che intercetta refusi ed errori di tipo prima che raggiungano un giocatore. Questa sezione si occupa di cosa deve dire una regola; dell'editor in sé, blocco per blocco, parla il [capitolo sull'editor di regole](/guide/builder), ed è lì che conviene guardare quando un blocco che hai messo sembra non cambiare nulla nella regola che dovrebbe produrre.

Prima di scrivere la prima regola, due parole sulle poche righe che stanno in cima a ognuna: sono il motivo più frequente per cui una regola all'apparenza giusta si rifiuta di compilare. Una regola viene compilata come un piccolo file sorgente, quindi ogni tipo che nomina deve poter essere risolto. Dichiarare `package eu.trentorise.game.model` in cima è ciò che ti permette di scrivere `Action`, `InputData`, `PointConcept` e `BadgeCollectionConcept` senza importarli, perché è il package in cui quei tipi vivono. Tutto ciò che sta fuori va importato per nome: `eu.trentorise.game.notification.BadgeNotification` per inviare la notifica di una medaglia, oppure `eu.trentorise.game.core.Utility` insieme a `global Utility utils;` se vuoi scrivere nel log da una regola. Se ometti la riga del package devi importare ogni tipo che nomini, concetti compresi. La validazione segnala un tipo non risolto come errore prima che tu possa salvare, quindi ai giocatori non arriva niente di rotto; saperlo, però, trasforma un errore misterioso in un errore ovvio.

La regola utile più semplice aumenta un punteggio quando avviene un'azione. Questa assegna 10 `study_points` per ogni lezione frequentata, e sopra non le serve altro che la riga del package:

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

Il `when` trova corrispondenza su due fatti: l'azione della lezione e il concetto `study_points` del giocatore, legato a `$pc` così che il `then` possa cambiarlo. Il `then` alza il punteggio e chiama `update` per dire al motore che quel fatto è cambiato. Leggere i dati dell'evento funziona allo stesso modo: si aggiunge un fatto `InputData` e si lega la chiave che serve.

![Il costruttore di regole: blocchi, codice e console](/docs/images/rules-form.png "Costruzione di study_points_lecture")

Un paio di note su come stanno organizzate le regole. Ogni regola salvata è un file a sé, ma un singolo file può contenere più blocchi `rule "..." ... end`: il motore li compila tutti e restano indipendenti fra loro. Si può fare, però un file così è più difficile da leggere e da mantenere, quindi la scelta pulita è una regola per file. Un nome fa eccezione: una regola chiamata `constants` viene letta come un file di proprietà, righe `chiave = valore`, e non come codice Drools; ogni chiave diventa una costante globale che le tue regole possono usare, dopo averla dichiarata con `global` in cima. È il posto giusto per soglie e numeri da tarare, invece di ripetere gli stessi valori in mezzo alle regole.

> **In Campus Quest.** Il gioco usa nove regole, divise in due gruppi. Qui sotto compaiono solo i blocchi `rule ... end`: ognuna va salvata come regola a sé e porta l'intestazione descritta sopra, cioè la riga del `package` più un import per tutto quello che sta fuori da quel package. Ricordati gli import in ogni regola che scrivi, altrimenti la validazione non passa. Le **regole di punteggio** assegnano punteggi dalle azioni:
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
> Le **regole delle medaglie** conferiscono una medaglia quando una condizione è soddisfatta, e ognuna deve importare il tipo della notifica, che vive fuori dal package del modello. Hanno una `salience` bassa per scattare dopo che le regole di punteggio hanno aggiornato i punteggi. Lo schema è sempre lo stesso, quindi eccone una per intero, intestazione compresa, e le altre solo con le righe che le distinguono:
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
> - **first_lecture**: condizione `Action( id == "attend_lecture" )`; conferisce `first_lecture` in `achievements`.
> - **social_butterfly**: condizione `PointConcept( name == "social_points", score >= 20 )`; conferisce `social_butterfly` in `achievements`.
> - **honor_roll**: condizioni `Action( id == "submit_assignment" )`, `InputData( $grade : data["grade"] )` più `eval( $grade != null && ((Number)$grade).doubleValue() >= 28 )`; conferisce `honor_roll` in `achievements`.
> - **night_owl**: condizioni `Action( id == "use_library" )`, `InputData( $hours : data["hours"] )` più `eval( ((Number)$hours).doubleValue() >= 3 )`; conferisce `night_owl` nella collezione nascosta `secret_achievements`.

## 7. Simula e testa

Le regole scattano solo quando arriva un evento, quindi senza uno strumento apposta il solo modo di sapere se una regola funziona sarebbe mandare eventi veri a un giocatore vero, rischiando di rovinargli lo stato. La pagina **Scenari** serve proprio a evitarlo: esegue le tue regole su un giocatore **sintetico**, inventato, di cui descrivi a mano lo stato di partenza. Metti un punteggio qui, una collezione vuota là, scegli l'azione da far scattare, e il motore esegue le tue regole vere su quel giocatore usa e getta, senza toccare nessuno.

Di una simulazione non conta solo che giri: conta che si veda **tutto quello che fa**. Il risultato mostra esattamente quali regole sono **scattate**, cosa è **cambiato** (ogni punteggio prima e dopo, ogni medaglia guadagnata) e un piccolo **grafo** dello stato prima e dopo. Il debug delle regole smette così di essere un indovinare e diventa un guardare: se una medaglia che ti aspettavi non è arrivata, vedi se la sua regola è scattata e, quando non è scattata, quale condizione non ha trovato corrispondenza.

Una simulazione diventa anche un **test di regressione**. Quando sai qual è il risultato giusto, lo indichi come **risultato atteso** e salvi lo scenario: da quel momento lo scenario passa solo se un'esecuzione futura produce ancora quel risultato. Rieseguire gli scenari salvati dopo ogni modifica a una regola è il modo di accorgersi di una regola rotta per sbaglio prima che ci finiscano dentro i giocatori veri.

Che una regola compili è una domanda più piccola di come si comporta, e la risposta arriva prima. [Validare dall'editor](/guide/builder/6) compila la regola e ne segnala i problemi senza bisogno di un giocatore, di uno scenario o di un salvataggio: conviene togliersela di mezzo prima di spenderci una simulazione.

Accanto alla simulazione c'è un altro strumento. L'**analisi d'impatto** è un diagramma statico dei rapporti fra le tue regole, cioè di quale risultato di una regola può farne scattare o bloccare un'altra, e viene calcolato senza eseguire niente. Man mano che le regole diventano tante, è il modo più rapido di scovare un'interazione che non volevi, per esempio una regola che ne disattiva un'altra senza dirlo.

> **In Campus Quest.** Apri **Scenari**, aggiungine uno chiamato `la lezione raggiunge Sophomore`, e costruisci un giocatore sintetico con l'azione `attend_lecture`, un concetto `study_points` che parte da `95`, e una collezione `achievements` vuota. Simula. Dato che a 95 punti manca una sola lezione per arrivare a 100, i +10 scavalcano la soglia: il risultato mostra scattare `study points for lecture`, `first lecture badge` e `bookworm badge`, `study_points` che va da 95 a 105, ed entrambe le medaglie guadagnate. Salvalo con quel risultato atteso e da quel momento protegge quelle tre regole.

![Gli input della simulazione](/docs/images/simulation-inputs.png "Uno studente sintetico a una lezione dai 100 punti")

![Il risultato della simulazione](/docs/images/simulation-output.png "Regole attivate e cambiamenti risultanti")

## 8. Modelli di sfida

Una **sfida** assegna a un singolo giocatore un obiettivo specifico da raggiungere entro una finestra temporale, e un **modello di sfida** è il template riutilizzabile da cui è costruita. Il modello dà un nome a un tipo di sfida e ne dichiara le **variabili**: i valori che cambiano da una sfida concreta all'altra, come il target da raggiungere. Definire il template una volta significa che puoi distribuire molte sfide dello stesso tipo, ognuna con il proprio target e le proprie date, senza ridefinire la forma ogni volta.

Un modello, da solo, è inerte: non sfida nessuno finché da lui non nasce una sfida concreta assegnata a un giocatore, ed è in quel momento che le variabili prendono un valore. Un modello si usa in due modi: assegnato direttamente a un giocatore, oppure offerto come ricompensa di livello che il giocatore attiva dal suo inventario. Entrambi sono trattati nella sezione 12. Le sfide di gruppo, per scelta, non nascono da questi modelli: usano dei tipi predefiniti loro, descritti nella sezione 14.

> **In Campus Quest.** Apri **Modelli di sfida** e creane uno chiamato `weekly_study_goal` con una sola variabile, `target` (il numero di study points da raggiungere). La sezione 12 lo assegna a un giocatore e lo collega anche alla ricompensa del passaggio a Sophomore.

![Il form del modello di sfida](/docs/images/challenges-form.png "Il modello weekly_study_goal con una variabile target")

## 9. Giocatori

Un **giocatore** è chi partecipa a un gioco, ed è l'unità a cui è attaccato lo **stato**. Tutto quello che il motore sa di qualcuno (i punteggi, le medaglie guadagnate, il livello attuale, le sfide in corso e l'inventario) sta nel suo record di giocatore. Un giocatore esiste solo dentro il proprio gioco: la stessa persona che partecipa a due giochi ha due record indipendenti.

In produzione i giocatori si creano raramente a mano. Di solito succede questo: la prima volta che la tua applicazione invia un evento per un id mai visto, il motore crea quel giocatore da sé, e così l'elenco cresce mentre le persone vere cominciano a partecipare. Crearli in anticipo dalla console serve soprattutto a preparare un gruppo iniziale già noto, come fa questa guida, o a predisporre gli account prima del lancio. In ogni caso, aprendo un giocatore si arriva alla sua pagina di **dettaglio**, l'unico posto da cui vedere i suoi totali, le medaglie, il livello, le sfide e l'inventario.

> **In Campus Quest.** Apri **Giocatori** e aggiungi cinque studenti: `alice`, `bob`, `carol`, `dave` ed `eve`. Ognuno è per ora vuoto (zero punti, nessuna medaglia) perché non è avvenuto alcun evento; la sezione 11 cambia questo. Aprendone uno qualsiasi vedi la pagina di dettaglio a cui tornerai lungo le sezioni successive.

![L'elenco dei giocatori](/docs/images/players-list.png "I cinque studenti di Campus Quest")

## 10. Squadre

Una **squadra** è un gruppo di giocatori con un nome, ma con una differenza che conta: la squadra è a sua volta un'**entità con punteggio**. Ha lo stesso tipo di stato di un giocatore, con punteggi, medaglie e livello propri, quindi non è soltanto un'etichetta appiccicata su un insieme di membri: può guadagnare, salire di livello ed entrare in classifica a pieno titolo. Un gioco può così premiare l'attività collettiva separatamente da quella individuale, e far comparire squadre e singoli nella stessa classifica.

Una squadra guadagna punti come un giocatore, e li guadagna nello stesso modo: da eventi **indirizzati alla squadra**. Quando la tua applicazione invia un evento con l'id di una squadra al posto di quello di un giocatore, il motore esegue le regole per la squadra e ne aggiorna i punteggi propri; è così che premi un'attività genuinamente di squadra come una sessione di studio di gruppo. C'è poi una possibilità a parte, più avanzata: far confluire *automaticamente* l'attività di ogni membro nei totali della squadra, così che quando un membro frequenta una lezione salga anche il punteggio della squadra. Non arriva gratis: richiede uno schema di regole preciso, che la sezione 16 racconta per intero.

> **In Campus Quest.** Apri **Squadre** e crea `Team Alpha` con membri `alice` e `bob`, e `Team Beta` con `carol` e `dave`. Questo lascia `eve` senza squadra, il che va bene; l'appartenenza è facoltativa. Nella sezione 11 entrambe le squadre guadagnano punti da eventi indirizzati alla squadra.

![Il form della squadra](/docs/images/teams-form.png "Team Alpha con alice e bob")

## 11. Inviare eventi (giocare)

Fin qui è stata tutta progettazione: hai descritto *cosa può succedere* (le azioni), *quanto vale* (regole, punti, medaglie, livelli) e *chi gioca* (giocatori e squadre). Niente di tutto questo si muove finché il gioco non viene giocato davvero, e giocare è l'unica parte che nella console non abita affatto. Abita nella tua **applicazione**.

Un **evento** è il modo in cui il mondo esterno comunica al motore che è successo qualcosa. Quando uno studente reale frequenta una lezione o consegna un compito, è la tua applicazione (un'app mobile, un sito web, un job di backend) a inviare al motore un breve messaggio che dice "questo giocatore ha appena fatto questa azione". La console è dove *progetti e osservi* il gioco; la tua applicazione è ciò che lo *alimenta*. Ogni evento è una singola chiamata all'API del motore, e nell'istante in cui arriva il motore fa esattamente ciò che hai visto nel simulatore, ma per davvero: esegue le tue regole per quel giocatore, aggiunge punti, conferisce eventuali medaglie e ricalcola il suo livello.

Questa è la sola cosa che la console, per scelta, non fa al posto tuo. Qui non c'è una schermata che gioca: nessun pulsante che assegna un punto, nessun modulo che segna un'azione come fatta. Un evento vero arriva al motore solo passando dalle sue API, e non c'è altra strada. Ecco perché un gioco può essere finito nella console e sembrare comunque immobile fino a quando un'applicazione non comincia a parlargli. Quel lato lo racconta per intero il [capitolo sulle API](/guide/api), e in particolare [cosa accade mentre un gioco gira](/guide/api/4), che segue un'esecuzione dalla chiamata allo stato che lascia dietro di sé. Quello che trovi qui sotto serve a farti vedere che forma ha.

Un evento porta con sé quattro cose: **a quale gioco** appartiene, **quale giocatore** l'ha fatto, **quale azione** è avvenuta (un id dalla sezione 2) e qualsiasi **dato extra** di cui l'azione ha bisogno (un `grade`, un numero di `hours`). In concreto, la tua applicazione effettua il login una volta per ottenere un token di accesso e poi invia gli eventi. Un evento semplice si presenta così:

```
POST /api/v1/executions
{
  "gameId":   "<id del tuo gioco>",
  "playerId": "alice",
  "actionId": "attend_lecture",
  "data":     {}
}
```

e uno che porta dei dati si presenta così:

```
{ "playerId": "bob", "actionId": "submit_assignment", "data": { "grade": 24 } }
```

Dare punti a una **squadra** funziona in modo identico: invii l'evento con l'id della squadra al posto di quello del giocatore, perché anche una squadra è un'entità con punteggio (sezione 10). Se preferisci che il punteggio di una squadra cresca automaticamente da ciò che fanno i suoi membri, invece di inviare a mano eventi indirizzati alla squadra, quello è il pattern di propagazione della sezione 16.

> **In Campus Quest.** Per riprodurre lo stato d'esempio esatto su cui questa guida si basa, invia:
>
> - **alice**: `attend_lecture` dodici volte, poi `submit_assignment` con voto `30`, `use_library` con `4` ore, e un `join_event`.
> - **bob**: `attend_lecture` sei volte, `submit_assignment` con voto `24`, e un `join_event`.
> - **carol**: `attend_lecture` tre volte, e `use_library` con `2` ore.
> - **team-alpha**: `attend_lecture` otto volte e un `join_event`.
> - **team-beta**: `attend_lecture` cinque volte.
>
> Dopodiché, apri **alice**: ha 140 `study_points` (Sophomore), 3 `credits`, 20 `social_points`, e ogni medaglia inclusa la segreta `night_owl`. bob e carol hanno meno, ed entrambe le squadre hanno punti propri. Questo stato accumulato è ciò che le classifiche nella sezione 15 ordinano.

![Un profilo giocatore popolato](/docs/images/execution-result.png "alice dopo i suoi eventi: punti, livello e medaglie")

## 12. Sfide per un giocatore

Se il modello di sfida (sezione 8) è lo stampo, la **sfida** assegnata è il pezzo concreto: un obiettivo preciso, con valori e date precisi, consegnato a un giocatore. Una sfida ha un **ciclo di vita**. Di norma nasce nello stato `PROPOSED`, cioè è stata offerta al giocatore ma lui non si è ancora impegnato; poi il giocatore può **accettarla**, e allora passa a `ASSIGNED`, oppure rifiutarla. Questo passaggio in mezzo ti permette di proporre sfide a cui i giocatori aderiscono, invece di imporgli degli obiettivi.

Ci sono due modi distinti in cui un giocatore arriva ad avere una sfida, e vale la pena distinguerli. Il primo è un'**assegnazione diretta**: tu (o la tua applicazione) create la sfida per il giocatore in modo esplicito. Quando la tua applicazione lo fa tramite l'API, fornisce i valori delle variabili del modello nel campo `data` della richiesta, ad esempio `{"target": 200}`, esattamente come fornisce i dati degli eventi. Il secondo modo è come **ricompensa di livello**: invece di assegnare una sfida fissa, una soglia di livello può offrire al giocatore una *scelta* di sfida, che finisce nel suo inventario perché la attivi quando vuole (sezione 13). La ricompensa di una soglia si configura con un piccolo blocco che specifica quante scelte ottiene il giocatore e quali modelli sono disponibili.

Tutto questo ciclo di vita passa anche dalle API del motore, le stesse API autenticate con cui la tua applicazione invia gli eventi. La tua app può assegnare una sfida, e il giocatore accettarla o rifiutarla, direttamente dalla tua interfaccia; da lì in avanti il giocatore la fa avanzare semplicemente mandando i normali eventi di azione. Ognuna delle schermate della console che vedi qui ha quindi il suo corrispettivo che la tua applicazione può chiamare in produzione.

> **In Campus Quest.** Apri **alice**, clicca **Assegna sfida**, scegli il modello `weekly_study_goal`, chiama l'istanza `alice-weekly`, lascia lo stato iniziale `PROPOSED`, imposta una data di inizio e fine, e salva. Compare sulla sua pagina come `PROPOSED`; cliccare **Accetta** la porta a `ASSIGNED`.
>
> Per la ricompensa di livello, torna su **Livelli**, apri il livello, e sulla soglia **Sophomore** aggiungi una configurazione di sfida della soglia: imposta il **numero di scelte** a `1` e aggiungi `weekly_study_goal` ai modelli disponibili. Ora passare a Sophomore consegna al giocatore una scelta, che la sezione 13 riprende.

![Assegnazione di una sfida](/docs/images/assign-challenge-form.png "Proposta di weekly_study_goal ad alice")

## 13. Inventario e scelte del giocatore

L'**inventario** di un giocatore tiene le cose che gli sono state date ma che non ha ancora speso, e quello che contiene soprattutto sono le **scelte** di sfida. Quando un giocatore guadagna una scelta, di solito superando una soglia di livello a cui è stata configurata una ricompensa come nella sezione 12, nell'inventario compare un'**attivazione** disponibile: una decisione che sta a lui prendere. Invece di imporgli una sfida, gli si lascia la libertà di scegliere quale delle sfide offerte attivare.

Attivare una scelta la consuma: la sfida scelta diventa attiva sul giocatore e il numero di attivazioni disponibili scende. È il meccanismo che trasforma un passaggio di livello da cambio di titolo puramente estetico in qualcosa che il giocatore *fa*: arrivare a un traguardo gli mette in mano una decisione. Oltre all'attivazione decisa dal giocatore, un comando amministrativo **Forza** può attivare una scelta al posto suo, comodo per provare il flusso o per intervenire in assistenza.

> **In Campus Quest.** Manda a `dave` dieci eventi `attend_lecture` con le API della sezione 11; questo lo porta a 100 `study_points`, oltre la soglia Sophomore, quindi guadagna la scelta lì configurata. Apri **dave** e guarda la sezione **inventario**: mostra **Attivazioni disponibili: 1** e la scelta `weekly_study_goal` con un pulsante **Attiva**. Clicca **Attiva**; la sfida diventa attiva e il conteggio scende a 0. Il pulsante **Forza** fa lo stesso automaticamente.

![L'inventario di un giocatore con una scelta di sfida](/docs/images/player-inventory.png "La scelta di livello di dave, pronta da attivare")

## 14. Sfide di gruppo

Una **sfida di gruppo** mette più giocatori di fronte a un obiettivo condiviso, ed è una funzionalità distinta dalle sfide individuali della sezione 12. La differenza fondamentale è che una sfida di gruppo non è costruita da un modello che definisci tu; scegli invece uno di tre **tipi predefiniti**, ognuno dei quali definisce come si combinano i progressi dei membri e chi vince:

- **groupCooperative**, mostrato come *Cooperativa, il punteggio combinato deve raggiungere l'obiettivo*: i progressi di tutti si sommano e il totale viene confrontato con l'obiettivo. Se lo raggiunge vincono tutti i membri, se resta sotto non vince nessuno. Il motore limita anche il contributo di ciascuno a quanto manca ancora, così che l'ultimo ad agire non possa sforare per conto di tutti.
- **groupCompetitivePerformance**, mostrato come *Competitiva, vince il punteggio più alto*: i membri vengono confrontati fra loro e vince il punteggio più alto. Qui non è l'obiettivo a decidere l'esito: vince semplicemente chi ha guadagnato di più durante la sfida, e in caso di parità la vittoria è condivisa.
- **groupCompetitiveTime**, mostrato come *Competitiva, vincono tutti quelli che raggiungono l'obiettivo*: ogni membro viene misurato sull'obiettivo per conto proprio. Vince chiunque lo raggiunga, quindi è una gara contro il traguardo più che fra i partecipanti, e può finire con tutti vincitori o con nessuno.

In tutti e tre, ciò che viene misurato è il progresso che un membro fa sul concetto di punteggio scelto **durante** la sfida, non il totale che aveva già, e il progresso registrato non supera mai l'obiettivo.

Come le sfide individuali, anche quelle di gruppo hanno un ciclo di vita fatto di inviti. Un giocatore è il **proponente**: la imposta e **invita** gli altri come **ospiti**; ogni ospite può **accettare** o **rifiutare** prima dell'inizio, e il proponente può **annullarla** finché resta `PROPOSED`. Una sfida di gruppo parte quindi solo fra giocatori che hanno detto sì. Una volta accettata e in corso, prosegue fino alla sua data di fine, momento in cui il motore la conclude secondo il suo tipo e assegna la ricompensa.

Come per le sfide individuali, tutto il ciclo degli inviti passa dalle API: la tua applicazione può creare l'invito, gli ospiti accettare o rifiutare, il proponente annullare, il tutto con chiamate API invece che dalla console. Puoi quindi gestire le sfide di gruppo interamente dentro la tua app.

> **In Campus Quest.** Apri **alice** e, nell'area delle sfide di gruppo, clicca **Invita**. Seleziona `bob` come ospite, scegli il tipo `groupCooperative`, imposta il concetto di punteggio `study_points` e un **target** combinato di `300`, imposta date di inizio e fine e una ricompensa, e invia. La sfida compare come `PROPOSED` sia per alice (proponente) sia per bob (ospite); apri **bob**, trova la sfida `study-buddies` e clicca **Accetta** per portarla a `ASSIGNED`.

![Un invito a una sfida di gruppo](/docs/images/group-challenge.png "La sfida cooperativa di alice, accettata da bob")

## 15. Classifiche

Una **classifica** mette in fila le entità secondo un concetto di punteggio, ed è il punto in cui tutto lo stato accumulato giocando diventa finalmente una competizione che si vede. Viene calcolata in tempo reale sui punteggi attuali, quindi rispecchia sempre la situazione più recente. Ce ne sono di due tipi, e la differenza corrisponde direttamente ai periodi dei concetti di punteggio (sezione 3):

- **Generale**: un ordinamento di sempre in base al totale di un concetto.
- **Incrementale**: un ordinamento su uno dei **periodi** del concetto, che quindi si azzera a ogni finestra. È così che ottieni una classifica "di questa settimana" o "di questo mese" che riparte da zero mentre i totali di sempre continuano a crescere.

Dato che le squadre guadagnano come i giocatori (sezione 10), una classifica può mettere in fila singoli e squadre insieme. Un selettore di **ambito** in cima alla pagina alterna solo **Giocatori**, solo **Squadre** e **Tutti**, e le squadre portano un'icona di gruppo che le distingue. A parte questo, una classifica generale può avere una pianificazione **cron** e un numero di **posizioni da notificare**: il cron è il momento in cui il motore distribuisce le ricompense di posizione e avvisa i primi classificati. Quella pianificazione riguarda le ricompense, non l'ordine che vedi, che resta sempre in tempo reale.

> **In Campus Quest.** Apri **Classifiche** e creane tre. `overall_study` è Generale su `study_points`, con `3` posizioni da notificare e un cron settimanale. `weekly_study` è Incrementale su `study_points` sul periodo `weekly`. `social_monthly` è Incrementale su `social_points` sul periodo `monthly`. Apri `overall_study`, clicca **Mostra**, e imposta l'ambito su **Tutti**: l'ordinamento è `alice` (140), `dave` (100), **Team Alpha** (80), `bob` (60), **Team Beta** (50), `carol` (40), `eve` (0). Le classifiche incrementali rispecchiano per ora quella di sempre perché ogni evento è caduto nella finestra corrente, ma in un gioco reale ogni nuovo periodo parte vuoto e si riempie man mano che i giocatori agiscono.

![Una classifica con l'interruttore dell'ambito](/docs/images/leaderboard.png "overall_study, ambito Tutti: giocatori e squadre ordinati insieme")

## 16. Punteggio delle squadre tramite propagazione (avanzato)

La sezione 10 ha dato punti alle squadre nel modo semplice, con eventi indirizzati direttamente alla squadra. Qui vediamo l'alternativa più avanzata: far crescere il punteggio di una squadra **da sé**, a partire da quello che fanno i suoi membri, così che quando un membro frequenta una lezione salga anche il totale della squadra. Non è un'opzione da spuntare: è uno schema che scrivi nelle tue regole, e vale la pena conoscerlo come ricetta anche se Campus Quest resta sul modo semplice.

Il motivo per cui richiede un pattern speciale è che, normalmente un evento tocca solo il giocatore per cui è stato inviato: assegnare punti a un giocatore non arriva in alcun modo alle sue squadre. Per colmare la distanza servono due regole che si passano il lavoro. La prima, quella **lato giocatore**, assegna il punteggio come sempre e poi alza un segnale che dice al motore: "esegui questa stessa azione anche per le mie squadre". Il motore ubbidisce e riesegue l'azione per ognuna delle squadre di quel giocatore. La seconda, quella **lato squadra**, è quella che assegna davvero il punteggio alla squadra quando la riesecuzione arriva. Le due si distinguono con `Player(team == false)` da un lato e `Player(team == true)` dall'altro.

I numeri che servono li trasporta il motore al posto tuo. In termini di regole, il segnale è un fatto `UpdateTeams` che passi a `insert`, riempito con `addData` di tutti i valori che serviranno alla regola di squadra; quando il motore riesegue l'azione per una squadra, quei valori arrivano alla regola lato squadra dentro un fatto `Transmission`. Ecco la regola della lezione della sezione 6, riscritta come coppia che propaga:

```
package eu.trentorise.game.model

// lato giocatore: assegna il punteggio allo studente, poi chiedi al motore di aggiornare le sue squadre
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

// lato squadra: quando la lezione di un membro propaga qui, assegna il punteggio alla squadra
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

Sostituire l'unica regola `study points for lecture` con questa coppia fa sì che ogni lezione che un membro frequenta alzi anche gli `study_points` della sua squadra, senza bisogno di eventi indirizzati alla squadra. La direzione inversa, un'azione di squadra che ricade su ogni membro, funziona allo stesso modo usando un segnale `UpdateMembers` e un fatto `Team` sul lato membro. Due cose sono essenziali: metti i valori che ti servono in `addData` (un `UpdateTeams` vuoto non porta nulla, quindi la regola di squadra non avrebbe niente da leggere), e proteggi sempre le due regole con `team == false` e `team == true` così che ciascuna si attivi solo nel posto giusto.

## 17. Bloccare giocatori

A volte è meglio che due giocatori non finiscano insieme, per esempio dopo che uno si è comportato male in un'attività condivisa. Per questo ogni giocatore può tenere una **lista di bloccati**: gli altri giocatori con cui non verrà messo insieme. L'effetto concreto si vede subito nelle sfide di gruppo (sezione 14): chi è nella tua lista non compare fra le persone che puoi invitare, e così il blocco agisce da solo, senza che tu debba farlo rispettare caso per caso.

Il blocco è **di ciascun giocatore** e vale **in una sola direzione**. Sta sul record di chi blocca e riguarda soltanto lui: se alice blocca eve, eve non comparirà fra gli inviti di alice, ma niente impedisce a eve di invitare alice. Per togliere un blocco basta rimuovere la voce dalla lista.

Anche bloccare e sbloccare sono chiamate API, quindi la tua applicazione può gestire direttamente la lista dei bloccati di un giocatore, ad esempio offrendo un comando "blocca questo giocatore" nella tua interfaccia.

> **In Campus Quest.** Apri **alice**, trova l'area dei **giocatori bloccati**, e blocca `eve`; ora compare nella lista dei bloccati di alice e non emergerà quando alice invita ospiti a una sfida di gruppo. Rimuovere `eve` dalla lista toglie il blocco.

![La lista dei bloccati di un giocatore](/docs/images/block-player.png "alice ha bloccato eve")

## 18. Notifiche

Le **notifiche** sono il registro che il motore tiene dei momenti importanti di un gioco: una medaglia guadagnata, una sfida vinta o persa, una posizione raggiunta in classifica. Nascono da sé mentre il gioco va avanti, sia dalle tue regole (ogni regola di medaglia della sezione 6 ne manda una) sia dai task pianificati, come le esecuzioni cron delle classifiche.

Conviene essere chiari su dove si vedono. La console mostra dei brevi avvisi per le azioni che compi tu al suo interno, ma lo *storico* delle notifiche di un giocatore è fatto per essere letto dalla tua applicazione tramite le API e mostrato nella tua interfaccia, sullo stesso canale con cui mandi gli eventi e leggi lo stato. In altre parole: la console è la vista di chi gestisce il gioco, mentre la vista del giocatore la costruisci tu.

## Conclusione

A questo punto hai visto il motore per intero. Il gioco ti dà un vocabolario di azioni; concetti di punteggio, medaglie e livelli trasformano quelle azioni in punteggi, riconoscimenti e ranghi; le regole tengono insieme il tutto, e il simulatore ti permette di dimostrare che funzionano prima di toccare un giocatore vero. Su queste fondamenta, le sfide, individuali e di gruppo, gli inventari e le scelte danno ai giocatori degli obiettivi e la libertà di decidere; giocatori e squadre accumulano stato dagli eventi che manda la tua applicazione; le classifiche trasformano quello stato in competizione; e il punteggio di una squadra può anche crescere da sé.

La cosa da tenere a mente è che niente di tutto questo riguarda solo lo studio. Campus Quest era solo una lente: ogni concetto che hai visto si riusa altrove. Metti le tue azioni, i tuoi concetti di punteggio e le tue regole, e con gli stessi mattoni costruisci qualsiasi esperienza basata su un punteggio, che sia un'app per il fitness, un programma di fidelizzazione o una piattaforma per il coinvolgimento dei dipendenti. La console non dà mai per scontato di cosa parli il tuo gioco: ti passa soltanto i pezzi.

Il passo successivo è appropriarti dell'esempio. Cambia una regola e riesegui il suo scenario, per vedere che il test salvato si accorge della differenza; aggiungi un'azione nuova e premiala; inventa una medaglia e scrivi la regola che la conferisce. Quando i pezzi ti sono familiari, apri un gioco nuovo e costruisci per il tuo dominio, tornando qui alla sezione che ti serve ogni volta che vuoi controllare come si comporta esattamente una funzionalità. Questa guida è fatta per essere letta una volta dall'inizio alla fine, e poi tenuta lì come riferimento.

Quando la parte difficile non è più progettare ma collegare un'applicazione vera, prosegui con il [capitolo sulle API](/guide/api). È lo stesso motore visto dall'altro lato: come ottenere un token, come raggiungere dal codice ognuna delle cose che hai costruito qui, e come un evento diventa un punteggio.
