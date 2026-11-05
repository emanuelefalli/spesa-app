class UnauthorizedError extends Error {}

const SheetsClient = {
  async appendExpense({ secretKey, date, name, amount, category }) {
    const response = await fetch(CONFIG.scriptUrl, {
      method: "POST",
      // text/plain avoids a CORS preflight, which Apps Script web apps don't handle
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        key: secretKey,
        date: date,
        name: name,
        amount: amount,
        category: category
      })
    });

    if (!response.ok) {
      throw new Error(`Errore di rete (${response.status})`);
    }

    const result = await response.json();

    if (result.success) {
      return result;
    }

    if (result.error === "Non autorizzato") {
      throw new UnauthorizedError("Chiave segreta non valida.");
    }

    throw new Error(result.error || "Errore sconosciuto dal foglio");
  }
};
