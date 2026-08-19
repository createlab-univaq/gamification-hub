# GamificationHub: una panoramica

GamificationHub trasforma le tue regole in un gioco. Descrivi cosa possono fare le persone che usano la tua applicazione, quanto vale ciascuna di quelle cose e dove portano; poi è la piattaforma a tenere il conto, giocatore per giocatore, e a dirti a che punto è arrivato ognuno.

Non è un gioco e non sostituisce la tua applicazione: è il segnapunti fra le due parti. La tua applicazione racconta cosa è successo, la piattaforma decide cosa significa, e ciascuna continua a fare quello che sa fare meglio. Di cosa parli il tuo gioco non è scritto da nessuna parte: con gli stessi mattoni si costruisce un'app per il fitness, un programma di fidelizzazione o un'iniziativa per il coinvolgimento degli studenti, perché nessuno dei tre è previsto dalla piattaforma. Sono tutti da costruire.

### Cosa fa la piattaforma

Un gioco, qui, è fatto di definizioni e di regole. Le definizioni sono i sostantivi: le **azioni** che possono avvenire, i **concetti di punteggio** che conservano i punti, le **medaglie** che si possono guadagnare, i **livelli** che assegnano un rango, i **modelli di sfida** che fissano gli obiettivi. Le regole sono i verbi, ed è lì che il gioco vive davvero: quando accade questo, aggiungi quello; quando questo punteggio supera quel numero, conferisci questa medaglia.

**Progettare un gioco non richiede codice.** Ogni suo pezzo si crea da una schermata della console: dai un nome a un'azione, aggiungi un punteggio, crei una collezione di medaglie, fissi le soglie di un livello, descrivi una sfida, metti i giocatori in squadra, apri una classifica. Non c'è niente da generare, niente da rilasciare, niente da tenere allineato a mano: il gioco che descrivi è il gioco che gira, e su ognuna di quelle scelte puoi tornare più tardi senza passare da uno sviluppatore.

**Le regole sono l'unica parte che è davvero logica**, e sono il solo punto in cui resta qualcosa che somiglia a programmare. Una regola stabilisce quando deve succedere qualcosa e cosa deve succedere: comunque la si scriva, è un piccolo programma. Per questo la console, invece di una pagina bianca, ti mette davanti un editor visuale: la regola la monti con dei blocchi che si incastrano solo nei modi che hanno senso, e il codice viene scritto per te mentre procedi. Quel codice lo puoi leggere, e all'occorrenza modificare a mano, ma non sei mai obbligato a partire da lì.

**Le prove vengono prima di qualsiasi giocatore reale.** Un gioco si può eseguire su un giocatore inventato, con lo stato di partenza che decidi tu: un punteggio qui, una collezione vuota là, un'azione da far scattare. Quello che ottieni non è un sì o un no, ma il racconto completo: quali regole sono scattate e cosa ha cambiato ciascuna. Quando vedi che il risultato è quello giusto lo salvi come risultato atteso, e da lì in avanti quella prova diventa un test da ripetere dopo ogni modifica. Nessun giocatore vero viene sfiorato.

**Mandare in funzione vuol dire salvare.** Non esiste un passaggio di pubblicazione e non c'è nessuna compilazione da aspettare: una regola salvata vale già per il primo evento che arriva. L'unico codice che qualcuno deve scrivere sta nella tua applicazione, e l'elenco è corto: raccontare cosa ha fatto una persona, rileggere cosa ha guadagnato. Tutto quello che sta in mezzo è il gioco che hai progettato.

Alla fine i compiti si dividono in modo netto. La piattaforma non ha opinioni proprie: non sa cosa sia un buon punteggio, non prevede premi già pronti, non assegna punti che tu non possa vedere. Si occupa della parte meccanica e ti lascia quella che è sempre stata tua, cioè decidere cosa merita di essere premiato.

### I pezzi, e come stanno insieme

La piattaforma è fatta di tre parti, e tutte si incontrano nelle regole.

La **console** è l'applicazione web da cui stai leggendo. Qui nasce e si controlla ogni pezzo di un gioco: azioni, punteggi, medaglie, livelli, modelli di sfida, giocatori, squadre, classifiche e le regole che li tengono insieme. Ed è anche il posto in cui un gioco si prova, su giocatori inventati, prima che lo tocchi qualcuno di reale.

Il **motore di regole** è la parte che esegue. Le regole si scrivono nel linguaggio di Drools, un motore di regole maturo incorporato nella piattaforma, e la console te ne offre due viste allineate: un editor visuale e il codice. Quando arriva un evento, il motore mette i fatti di quel momento davanti a tutte le regole e lascia scattare quelle che trovano corrispondenza.

Le **API** sono il modo in cui un gioco si gioca. Sono una normale interfaccia HTTP, e sono l'unica porta d'ingresso: la tua applicazione manda gli eventi, rilegge lo stato dei giocatori e gestisce le sfide passando da lì. La console stessa non usa altro, quindi tutto ciò che puoi fare a mano lo puoi fare anche da codice.

Dietro le quinte la piattaforma conserva sul server ogni gioco, ogni regola e lo stato di ogni giocatore, ed esegue i lavori pianificati secondo il calendario che imposti tu, come la consegna dei premi di una classifica. Quel calendario lo decidi tu; del resto non ti devi occupare.

### Com'è organizzata questa guida

Dopo questo vengono tre capitoli, nell'ordine in cui di solito un gioco si costruisce.

**[La Console](/guide/console)** è il capitolo lungo, ed è da qui che si parte. Attraversa ogni concetto nell'ordine in cui lo creeresti, dal primo gioco ai primi eventi, e spiega ogni idea prima di usarla: azioni, concetti di punteggio e i loro periodi, medaglie, livelli, regole, simulazione, sfide, giocatori, squadre, classifiche, notifiche. Leggilo una volta per intero e la piattaforma smette di sorprenderti.

**[L'editor di regole](/guide/builder)** approfondisce una sola schermata, blocco per blocco: cosa scrive ciascun blocco, cosa si incastra con cosa, come restano allineati i blocchi e il codice, e come validare una regola prima di salvarla. Leggilo quando il capitolo sulla console ti ha portato a scrivere regole e vuoi smettere di digitarle a mano.

**[Le API](/guide/api)** raccontano la stessa piattaforma vista dall'altro lato, e servono a chi deve collegarci un'applicazione: autenticazione, endpoint raggruppati per ciò che indirizzano, e cosa accade durante un'esecuzione. Leggile quando la progettazione è conclusa e qualcosa di reale deve parlare col motore.
