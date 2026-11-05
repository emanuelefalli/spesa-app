// Apps Script standalone — incolla questo in un nuovo progetto da script.google.com

const SPREADSHEET_ID = "1dPJ71TdgfUUCy1_BzMt5XED1zkeC-nj5IMOFZIrJ_Ho";
const SHEET_NAME = "Spese";

// La chiave segreta NON sta nel codice: impostala in
// Impostazioni progetto → Proprietà script → SECRET_KEY (vedi README).
const SECRET_KEY_PROPERTY = "SECRET_KEY";

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);

    const secretKey = PropertiesService.getScriptProperties().getProperty(SECRET_KEY_PROPERTY);

    if (!secretKey) {
      return jsonResponse({ success: false, error: "SECRET_KEY non configurata nelle Proprietà script" });
    }

    if (params.key !== secretKey) {
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
  Logger.log("SECRET_KEY impostata: " + Boolean(PropertiesService.getScriptProperties().getProperty(SECRET_KEY_PROPERTY)));
}
