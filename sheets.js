const SheetsClient = {
  async appendExpense({ date, name, amount, category }) {
    const [year, month, day] = date.split("-");
    const dateString = `${day}/${month}`;

    const response = await fetch(CONFIG.scriptUrl, {
      method: "POST",
      // text/plain avoids a CORS preflight, which Apps Script web apps don't handle
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        key: CONFIG.secretKey,
        date: dateString,
        name: name,
        amount: amount,
        category: category
      })
    });

    if (!response.ok) {
      throw new Error(`Errore di rete (${response.status})`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Errore sconosciuto dal foglio");
    }

    return result;
  }
};
