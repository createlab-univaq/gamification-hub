# Campus Quest: guida completa alla console

Questa guida spiega ogni funzionalità della console di gamification, un concetto alla volta: che cos'è, perché esiste, come si comporta e quali opzioni hai quando la usi. Per mantenere le spiegazioni concrete anziché astratte, ognuna è illustrata con un unico esempio ricorrente, **Campus Quest**, un gioco di coinvolgimento universitario in cui gli studenti guadagnano punti e medaglie frequentando lezioni, consegnando compiti e usando la biblioteca; salgono di livello, entrano in squadre, affrontano sfide e competono nelle classifiche.

Leggila dall'inizio alla fine per un giro completo del motore, oppure salta alla sezione del concetto che ti serve. I riquadri **In Campus Quest** mostrano come ciascuna idea viene messa in pratica, con valori reali che puoi riprodurre se vuoi seguire nell'app; ma il punto di ogni sezione è il concetto, e Campus Quest serve solo a renderlo tangibile.

Nel testo, il **grassetto** indica un pulsante o un campo nella console, e il `codice` indica un valore concreto.

## 1. Crea il gioco

Un **gioco** è il contenitore di livello più alto per tutto il resto di questa guida. Le sue azioni, regole, concetti di punteggio, medaglie, giocatori, squadre e classifiche gli appartengono, e niente è condiviso tra giochi diversi: due giochi possono avere ciascuno un'azione chiamata `attend_lecture` senza mai interferire. Questo rende un gioco un'unità di lavoro sicura; puoi costruirne, esportarne, eliminarne o duplicarne uno senza toccare gli altri.

Crei un gioco con soltanto un **nome** e un **dominio**. Il dominio è un'etichetta libera per raggruppare giochi correlati (ad esempio tutti i giochi di un prodotto o di un reparto); non ha alcun effetto sul comportamento ed esiste solo per aiutarti a organizzare un elenco lungo. Una volta creato, un gioco si apre dalla dashboard, e la sua barra laterale a sinistra diventa il tuo indice per tutto ciò che descrivono le sezioni successive (Regole, Azioni, Concetti di punteggio, Medaglie, Livelli e così via).

Un gioco è anche portabile. Dalla dashboard puoi **Esportarlo** in un file, che è un'istantanea completa (regole, modelli di sfida, livelli e tutto il resto), e **Importare** quel file altrove. Le esportazioni sono il modo per fare il backup di un gioco, spostarlo tra ambienti diversi o consegnare una configurazione funzionante a qualcun altro.

> **In Campus Quest.** Nella dashboard **Giochi**, clicca **Aggiungi**, imposta **Nome** su `Campus Quest` e **Dominio** su `campus`, e **Salva**. Aprilo dall'elenco; il resto di questa guida lavora dentro questo unico gioco.

![Il form del nuovo gioco](/docs/images/create-game.png "Creazione di Campus Quest: nome e dominio")

## 2. Azioni

Un'**azione** è il vocabolario di eventi che il tuo gioco comprende. Rappresenta qualcosa che un giocatore può fare e a cui il motore può reagire, come una lezione frequentata o un compito consegnato. Definire un'azione fa due cose: dà a quell'evento un **id** stabile a cui riferirti altrove, e permette al motore di accettare eventi che nominano quell'id. Da sola un'azione non fa nulla; non porta punti né logica. Il comportamento che trasforma un'azione in punti, medaglie o passaggi di livello si scrive separatamente, nelle **Regole** (sezione 6). Tenere le due cose distinte significa che puoi aggiungere, rinominare o ragionare sui tuoi eventi senza toccare la logica di punteggio, e viceversa.

Le azioni possono anche portare dei **dati**. Quando viene inviato un evento, può includere un piccolo carico di valori con nome, ad esempio un compito consegnato che porta un `grade` (voto), o una visita in biblioteca che porta un numero di `hours` (ore). Non dichiari mai questi dati sull'azione stessa; la forma del carico è aperta, e una regola legge semplicemente le chiavi che le interessano quando arriva un evento di quell'azione (la sezione 6 mostra come). Questo mantiene leggere le azioni: un'azione è un nome, e i dati che porta sono decisi da chi invia l'evento e letti dalla regola che ne ha bisogno.

> **In Campus Quest.** Apri **Azioni** e aggiungine cinque, ognuna con solo un nome: `attend_lecture`, `submit_assignment`, `use_library`, `join_event` e `answer_quiz`. Due di esse sono pensate per portare dati: `submit_assignment` porterà un `grade`, e `use_library` porterà `hours`. Ancora nulla reagisce a esse; è a questo che servono le regole.

![L'elenco delle azioni](/docs/images/actions-list.png "Le cinque azioni di Campus Quest")

## 3. Concetti di punteggio

Un **concetto di punteggio** è un punteggio con nome che il motore traccia in modo indipendente per ogni giocatore e ogni squadra. Un gioco può definirne quanti ne servono, e conviene pensarli come valute separate: un giocatore può essere ricco in una e povero in un'altra, e ciascuna è guadagnata e spesa dalle proprie regole. Separare così i punteggi permette a un singolo gioco di premiare comportamenti molto diversi senza mescolarli, e permette a ciascuno di alimentare i propri livelli e classifiche.

La parte potente di un concetto di punteggio sono i **periodi**. Oltre al totale progressivo di sempre, un concetto può tracciare una o più finestre temporali ricorrenti. Un periodo si definisce con un **nome**, l'arco di tempo in cui è valido e la **durata in giorni** di una singola finestra all'interno di quell'arco. L'arco si apre su una data di **inizio** che devi indicare e si chiude su una data di **fine** che puoi lasciare vuota: senza fine il periodo continua ad aprire nuove finestre a tempo indeterminato, indicandola invece si ferma. L'inizio non è una formalità, perché le finestre vengono disposte su una griglia fissa a partire da lì. Un periodo che parte il 1 marzo con una finestra di tre giorni tiene il primo conteggio dall'1 al 3 marzo, ne apre uno nuovo dal 4 al 6, un altro dal 7 al 9, e continua così ogni tre giorni; se è indicata una data di fine, l'ultima finestra viene troncata a quella data invece di durare per intero. Un evento con data precedente all'inizio non porta punti a quel periodo, e una volta passata la fine non si apre più nessuna finestra; in entrambi i casi, però, il totale di sempre continua a crescere. Il numero di **finestre mantenute** limita quante finestre passate vengono conservate, scartando le più vecchie oltre quel numero. Il motore tiene un conteggio separato per la finestra corrente di ogni periodo, azzerandolo quando la finestra si rinnova, mentre il totale di sempre continua a crescere intatto. È questo che rende possibili le classifiche "di questa settimana" e "di questo mese": lo stesso concetto alimenta sia una classifica di sempre sia una periodica (sezione 15). Un concetto senza periodi è semplicemente un punteggio di sempre.

> **In Campus Quest.** Apri **Concetti di punteggio** e creane tre. `study_points` è il punteggio accademico principale, con un periodo `weekly` di `7` giorni, fatto partire da una qualsiasi data passata e lasciato senza fine così che la finestra continui a ripetersi in avanti. `credits` sono i crediti formali del corso, un punteggio di sempre senza periodi. `social_points` copre la vita sociale del campus, con un periodo `monthly` di `30` giorni. Tutti e tre partono da zero per ogni giocatore, e le regole della sezione 6 danno al motore dei motivi per farli crescere.

![L'elenco dei concetti di punteggio](/docs/images/point-concepts-list.png "I tre concetti di punteggio, con i loro periodi")

## 4. Medaglie

Una **medaglia** è un riconoscimento una tantum: un giocatore ce l'ha oppure no, a differenza di un concetto di punteggio, che è un numero che sale e scende. Le medaglie sono raggruppate in **collezioni**, e una collezione è **visibile** oppure **nascosta**. Una collezione visibile è mostrata al giocatore fin dall'inizio (di solito con le sue medaglie guadagnate e non ancora guadagnate), il che è utile per pubblicizzare gli obiettivi da raggiungere. Una collezione nascosta resta invisibile finché il giocatore non guadagna la sua prima medaglia al suo interno, il che è ideale per i traguardi segreti e le sorprese.

C'è un dettaglio di questo motore che vale la pena capire, perché determina come imposti le medaglie. Una collezione di medaglie, nel modello del motore, *è* l'insieme delle medaglie che un giocatore ha **guadagnato**. Non esiste un catalogo separato di medaglie "possibili": ciò che una collezione contiene è ciò che al giocatore è già stato conferito. La conseguenza pratica è che crei le collezioni **vuote** (solo un nome e una visibilità), e le medaglie effettive sono conferite in fase di gioco dalle **regole** (sezione 6). Se digitassi dei nomi di medaglia in una collezione al momento della creazione, ogni giocatore risulterebbe già in loro possesso.

> **In Campus Quest.** Apri **Medaglie** e crea due collezioni vuote: `achievements`, lasciata **Visibile**, e `secret_achievements`, impostata su **Nascosta**. Non aggiungere medaglie a mano. Durante il gioco, le regole conferiscono `first_lecture`, `bookworm`, `honor_roll` e `social_butterfly` in `achievements`, e la segreta `night_owl` in `secret_achievements`. Quelle regole arrivano nella sezione 6.

![Il form della collezione di medaglie](/docs/images/create-badge.png "Creazione della collezione achievements")

## 5. Livelli

Un **livello** trasforma un concetto di punteggio in un rango. Scegli un concetto e definisci un elenco ordinato di **soglie** con nome, ognuna con un valore; il livello di un giocatore è la soglia più alta che il suo punteggio ha raggiunto. I livelli danno ai giocatori un senso di progressione che un numero grezzo non può dare: passare da un rango con nome al successivo è un traguardo, ed è qualcosa a cui il motore può reagire. Un gioco può definire diversi livelli, ciascuno basato su un concetto di punteggio differente, così che lo stesso giocatore possa essere un veterano su una scala e un novizio su un'altra.

I livelli fanno più che etichettare un giocatore. Poiché il motore conosce l'istante esatto in cui un giocatore supera una soglia, una soglia può portare una **ricompensa**: raggiungerla può consegnare al giocatore una **scelta di sfida**, una voce che finisce nel suo inventario perché la attivi in seguito (sezioni 12 e 13). È così che un passaggio di livello diventa un'opportunità invece che solo un nuovo titolo. Configurare quella ricompensa richiede che i modelli di sfida esistano già, quindi la aggiungiamo nella sezione 12.

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

Le regole sono il punto in cui il comportamento di un gioco prende davvero vita; tutto ciò che precedeva erano dichiarazioni di sostantivi, e le regole sono i verbi. Il motore integra un **motore di regole** (Drools), e ogni regola ha due parti: una parte **when** che elenca le condizioni, e una parte **then** che elenca le conseguenze. Quando arriva un evento, il motore mette una serie di **fatti** in memoria di lavoro (l'azione, i suoi dati, i punteggi e le medaglie attuali del giocatore e altro ancora), poi attiva ogni regola le cui condizioni **when** corrispondono. La parte **then** di una regola reagisce cambiando quei fatti: aggiungendo a un punteggio, conferendo una medaglia, inviando una notifica.

Basi le condizioni sui fatti. Quelli che userai più spesso:

| Fatto | Corrisponde a | Esempio |
|-------|---------------|---------|
| `Action( id == "..." )` | quale azione è avvenuta | `Action( id == "attend_lecture" )` |
| `InputData( $x : data["..."] )` | i dati inviati con l'azione | `InputData( $hours : data["hours"] )` |
| `PointConcept( name == "...", ... )` | il punteggio di un giocatore | `PointConcept( name == "study_points", score >= 100 )` |
| `BadgeCollectionConcept( name == "...", ... )` | la collezione di medaglie di un giocatore | `badgeEarned not contains "bookworm"` |
| `Game( $gameId : id )`, `Player( $playerId : id )` | il gioco e il giocatore correnti | usati per inviare una notifica di medaglia |

Due meccanismi vale la pena conoscerli fin da subito. Primo, la **salience** è la priorità di una regola: le regole con salience più alta si attivano prima. Questo conta quando una regola dipende dal risultato di un'altra, ad esempio una regola di medaglia che dovrebbe eseguire solo dopo che una regola di punteggio ha aggiornato il punteggio; dare alla regola di medaglia una salience negativa la fa aspettare. Secondo, una regola si protegge dal ripetersi controllando lo stato attuale nella sua parte **when**: una regola di medaglia che aggiunge `bookworm` si attiva solo quando la collezione *non* contiene già `bookworm`, così la medaglia viene conferita esattamente una volta.

Componi le regole nella pagina **Regole**, che tiene sincronizzate due rappresentazioni: un **costruttore a blocchi** visuale a sinistra, dove trascini condizioni e conseguenze, e un pannello di **codice DRL** accanto, dove puoi digitare la regola direttamente. Modificare l'una aggiorna l'altra. Un pulsante **valida** compila la regola e segnala i problemi in un pannello console, e **salva** la memorizza. Validare prima di salvare è l'abitudine che intercetta refusi ed errori di tipo prima che raggiungano un giocatore.

Prima della prima regola, due parole sulle poche righe che stanno sopra a ognuna, perché sono il motivo più frequente per cui una regola apparentemente corretta si rifiuta di compilare. Una regola viene compilata come un piccolo file sorgente, quindi ogni tipo che nomina deve essere risolvibile. Dichiarare `package eu.trentorise.game.model` in cima è ciò che ti permette di scrivere `Action`, `InputData`, `PointConcept` e `BadgeCollectionConcept` senza importarli, perché è il package in cui quei tipi vivono. Tutto ciò che sta fuori va importato per nome: `eu.trentorise.game.notification.BadgeNotification` per inviare la notifica di una medaglia, oppure `eu.trentorise.game.core.Utility` insieme a `global Utility utils;` se vuoi scrivere nel log da una regola. Se ometti la riga del package devi importare ogni tipo che nomini, concetti compresi. La validazione segnala un tipo non risolto come errore prima che tu possa salvare, quindi nulla di rotto arriva a un giocatore, ma saperlo trasforma un errore misterioso in uno ovvio.

La regola utile più semplice aggiunge a un punteggio quando avviene un'azione. Questa assegna 10 `study_points` per ogni lezione frequentata, e sopra non le serve altro che la riga del package:

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

La parte `when` corrisponde a due fatti: l'azione della lezione, e il concetto `study_points` del giocatore (legato a `$pc` così che la parte `then` possa cambiarlo). La parte `then` alza il punteggio e chiama `update` per dire al motore che il fatto è cambiato. Leggere i dati dall'evento funziona allo stesso modo, corrispondendo a un fatto `InputData` e legando la chiave che ti serve.

![Il costruttore di regole: blocchi, codice e console](/docs/images/rules-form.png "Costruzione di study_points_lecture")

Un paio di note su come sono organizzate le regole. Ogni regola salvata è un file a sé, ma un singolo file può contenere più di un blocco `rule "..." ... end`: il motore li compila tutti e restano indipendenti. È permesso, ma rende un file più difficile da leggere e mantenere, quindi l'approccio pulito è una regola per file. Un nome è speciale: una regola chiamata `constants` viene letta come un semplice file di proprietà (righe `chiave = valore`) invece che come DRL, e ogni chiave è pubblicata come costante globale che le tue regole possono usare (dopo averla dichiarata con `global` in cima a una regola). È il posto ordinato dove tenere soglie e numeri regolabili invece di ripetere valori letterali tra le regole.

> **In Campus Quest.** Il gioco usa nove regole, in due gruppi. Gli esempi qui sotto mostrano solo i blocchi `rule ... end`; ognuna è salvata come regola a sé e porta la stessa intestazione descritta sopra, cioè la riga del `package` più un import per tutto ciò che sta fuori da quel package. Ricordati di mettere gli import necessari in ogni regola che scrivi, altrimenti non verrà validata. Le **regole di punteggio** assegnano punteggi dalle azioni:
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
> Le **regole delle medaglie** conferiscono una medaglia quando una condizione è soddisfatta, e ognuna deve importare il tipo della notifica perché vive fuori dal package del modello. Usano una `salience` bassa così da eseguire dopo che le regole di punteggio hanno aggiornato i punteggi. Il pattern è identico ogni volta, quindi eccone una per intero, intestazione compresa, e le altre con le loro righe distintive:
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

Poiché le regole si attivano solo su eventi reali, altrimenti dovresti inviare eventi a un giocatore reale per scoprire se una regola si comporta bene, il che rischia di corrompere lo stato reale. Il motore evita del tutto questo con la pagina **Scenari**: esegue le tue regole contro un giocatore **sintetico** (inventato) di cui descrivi a mano lo stato iniziale. Imposti qui un punteggio, là una collezione vuota, scegli un'azione da lanciare, e il motore esegue le tue regole reali contro quel giocatore usa e getta senza toccare nessuno di reale.

Il valore di una simulazione non è solo che gira, ma che è pienamente **osservabile**. L'output mostra esattamente quali regole si sono **attivate**, cosa è **cambiato** (ogni punteggio prima e dopo, ogni medaglia guadagnata) e un piccolo **grafo** dello stato prima e dopo. Questo trasforma il debug delle regole da congettura a ispezione: se una medaglia che ti aspettavi non è comparsa, puoi vedere se la sua regola si è attivata e, se non l'ha fatto, quale condizione non ha trovato corrispondenza.

Una simulazione diventa anche un **test di regressione**. Una volta che conosci il risultato corretto, compili il **risultato atteso** e salvi lo scenario; da quel momento passa solo quando un'esecuzione futura produce ancora quel risultato. Rieseguire i tuoi scenari salvati dopo ogni modifica a una regola è il modo per intercettare una regola che hai rotto per sbaglio prima che raggiunga i giocatori reali.

Uno strumento in più affianca la simulazione. L'**analisi d'impatto** è un diagramma statico di come le tue regole si relazionano tra loro (quale output di una regola può attivarne o bloccarne un'altra), calcolato senza eseguire nulla. Man mano che l'insieme delle regole cresce, è il modo più rapido per individuare un'interazione indesiderata, come una regola che ne disattiva silenziosamente un'altra.

> **In Campus Quest.** Apri **Scenari**, aggiungine uno chiamato `la lezione raggiunge Sophomore`, e costruisci un giocatore sintetico con l'azione `attend_lecture`, un concetto `study_points` che parte da `95`, e una collezione `achievements` vuota. Simula. Poiché il punteggio parte a una lezione dai 100, i +10 superano la soglia: l'output mostra `study points for lecture`, `first_lecture_badge` e `bookworm_badge` che si attivano, `study_points` che va da 95 a 105, ed entrambe le medaglie guadagnate. Salvalo con quel risultato atteso e da quel momento protegge quelle tre regole.

![Gli input della simulazione](/docs/images/simulation-inputs.png "Uno studente sintetico a una lezione dai 100 punti")

![Il risultato della simulazione](/docs/images/simulation-output.png "Regole attivate e cambiamenti risultanti")

## 8. Modelli di sfida

Una **sfida** assegna a un singolo giocatore un obiettivo specifico da raggiungere entro una finestra temporale, e un **modello di sfida** è il template riutilizzabile da cui è costruita. Il modello dà un nome a un tipo di sfida e ne dichiara le **variabili**: i valori che cambiano da una sfida concreta all'altra, come il target da raggiungere. Definire il template una volta significa che puoi distribuire molte sfide dello stesso tipo, ognuna con il proprio target e le proprie date, senza ridefinire la forma ogni volta.

Un modello è inerte di per sé; non sfida nessuno finché non viene creata una sfida concreta a partire da esso e assegnata a un giocatore. È in quell'assegnazione che le variabili ricevono i loro valori. Ci sono due modi in cui un modello viene usato: assegnato direttamente a un giocatore, oppure offerto come ricompensa di livello che il giocatore attiva dal suo inventario. Entrambi sono trattati nella sezione 12. Le sfide di gruppo non sono deliberatamente costruite da questi modelli; usano i propri tipi predefiniti, descritti nella sezione 14.

> **In Campus Quest.** Apri **Modelli di sfida** e creane uno chiamato `weekly_study_goal` con una sola variabile, `target` (il numero di study points da raggiungere). La sezione 12 lo assegna a un giocatore e lo collega anche alla ricompensa del passaggio a Sophomore.

![Il form del modello di sfida](/docs/images/challenges-form.png "Il modello weekly_study_goal con una variabile target")

## 9. Giocatori

Un **giocatore** è un partecipante a un gioco, ed è l'unità che porta lo **stato**. Tutto ciò che il motore traccia su qualcuno (i suoi punteggi, le medaglie guadagnate, il livello attuale, le sfide attive e l'inventario) è appeso al suo record di giocatore. Un giocatore esiste solo dentro il suo gioco; la stessa persona che partecipa a due giochi ha due record di giocatore indipendenti.

In produzione crei raramente i giocatori a mano. Lo schema abituale è che la prima volta che la tua applicazione invia un evento per un id mai visto prima, il motore crea automaticamente quel giocatore, così il tuo elenco cresce man mano che le persone reali iniziano a partecipare. Creare i giocatori in anticipo, nella console, serve soprattutto a preparare un cast iniziale noto, come fa questa guida, o a inizializzare gli account prima del lancio. In ogni caso, aprire un giocatore raggiunge la sua pagina di **dettagli**, l'unico posto per ispezionare i suoi totali, medaglie, livello, sfide e inventario.

> **In Campus Quest.** Apri **Giocatori** e aggiungi cinque studenti: `alice`, `bob`, `carol`, `dave` ed `eve`. Ognuno è per ora vuoto (zero punti, nessuna medaglia) perché non è avvenuto alcun evento; la sezione 11 cambia questo. Aprendone uno qualsiasi vedi la pagina di dettaglio a cui tornerai lungo le sezioni successive.

![L'elenco dei giocatori](/docs/images/players-list.png "I cinque studenti di Campus Quest")

## 10. Squadre

Una **squadra** è un gruppo di giocatori con un nome, ma con una svolta importante: una squadra è essa stessa un'**entità con punteggio**. Possiede lo stesso tipo di stato di un giocatore (i propri punteggi, medaglie e livello), quindi non è solo un'etichetta sopra un insieme di membri; può guadagnare, salire di livello ed essere classificata a pieno titolo. Questo permette a un gioco di premiare l'attività collettiva separatamente da quella individuale, e permette a squadre e singoli di comparire insieme nella stessa classifica.

Poiché una squadra guadagna punti come un giocatore, li guadagna nello stesso modo di un giocatore: da eventi **indirizzati alla squadra**. Quando la tua applicazione invia un evento con l'id di una squadra al posto di quello di un giocatore, il motore esegue le regole per la squadra e ne aggiorna i punteggi propri; è così che premi un'attività genuinamente di squadra come una sessione di studio di gruppo. Una possibilità separata e più avanzata è far salire *automaticamente* l'attività individuale di ogni membro nei totali della sua squadra, così che quando un membro frequenta una lezione salga anche il punteggio della squadra. Questo non è automatico e richiede un pattern di regole specifico, che la sezione 16 tratta per intero.

> **In Campus Quest.** Apri **Squadre** e crea `Team Alpha` con membri `alice` e `bob`, e `Team Beta` con `carol` e `dave`. Questo lascia `eve` senza squadra, il che va bene; l'appartenenza è facoltativa. Nella sezione 11 entrambe le squadre guadagnano punti da eventi indirizzati alla squadra.

![Il form della squadra](/docs/images/teams-form.png "Team Alpha con alice e bob")

## 11. Inviare eventi (giocare)

Tutto fin qui è stato progettazione: hai descritto *cosa può succedere* (azioni), *quanto vale* (regole, punti, medaglie, livelli) e *chi gioca* (giocatori e squadre). Niente di tutto ciò fa qualcosa finché il gioco non viene davvero giocato, e giocare è l'unica parte che non vive affatto nella console. Vive nella tua **applicazione**.

Un **evento** è il modo in cui il mondo esterno comunica al motore che è successo qualcosa. Quando uno studente reale frequenta una lezione o consegna un compito, è la tua applicazione (un'app mobile, un sito web, un job di backend) a inviare al motore un breve messaggio che dice "questo giocatore ha appena fatto questa azione". La console è dove *progetti e osservi* il gioco; la tua applicazione è ciò che lo *alimenta*. Ogni evento è una singola chiamata all'API del motore, e nell'istante in cui arriva il motore fa esattamente ciò che hai visto nel simulatore, ma per davvero: esegue le tue regole per quel giocatore, aggiunge punti, conferisce eventuali medaglie e ricalcola il suo livello.

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

Dove un modello di sfida (sezione 8) è un template, una **sfida** assegnata è una sua istanza concreta: un obiettivo specifico, con valori di variabile specifici e date specifiche, consegnato a un giocatore. Una sfida ha un **ciclo di vita**. Di solito viene creata in stato `PROPOSED`, cioè al giocatore è stata offerta ma non si è impegnato; il giocatore può poi **accettarla**, portandola a `ASSIGNED`, oppure rifiutarla. Questo passaggio di proposta ti permette di offrire sfide a cui i giocatori aderiscono, invece di imporre loro degli obiettivi.

Ci sono due modi distinti in cui un giocatore arriva ad avere una sfida, e vale la pena distinguerli. Il primo è un'**assegnazione diretta**: tu (o la tua applicazione) create la sfida per il giocatore in modo esplicito. Quando la tua applicazione lo fa tramite l'API, fornisce i valori delle variabili del modello nel campo `data` della richiesta, ad esempio `{"target": 200}`, esattamente come fornisce i dati degli eventi. Il secondo modo è come **ricompensa di livello**: invece di assegnare una sfida fissa, una soglia di livello può offrire al giocatore una *scelta* di sfida, che finisce nel suo inventario perché la attivi quando vuole (sezione 13). La ricompensa di una soglia si configura con un piccolo blocco che specifica quante scelte ottiene il giocatore e quali modelli sono disponibili.

Tutto questo ciclo di vita è disponibile anche tramite l'API del motore, la stessa API autenticata che la tua applicazione usa per inviare eventi. La tua app può assegnare una sfida, e il giocatore può accettarla o rifiutarla, direttamente dalla tua interfaccia; da lì in poi il giocatore fa progredire la sfida semplicemente inviando i normali eventi di azione. Quindi le schermate della console mostrate qui hanno ciascuna una controparte che la tua applicazione può chiamare in produzione.

> **In Campus Quest.** Apri **alice**, clicca **Assegna sfida**, scegli il modello `weekly_study_goal`, chiama l'istanza `alice-weekly`, lascia lo stato iniziale `PROPOSED`, imposta una data di inizio e fine, e salva. Compare sulla sua pagina come `PROPOSED`; cliccare **Accetta** la porta a `ASSIGNED`.
>
> Per la ricompensa di livello, torna su **Livelli**, apri il livello, e sulla soglia **Sophomore** aggiungi una configurazione di sfida della soglia: imposta il **numero di scelte** a `1` e aggiungi `weekly_study_goal` ai modelli disponibili. Ora passare a Sophomore consegna al giocatore una scelta, che la sezione 13 riprende.

![Assegnazione di una sfida](/docs/images/assign-challenge-form.png "Proposta di weekly_study_goal ad alice")

## 13. Inventario e scelte del giocatore

L'**inventario** di un giocatore contiene le cose che gli sono state conferite ma non ancora spese, e la cosa principale che contiene sono le **scelte** di sfida. Quando un giocatore guadagna una scelta (di solito superando una soglia di livello configurata con una ricompensa, come nella sezione 12), l'inventario acquisisce un'**attivazione** disponibile: una decisione che il giocatore può prendere. Invece di imporgli una sfida specifica, al giocatore viene data libertà d'azione, e sceglie quale delle sfide offerte attivare.

Attivare una scelta la spende: la sfida scelta diventa attiva sul giocatore, e il conteggio delle attivazioni disponibili cala di conseguenza. È questo il meccanismo che trasforma un passaggio di livello da un cambio di titolo cosmetico in qualcosa che il giocatore *fa*: raggiungere un traguardo gli mette in mano una decisione. Accanto all'attivazione guidata dal giocatore, un comando amministrativo **Forza** può attivare una scelta per suo conto, il che è utile per testare il flusso o per interventi di supporto.

> **In Campus Quest.** Dai a `dave` dieci eventi `attend_lecture` (dal modo API della sezione 11); questo lo porta a 100 `study_points`, oltre la soglia Sophomore, quindi guadagna la scelta lì configurata. Apri **dave** e guarda la sezione **inventario**: mostra **Attivazioni disponibili: 1** e la scelta `weekly_study_goal` con un pulsante **Attiva**. Clicca **Attiva**; la sfida diventa attiva e il conteggio scende a 0. Il pulsante **Forza** fa lo stesso automaticamente.

![L'inventario di un giocatore con una scelta di sfida](/docs/images/player-inventory.png "La scelta di livello di dave, pronta da attivare")

## 14. Sfide di gruppo

Una **sfida di gruppo** mette più giocatori di fronte a un obiettivo condiviso, ed è una funzionalità distinta dalle sfide individuali della sezione 12. La differenza fondamentale è che una sfida di gruppo non è costruita da un modello che definisci tu; scegli invece uno di tre **tipi predefiniti**, ognuno dei quali definisce come si combinano i progressi dei membri e chi vince:

- **groupCooperative**, mostrato come *Cooperativa, il punteggio combinato deve raggiungere l'obiettivo*: i progressi di tutti si sommano e il totale viene confrontato con l'obiettivo. Se lo raggiunge vincono tutti i membri, se resta sotto non vince nessuno. Il motore limita anche il contributo di ciascuno a quanto manca ancora, così che l'ultimo ad agire non possa sforare per conto di tutti.
- **groupCompetitivePerformance**, mostrato come *Competitiva, vince il punteggio più alto*: i membri vengono confrontati fra loro e vince il punteggio più alto. Qui non è l'obiettivo a decidere l'esito: vince semplicemente chi ha guadagnato di più durante la sfida, e in caso di parità la vittoria è condivisa.
- **groupCompetitiveTime**, mostrato come *Competitiva, vincono tutti quelli che raggiungono l'obiettivo*: ogni membro viene misurato sull'obiettivo per conto proprio. Vince chiunque lo raggiunga, quindi è una gara contro il traguardo più che fra i partecipanti, e può finire con tutti vincitori o con nessuno.

In tutti e tre, ciò che viene misurato è il progresso che un membro fa sul concetto di punteggio scelto **durante** la sfida, non il totale che aveva già, e il progresso registrato non supera mai l'obiettivo.

Come le sfide individuali, una sfida di gruppo ha un ciclo di vita di invito. Un giocatore è il **proponente**, che la imposta e **invita** gli altri come **ospiti**; ogni ospite può **accettare** o **rifiutare** prima che inizi, e il proponente può **annullarla** finché è ancora `PROPOSED`. Questo significa che una sfida di gruppo parte solo tra giocatori che hanno aderito. Una volta accettata e in corso, prosegue fino alla sua data di fine, momento in cui il motore la conclude secondo il suo tipo e assegna la ricompensa.

Come per le sfide individuali, l'intero ciclo di vita dell'invito è esposto tramite l'API: la tua applicazione può creare l'invito, gli ospiti possono accettare o rifiutare, e il proponente può annullare, tutto tramite chiamate API invece che dalla console. Questo ti permette di gestire le sfide di gruppo interamente dentro la tua app.

> **In Campus Quest.** Apri **alice** e, nell'area delle sfide di gruppo, clicca **Invita**. Seleziona `bob` come ospite, scegli il tipo `groupCooperative`, imposta il concetto di punteggio `study_points` e un **target** combinato di `300`, imposta date di inizio e fine e una ricompensa, e invia. La sfida compare come `PROPOSED` sia per alice (proponente) sia per bob (ospite); apri **bob**, trova la sfida `study-buddies` e clicca **Accetta** per portarla a `ASSIGNED`.

![Un invito a una sfida di gruppo](/docs/images/group-challenge.png "La sfida cooperativa di alice, accettata da bob")

## 15. Classifiche

Una **classifica** ordina le entità in base a un concetto di punteggio, ed è dove tutto lo stato accumulato giocando diventa finalmente una competizione visibile. Una classifica è calcolata in tempo reale dai punteggi attuali, quindi riflette sempre lo stato più recente. Ce ne sono di due tipi, e la differenza corrisponde direttamente ai periodi dei concetti di punteggio (sezione 3):

- **Generale**: un ordinamento di sempre in base al totale di un concetto.
- **Incrementale**: un ordinamento su uno dei **periodi** del concetto, che quindi si azzera a ogni finestra. È così che ottieni una classifica "di questa settimana" o "di questo mese" che riparte da zero mentre i totali di sempre continuano a crescere.

Poiché le squadre guadagnano come i giocatori (sezione 10), una classifica può ordinare singoli e squadre insieme. Un interruttore di **ambito** in cima alla classifica passa tra soli **Giocatori**, sole **Squadre** e **Tutti** insieme, con le squadre contrassegnate da un'icona di gruppo così da distinguerle. Separatamente, una classifica generale può portare una pianificazione **cron** e un numero di **posizioni da notificare**; il cron è la pianificazione con cui il motore distribuisce le ricompense di posizione e le notifiche ai primi classificati. La pianificazione governa le ricompense, non l'ordinamento che vedi, che è sempre in tempo reale.

> **In Campus Quest.** Apri **Classifiche** e creane tre. `overall_study` è Generale su `study_points`, con `3` posizioni da notificare e un cron settimanale. `weekly_study` è Incrementale su `study_points` sul periodo `weekly`. `social_monthly` è Incrementale su `social_points` sul periodo `monthly`. Apri `overall_study`, clicca **Mostra**, e imposta l'ambito su **Tutti**: l'ordinamento è `alice` (140), `dave` (100), **Team Alpha** (80), `bob` (60), **Team Beta** (50), `carol` (40), `eve` (0). Le classifiche incrementali rispecchiano per ora quella di sempre perché ogni evento è caduto nella finestra corrente, ma in un gioco reale ogni nuovo periodo parte vuoto e si riempie man mano che i giocatori agiscono.

![Una classifica con l'interruttore dell'ambito](/docs/images/leaderboard.png "overall_study, ambito Tutti: giocatori e squadre ordinati insieme")

## 16. Punteggio delle squadre tramite propagazione (avanzato)

La sezione 10 ha dato punti alle squadre nel modo semplice, con eventi indirizzati direttamente alla squadra. Questa sezione spiega l'alternativa più avanzata: far crescere il punteggio di una squadra **automaticamente** da ciò che fanno i suoi membri, così che quando un membro frequenta una lezione salga anche il totale della sua squadra. Questo non è un comportamento automatico che attivi; è un pattern che scrivi nelle tue regole, e vale la pena capirlo come ricetta anche se Campus Quest stesso mantiene l'approccio semplice.

Il motivo per cui richiede un pattern speciale è che, normalmente, un evento tocca solo il giocatore per cui è stato inviato; niente nel dare punti a un giocatore raggiunge le sue squadre. Per colmare questo divario servono due regole che cooperano. La prima, la regola **lato giocatore**, esegue il suo solito punteggio e poi alza un segnale che dice al motore "esegui questa stessa azione anche per le mie squadre". Il motore risponde rieseguendo l'azione per ciascuna delle squadre del giocatore. La seconda, la regola **lato squadra**, è ciò che assegna effettivamente il punteggio alla squadra quando quella riesecuzione avviene. Le due si distinguono corrispondendo a `Player(team == false)` sul lato giocatore e `Player(team == true)` sul lato squadra.

Il motore trasporta i numeri rilevanti al posto tuo. In termini di regole, il segnale è un fatto `UpdateTeams` che `insert`isci, caricato tramite `addData` con qualunque valore servirà alla regola di squadra; quando il motore riesegue l'azione per una squadra, passa quei valori alla regola lato squadra dentro un fatto `Transmission`. Ecco la regola della lezione della sezione 6 riscritta come coppia che propaga:

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

Sostituire l'unica regola `study_points_lecture` con questa coppia fa sì che ogni lezione che un membro frequenta alzi anche gli `study_points` della sua squadra, senza bisogno di eventi indirizzati alla squadra. La direzione inversa, un'azione di squadra che ricade su ogni membro, funziona allo stesso modo usando un segnale `UpdateMembers` e un fatto `Team` sul lato membro. Due cose sono essenziali: metti i valori che ti servono in `addData` (un `UpdateTeams` vuoto non porta nulla, quindi la regola di squadra non avrebbe niente da leggere), e proteggi sempre le due regole con `team == false` e `team == true` così che ciascuna si attivi solo nel posto giusto.

## 17. Bloccare giocatori

A volte due giocatori non dovrebbero essere accoppiati, ad esempio dopo che qualcuno si è comportato male in un'attività condivisa. Per supportare questo, ogni giocatore può tenere una **lista di bloccati**: altri giocatori con cui non verrà accoppiato. L'effetto concreto immediato è sulle sfide di gruppo (sezione 14): un giocatore nella tua lista di bloccati non compare come opzione quando inviti degli ospiti, così il blocco impedisce silenziosamente l'accoppiamento invece di doverlo far rispettare caso per caso.

Il blocco è **per singolo giocatore** e **unidirezionale**. Il blocco vive sul record di chi blocca e influisce solo sul suo accoppiamento; alice che blocca eve tiene eve fuori dagli inviti di alice, ma non fa nulla per impedire a eve di inserire alice. Annullare un blocco è semplicemente rimuovere la voce dalla lista.

Anche bloccare e sbloccare sono chiamate API, quindi la tua applicazione può gestire direttamente la lista dei bloccati di un giocatore, ad esempio offrendo un comando "blocca questo giocatore" nella tua interfaccia.

> **In Campus Quest.** Apri **alice**, trova l'area dei **giocatori bloccati**, e blocca `eve`; ora compare nella lista dei bloccati di alice e non emergerà quando alice invita ospiti a una sfida di gruppo. Rimuovere `eve` dalla lista toglie il blocco.

![La lista dei bloccati di un giocatore](/docs/images/block-player.png "alice ha bloccato eve")

## 18. Notifiche

Le **notifiche** sono il registro del motore dei momenti significativi del gioco: una medaglia guadagnata, una sfida vinta o persa, una posizione in classifica raggiunta. Vengono prodotte automaticamente man mano che il gioco procede, sia dalle tue regole (ogni regola di medaglia nella sezione 6 ne invia una) sia da task pianificati come le esecuzioni cron delle classifiche. Aiuta essere chiari su dove emergono. La console mostra brevi pop-up per le azioni che compi al suo interno, ma lo *storico* delle notifiche di un giocatore è pensato per essere letto dalla tua applicazione tramite l'API e mostrato nella tua interfaccia, sullo stesso canale che invia gli eventi e legge lo stato. In altre parole, la console è la vista dell'operatore; la vista del giocatore è qualcosa che costruisci tu.

## Conclusione

Ora hai visto l'intero motore, dall'inizio alla fine. Un gioco ti dà un vocabolario di azioni; concetti di punteggio, medaglie e livelli trasformano quelle azioni in punteggi, riconoscimenti e ranghi; le regole tengono insieme tutto, e il simulatore ti permette di dimostrare che si comportano bene prima di toccare qualsiasi giocatore reale. Su queste fondamenta, le sfide (individuali e di gruppo), gli inventari e le scelte danno ai giocatori obiettivi e libertà d'azione; giocatori e squadre accumulano stato dagli eventi che la tua applicazione invia; le classifiche trasformano quello stato in competizione; e i punteggi delle squadre possono persino essere fatti crescere automaticamente.

Il punto da portare a casa è che niente di tutto ciò è specifico dello studio. Campus Quest era solo una lente: ogni concetto qui è riutilizzabile. Sostituisci le tue azioni, i tuoi concetti di punteggio e le tue regole, e gli stessi mattoni modellano qualsiasi esperienza basata su punteggio, che sia un tracker per il fitness, un programma di fidelizzazione dei clienti o una piattaforma di coinvolgimento interna. La console non presuppone mai di cosa parli il tuo gioco; ti dà soltanto i pezzi.

Un buon passo successivo è fare tuo l'esempio. Cambia una regola e riesegui il suo scenario per vedere il test salvato intercettare la differenza; aggiungi una nuova azione e premiala; inventa una medaglia e scrivi la regola che la conferisce. Una volta che i pezzi ti risultano familiari, avvia un nuovo gioco e costruisci per il tuo dominio, e torna a una qualsiasi sezione qui quando ti serve verificare esattamente come si comporta una funzionalità. Questa guida è pensata per essere letta una volta dall'inizio alla fine, e poi tenuta come riferimento.
