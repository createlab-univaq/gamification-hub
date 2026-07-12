# Gamification Engine — Guida all'applicazione

Una panoramica di cosa puoi fare in questa console: ogni pagina, cosa mostra e cosa fa ciascuna azione. Per l'API REST sottostante, consulta la documentazione per sviluppatori nel repository del progetto.

---

## 1. Accesso

La pagina di login permette di **accedere** con username e password, oppure di **passare alla registrazione** per creare un nuovo account. Il selettore di lingua (icona bandiera, in alto nella pagina) cambia la lingua della console tra Italiano e Inglese in qualsiasi momento — la scelta viene ricordata per le visite successive.

Dopo l'accesso, arrivi alla dashboard dei **Giochi**.

---

## 2. Giochi — la dashboard

La dashboard elenca ogni gioco che possiedi. Da qui puoi:

- **Cercare** giochi per nome.
- **Creare un nuovo gioco** — nome, dominio e, opzionalmente, una data di scadenza.
- **Importare giochi** — caricare una definizione completa di gioco (regole, modelli di sfida e metadati insieme) invece di crearne uno da zero.
- **Esportare** uno o più giochi in un file, ad esempio per farne un backup o spostarli in un altro ambiente.
- Fare clic su un gioco per **aprirlo** — questo porta alla sezione di quel gioco, con una barra laterale che copre tutto quanto segue (Regole, Azioni, Concetti Punteggio, Giocatori, Squadre, Classifiche, Medaglie, Livelli, Scenari, Modelli di Sfida).
- **Modificare** nome, dominio o stato di terminazione di un gioco, oppure **eliminarlo** del tutto.

Un gioco **terminato** viene segnato come non più attivo — i suoi dati restano intatti, ma segnala che il gioco si è concluso.

---

## 3. Regole

Le regole sono la logica che reagisce alle azioni dei giocatori (es. "quando un giocatore cammina, assegna 10 passi"). L'editor delle regole offre due modi per scriverne una, mantenuti sincronizzati:

- **Builder visuale** — blocchi trascinabili (condizioni, azioni, variabili) senza scrivere codice a mano.
- **Editor di codice** — lo script della regola equivalente, grezzo, per la modifica diretta.
- Un **pannello console** mostra l'esito della validazione e del salvataggio.

Prima di salvare, usa **Valida** per compilare la regola contro il gioco e individuare gli errori in anticipo — incluso il caso in cui la regola entri in conflitto con un'altra regola già presente nel gioco. **Salva** la persiste; la vista elenco permette di cercare, modificare o eliminare le regole esistenti.

### Analisi d'impatto
Una pagina separata (raggiungibile dalla sezione Regole) mostra un **grafo di come le regole interagiscono tra loro** — quali regole possono attivarne o bloccarne altre. È una visualizzazione best-effort per aiutarti a ragionare su insiemi di regole complessi prima di andare in produzione; non cattura tutto, quindi il test tramite gli Scenari (sotto) resta il modo affidabile per confermare il comportamento.

---

## 4. Azioni

L'elenco degli eventi con nome che il tuo gioco ascolta (es. `walk`, `check-in`). Puoi aggiungere nuovi nomi di azione, rinominarli o rimuovere quelli non più usati da alcuna regola. Le azioni sono ciò a cui fai riferimento scrivendo le condizioni delle regole, e ciò che un client rivolto al giocatore genera per far reagire il motore.

---

## 5. Concetti Punteggio

Le "valute" numeriche che il tuo gioco traccia per giocatore — es. `steps`, `points`, `coins`. Crea, rinomina o elimina qui. Il punteggio di un concetto punteggio parte sempre da zero per un nuovo giocatore e si muove in base a ciò che le tue regole ne fanno.

---

## 6. Medaglie

Le medaglie sono organizzate in **collezioni** — un gruppo con nome di medaglie che un giocatore può guadagnare (es. una collezione "traguardi" contenente `bronzo`, `argento`, `oro`). Le collezioni si gestiscono qui: creane una, elenca le medaglie al suo interno, e segna una collezione come **nascosta** se non vuoi che sia visibile ai giocatori finché non viene guadagnata.

---

## 7. Livelli

Un livello lega un **concetto punteggio** a una serie di **soglie** — valori di punteggio che rappresentano una progressione (es. "Principiante" a 0, "Esperto" a 500). Ogni soglia può anche sbloccare un insieme di **modelli di sfida**, permettendo ai giocatori di scegliere tra nuove sfide una volta superata. Definisci le soglie in ordine; la console permette di aggiungerle, modificarle o rimuoverle, e di scegliere quante scelte di sfida un giocatore riceve a ciascuna soglia.

---

## 8. Modelli di Sfida

I modelli di sfida sono **template** — un nome più un insieme di variabili — che vengono trasformati in sfide vere e proprie per i giocatori, tramite assegnazione diretta o inviti di gruppo (vedi Giocatori, sotto). I template si gestiscono qui; le pagine Giocatore della console sono dove le sfide vengono effettivamente assegnate alle persone.

---

## 9. Squadre

Una squadra raggruppa un insieme di giocatori sotto un nome. Crea una squadra, aggiungi o rimuovi membri (scelti tra i giocatori esistenti del gioco), rinominala o eliminala. Le squadre esistono come raggruppamento organizzativo — le sfide di gruppo (sotto) sono un meccanismo separato, basato su inviti.

---

## 10. Giocatori

L'elenco giocatori mostra tutti quelli registrati nel gioco, con ricerca e la possibilità di **aggiungere** un nuovo giocatore (tramite id) o **rimuoverne** uno. Fare clic su un giocatore apre la sua **pagina dettagli**, la pagina più ricca di funzionalità della console:

- **Concetti punteggio e medaglie** — i punteggi attuali del giocatore e le medaglie guadagnate, in un colpo d'occhio.
- **Sfide** — le istanze di sfida individuali del giocatore. Puoi **assegnare** una nuova sfida (scegliere un modello, dargli un nome istanza, una finestra di inizio/fine), **accettare** una sfida proposta per conto del giocatore, **modificarne** le date o la visibilità, oppure **eliminarla**.
- **Inventario** — le *scelte* di sfida che sono state offerte al giocatore (tipicamente dal superamento di una soglia di livello). Se una è disponibile, puoi **attivarla**, oppure **forzare** la prossima scelta in sospeso del giocatore se non ha ancora scelto.
- **Sfide di gruppo** — sfide multi-giocatore. Puoi **invitare** altri giocatori a una sfida di gruppo (scegliendo il modello di sfida, l'obiettivo, la ricompensa e gli ospiti), e per gli inviti esistenti: **accettarli**, **rifiutarli** o **annullarli**, a seconda che questo giocatore sia il proponente o un ospite.
- **Giocatori bloccati** — una lista di blocco personale che questo giocatore mantiene contro altri giocatori. Puoi **bloccare** un giocatore (scegliendolo dall'elenco giocatori del gioco) o **sbloccarne** uno già nella lista. Al momento questa è solo una registrazione — non impedisce ancora che un giocatore bloccato venga invitato a una sfida di gruppo.

---

## 11. Classifiche

Le classifiche classificano i giocatori in base a un concetto punteggio. Due tipi:

- **Generale** — una classifica di sempre, aggiornata secondo una pianificazione che definisci tu (un'espressione cron).
- **Incrementale** — classifica i giocatori all'interno di un periodo ricorrente specifico del concetto punteggio (es. settimanale), senza bisogno di pianificazione.

Creane una dandole un nome, scegliendo il tipo e il concetto punteggio, e (per quelle Generali) una pianificazione di aggiornamento. Apri una classifica per vedere la sua **board** — una classifica live, paginata, con i primi tre evidenziati, calcolata dai punteggi attuali nel momento in cui la visualizzi (non solo all'ultimo aggiornamento pianificato).

---

## 12. Scenari (Simulazione)

Gli scenari permettono di **testare il comportamento delle regole in sicurezza**, senza toccare alcun giocatore reale. Uno scenario definisce uno stato di partenza sintetico (concetti punteggio, medaglie, sfide attive) e una sequenza di azioni da generare; eseguirlo mostra lo stato risultante, quali regole si sono attivate e — se richiesto un output dettagliato — esattamente cosa ha cambiato ciascuna regola. Puoi anche salvare un **risultato atteso** insieme a uno scenario, trasformandolo in un controllo di regressione ripetibile: eseguilo di nuovo in seguito e verifica se il risultato corrisponde ancora a quanto ti aspetti.

Questo è il modo consigliato per validare le modifiche alle regole prima di affidarti ad esse per i giocatori reali.

---

## 13. Impostazioni account

Da Impostazioni puoi cambiare **username o password**, oppure **disattivare il tuo account**. La disattivazione è immediata per i nuovi accessi, anche se una sessione già in corso resta valida fino alla sua naturale scadenza.
