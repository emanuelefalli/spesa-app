// Apps Script standalone — incolla questo in un nuovo progetto da script.google.com

const SPREADSHEET_ID = "1dPJ71TdgfUUCy1_BzMt5XED1zkeC-nj5IMOFZIrJ_Ho";
const SHEET_NAME = "Spese";

// Cambia questa chiave con una stringa a tua scelta, lunga e casuale.
// Deve essere identica al valore di SECRET_KEY in config.js della webapp.
const SECRET_KEY = "EmanueleFalli99*xyz@";

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);

    if (params.key !== SECRET_KEY) {
      return jsonResponse({ success: false, error: "Non autorizzato" });
    }

    const name = params.name;
    const amount = params.amount;
    const category = params.category;

    if (!params.date || amount === undefined || !category) {
      return jsonResponse({ success: false, error: "Dati mancanti" });
    }

    // params.date arrives as "YYYY-MM-DD"; parse it as a local date so the
    // year is preserved and no UTC/timezone shift moves it to the wrong day.
    const [y, m, d] = params.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    if (isNaN(date.getTime())) {
      return jsonResponse({ success: false, error: "Data non valida" });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ success: false, error: "Foglio 'Spese' non trovato" });
    }

    const lastRow = sheet.getLastRow();
    const targetRow = lastRow + 1;

    sheet.getRange(targetRow, 1, 1, 4).setValues([[date, name, amount, category]]);

    return jsonResponse({ success: true, row: targetRow });

  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Funzione di test - eseguila manualmente da Apps Script per verificare che tutto funzioni
function testAppend() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  Logger.log("Foglio trovato: " + sheet.getName());
  Logger.log("Ultima riga: " + sheet.getLastRow());
}
