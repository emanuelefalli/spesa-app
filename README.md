# Spesa – Web App (senza login)

Nessun OAuth, nessun login Google sul telefono, nessuna scadenza.
La webapp chiama uno script Google Apps Script che scrive nel foglio per te.

## Come funziona

- La webapp invia i dati della spesa a un URL Apps Script
- Lo script è collegato al tuo Google Sheet e scrive la riga
- Una chiave segreta condivisa tra webapp e script impedisce scritture non autorizzate
- La chiave non è mai nel codice: nello script sta nelle **Proprietà script**, nella webapp viene chiesta al primo avvio e salvata solo nel browser del dispositivo
- L'autenticazione con Google avviene una sola volta, quando pubblichi lo script — mai più dopo

---

## Setup (15 minuti)

### 1. Crea il progetto Apps Script

1. Vai su https://script.google.com
2. **Nuovo progetto**
3. Cancella il codice di esempio nel file `Code.gs`
4. Apri il file `AppsScript.gs` incluso in questo zip, copia tutto il contenuto e incollalo al posto del codice cancellato

### 2. Imposta una chiave segreta

1. Nell'editor Apps Script apri **Impostazioni progetto** (icona ⚙️ a sinistra)
2. In fondo, **Proprietà script → Aggiungi proprietà script**
3. Proprietà: `SECRET_KEY` — Valore: una stringa lunga e casuale (es. una password casuale di 32 caratteri)
4. **Salva proprietà script**

Questa chiave impedisce a chiunque altro di scrivere nel tuo foglio anche se scoprisse l'URL dello script. Non scriverla mai nel codice: il repository è pubblico.

### 3. Testa lo script (opzionale ma consigliato)

1. In alto nell'editor Apps Script, seleziona la funzione `testAppend` dal menu a tendina
2. Premi ▶ Esegui
3. La prima volta ti chiederà di autorizzare l'accesso al tuo Google Sheet — accetta (è il tuo account, una tantum)
4. Controlla i log (Visualizza → Log) per vedere se ha trovato il foglio "Spese" e se `SECRET_KEY impostata: true`

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

Apri `config.js` e incolla solo l'URL:

```js
const CONFIG = {
  scriptUrl: "https://script.google.com/macros/s/XXXXXXX/exec",
  secretKeyStorageName: "spesa.secretKey"
};
```

Al primo avvio l'app chiede la chiave segreta e la salva nel browser di quel dispositivo. Se la chiave cambia, alla prima spesa rifiutata l'app la richiede di nuovo.

### 6. Carica su GitHub Pages (o dove preferisci)

Stessa procedura di prima: carica tutti i file su un repository GitHub Pages, o qualsiasi hosting statico.

### 7. Installa sulla home screen

Apri l'URL in **Safari** sull'iPhone → icona condivisione → **Aggiungi a Home**.

Nota: l'app installata sulla Home e Safari hanno archivi separati, quindi la chiave va inserita una volta in ciascuno.

---

## Giulia

La casella **Giulia** indica che la spesa è stata pagata anche per Giulia: se è selezionata, sul foglio viene scritta metà dell'importo inserito (arrotondata al centesimo). La casella si deseleziona dopo ogni spesa salvata.

## Aggiornare l'app

Dopo ogni modifica ai file, incrementa `CACHE_NAME` in `sw.js` (es. `spesa-v6` → `spesa-v7`), altrimenti il browser continua a usare i file in cache. Dopo il push, apri l'app e ricaricala una seconda volta.

---

## File

| File | Scopo |
|---|---|
| `AppsScript.gs` | Script da incollare in script.google.com — scrive nel foglio |
| `index.html` | Interfaccia (nessuna schermata di login) |
| `config.js` | URL dello script (la chiave segreta non è qui) |
| `categories.js` | Le 14 categorie con emoji |
| `sheets.js` | Chiamata fetch verso l'endpoint Apps Script |
| `app.js` | Logica del form |
| `manifest.json` / `sw.js` | Supporto PWA per l'installazione sulla home screen |

## Note sulla sicurezza

Chiunque conosca l'URL dello script *e* la chiave segreta può scrivere nel foglio. La chiave non è nel repository: si trova solo nelle Proprietà script e nel browser dei tuoi dispositivi. Per un uso strettamente personale questo livello di protezione è adeguato.
