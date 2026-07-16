# Spesa – Web App (senza login)

Nessun OAuth, nessun login Google sul telefono, nessuna scadenza.
La webapp chiama uno script Google Apps Script che scrive nel foglio per te.

## Come funziona

- La webapp invia i dati della spesa a un URL Apps Script
- Lo script è collegato al tuo Google Sheet e scrive la riga
- Una chiave segreta condivisa tra webapp e script impedisce scritture non autorizzate
- L'autenticazione con Google avviene una sola volta, quando pubblichi lo script — mai più dopo

---

## Setup (15 minuti)

### 1. Crea il progetto Apps Script

1. Vai su https://script.google.com
2. **Nuovo progetto**
3. Cancella il codice di esempio nel file `Code.gs`
4. Apri il file `AppsScript.gs` incluso in questo zip, copia tutto il contenuto e incollalo al posto del codice cancellato

### 2. Imposta una chiave segreta

Nel codice appena incollato, trova questa riga:

```js
const SECRET_KEY = "CAMBIA_QUESTA_CHIAVE_1234567890";
```

Sostituiscila con una stringa lunga e casuale a tua scelta (es. genera una password casuale di 32 caratteri). Questa chiave impedisce a chiunque altro di scrivere nel tuo foglio anche se scoprisse l'URL dello script.

### 3. Testa lo script (opzionale ma consigliato)

1. In alto nell'editor Apps Script, seleziona la funzione `testAppend` dal menu a tendina
2. Premi ▶ Esegui
3. La prima volta ti chiederà di autorizzare l'accesso al tuo Google Sheet — accetta (è il tuo account, una tantum)
4. Controlla i log (Visualizza → Log) per vedere se ha trovato il foglio "Spese" correttamente

### 4. Pubblica come Web App

1. In alto a destra clicca **Esegui il deployment → Nuovo deployment**
2. Clicca l'icona a ingranaggio accanto a "Seleziona tipo" → **App web**
3. Configurazione:
   - Descrizione: "Spesa API"
   - Esegui come: **Me**
   - Chi ha accesso: **Chiunque**
4. **Esegui il deployment**
5. Ti chiederà di nuovo di autorizzare — accetta
6. Copia l'**URL web app** che appare (finisce con `/exec`)

⚠️ Ogni volta che modifichi il codice dello script, devi creare un **nuovo deployment** (o gestire quello esistente → modifica versione) perché l'URL pubblicato resti aggiornato.

### 5. Configura la webapp

Apri `config.js` e incolla l'URL e la chiave:

```js
const CONFIG = {
  scriptUrl: "https://script.google.com/macros/s/XXXXXXX/exec",
  secretKey: "LA_STESSA_CHIAVE_CHE_HAI_MESSO_NELLO_SCRIPT"
};
```

### 6. Carica su GitHub Pages (o dove preferisci)

Stessa procedura di prima: carica tutti i file su un repository GitHub Pages, o qualsiasi hosting statico.

### 7. Installa sulla home screen

Apri l'URL in **Safari** sull'iPhone → icona condivisione → **Aggiungi a Home**.

---

## File

| File | Scopo |
|---|---|
| `AppsScript.gs` | Script da incollare in script.google.com — scrive nel foglio |
| `index.html` | Interfaccia (nessuna schermata di login) |
| `config.js` | URL dello script e chiave segreta |
| `categories.js` | Le 14 categorie con emoji |
| `sheets.js` | Chiamata fetch verso l'endpoint Apps Script |
| `app.js` | Logica del form |
| `manifest.json` / `sw.js` | Supporto PWA per l'installazione sulla home screen |

## Note sulla sicurezza

Chiunque conosca l'URL dello script *e* la chiave segreta può scrivere nel foglio. Non condividere l'URL pubblicamente. Per un uso strettamente personale questo livello di protezione è adeguato.
