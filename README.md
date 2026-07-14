# Spesa – Web App

Versione web dell'app, nessuna firma Apple, nessun rinnovo settimanale.
Funziona in Safari su iPhone e si può installare sulla home screen come una PWA.

## Setup (10 minuti)

### 1. Crea un nuovo OAuth Client ID di tipo "Web application"

Nello stesso progetto Google Cloud che hai già:

1. https://console.cloud.google.com → **Credenziali**
2. **Crea credenziali → ID client OAuth**
3. Tipo applicazione: **Applicazione web** (non iOS)
4. Nome: "Spesa Web"
5. Sotto **Origini JavaScript autorizzate** aggiungi l'URL dove ospiterai la pagina, es:
   ```
   https://tuonome.github.io
   ```
6. **Crea** → copia il **Client ID**

Nota: questo è un client ID diverso da quello iOS — il tipo "Web application" non usa redirect URI custom, solo l'origine.

### 2. Configura il file

Apri `config.js` e incolla il client ID:

```js
const CONFIG = {
  clientId: "IL_TUO_CLIENT_ID.apps.googleusercontent.com",
  ...
};
```

### 3. Ospita la pagina su GitHub Pages (gratis)

Se hai già un repository GitHub Pages (come per Wanderlines), puoi:

1. Crea un nuovo repository, es. `spesa-app`
2. Carica tutti i file di questa cartella (`index.html`, `config.js`, `categories.js`, `sheets.js`, `app.js`, `manifest.json`, `sw.js`)
3. Vai su **Settings → Pages** → Source: `main` branch, root
4. Dopo qualche minuto sarà live su `https://tuonome.github.io/spesa-app/`

### 4. Aggiungi un'icona (opzionale)

Metti un file `icon.png` (1024×1024) nella stessa cartella per l'icona della home screen.

### 5. Installa sulla home screen dell'iPhone

1. Apri l'URL in **Safari** (deve essere Safari, non Chrome, per l'installazione PWA su iOS)
2. Tocca l'icona di condivisione (quadrato con freccia in su)
3. **Aggiungi a Home**
4. L'icona apparirà come un'app vera, a schermo intero, senza barra Safari

---

## Come funziona

- Login Google tramite **Google Identity Services** (`google.accounts.oauth2`), token client — nessun server necessario, tutto lato client
- Il token di accesso è salvato in `sessionStorage` (si perde chiudendo il browser/tab — dovrai rifare il login ogni tanto, ma senza scadenze fisse di 7 giorni)
- Ogni submit scrive una riga in `Spese!A:D`: Data (`dd/MM`), Nome, Importo, Categoria
- Il foglio `Spese Mensili` si aggiorna automaticamente tramite le formule già presenti

## Differenze rispetto all'app nativa

| | App iOS nativa | Web app |
|---|---|---|
| Rinnovo firma | Ogni 7 giorni | Mai |
| Necessita Mac collegato | Sì, periodicamente | No |
| Aggiornamenti | Reinstallare da Xcode | Ricarica la pagina |
| Aspetto | Nativo iOS | Nativo (se installata da Safari) |
| Login persistente | Sì (Keychain) | Solo per la sessione del browser |

## File

| File | Scopo |
|---|---|
| `index.html` | Struttura e stile dell'interfaccia |
| `config.js` | Client ID Google e impostazioni foglio |
| `categories.js` | Le 14 categorie con le rispettive emoji |
| `sheets.js` | Autenticazione OAuth e chiamate API a Google Sheets |
| `app.js` | Logica dell'interfaccia e gestione eventi |
| `manifest.json` | Metadati per l'installazione come PWA |
| `sw.js` | Service worker per il funzionamento offline dei file statici |
