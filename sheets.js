const TOKEN_STORAGE_KEY = "spesa_access_token";

const SheetsClient = {
  tokenClient: null,
  accessToken: null,
  tokenExpiresAt: 0,

  init(onReady) {
    // google.accounts.oauth2 script loads async; poll until available
    const waitForGis = () => {
      if (window.google && google.accounts && google.accounts.oauth2) {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CONFIG.clientId,
          scope: CONFIG.scope,
          callback: "" // set per-request below
        });
        this.restoreSession();
        onReady();
      } else {
        setTimeout(waitForGis, 100);
      }
    };
    waitForGis();
  },

  restoreSession() {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.expiresAt > Date.now()) {
        this.accessToken = data.accessToken;
        this.tokenExpiresAt = data.expiresAt;
      } else {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },

  isAuthenticated() {
    return this.accessToken !== null && this.tokenExpiresAt > Date.now();
  },

  signIn() {
    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        this.accessToken = response.access_token;
        this.tokenExpiresAt = Date.now() + (response.expires_in * 1000);
        sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
          accessToken: this.accessToken,
          expiresAt: this.tokenExpiresAt
        }));
        resolve();
      };
      this.tokenClient.requestAccessToken({ prompt: "consent" });
    });
  },

  signOut() {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {});
    }
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  },

  async ensureValidToken() {
    if (this.isAuthenticated()) return;
    await this.signIn();
  },

  formatDateItalian(dateStr) {
    // dateStr comes from <input type="date"> as YYYY-MM-DD
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}`;
  },

  async appendExpense({ date, name, amount, category }) {
    await this.ensureValidToken();

    const dateString = this.formatDateItalian(date);
    const range = `${CONFIG.sheetName}!A:D`;
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const body = {
      values: [[dateString, name, amount, category]]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text();

      // Token may have been revoked/expired server-side even if not locally
      if (response.status === 401) {
        this.accessToken = null;
        this.tokenExpiresAt = 0;
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        throw new Error("Sessione scaduta. Effettua di nuovo il login.");
      }

      throw new Error(`Errore API (${response.status}): ${errorBody}`);
    }

    return response.json();
  }
};
