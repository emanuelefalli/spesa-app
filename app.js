// ---------- Elements ----------

const entryScreen    = document.getElementById("entryScreen");
const submitButton   = document.getElementById("submitButton");
const navTitle       = document.getElementById("navTitle");

const dateToggle          = document.getElementById("dateToggle");
const dateChevron         = document.getElementById("dateChevron");
const datePickerWrapper   = document.getElementById("datePickerWrapper");
const dateInput           = document.getElementById("dateInput");
const dateLabel           = document.getElementById("dateLabel");

const nameInput      = document.getElementById("nameInput");
const categorySelect = document.getElementById("categorySelect");
const amountInput    = document.getElementById("amountInput");
const noteInput      = document.getElementById("noteInput");

const overlay        = document.getElementById("overlay");
const alertTitle     = document.getElementById("alertTitle");
const alertMessage   = document.getElementById("alertMessage");
const alertButton    = document.getElementById("alertButton");

// ---------- State ----------

let submitting = false;

// ---------- Setup ----------

function populateCategories() {
  categorySelect.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.name;
    option.textContent = `${cat.emoji} ${cat.name}`;
    if (cat.name === "Cibo e bevande") option.selected = true;
    categorySelect.appendChild(option);
  });
}

function todayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const MONTHS_IT = ["gennaio","febbraio","marzo","aprile","maggio","giugno",
                   "luglio","agosto","settembre","ottobre","novembre","dicembre"];

function formatDateLabel(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} ${MONTHS_IT[month - 1]} ${year}`;
}

function updateDateLabel() {
  dateLabel.textContent = formatDateLabel(dateInput.value);
}

function updateNavTitle() {
  navTitle.textContent = nameInput.value.trim() === "" ? "Nuova spesa" : nameInput.value.trim();
}

function showAlert(title, message) {
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  overlay.classList.add("visible");
}

function hideAlert() {
  overlay.classList.remove("visible");
}

function parseAmount(raw) {
  const cleaned = raw.replace(",", ".").trim();
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

function updateSubmitState() {
  const amount = parseAmount(amountInput.value);
  submitButton.disabled = amount === null || submitting;
}

function resetForm() {
  nameInput.value = "";
  amountInput.value = "";
  noteInput.value = "";
  dateInput.value = todayDateString();
  updateDateLabel();
  updateNavTitle();
  updateSubmitState();
}

// ---------- Event wiring ----------

dateToggle.addEventListener("click", () => {
  const expanded = datePickerWrapper.classList.toggle("expanded");
  dateChevron.classList.toggle("expanded", expanded);
});

dateInput.addEventListener("change", () => {
  updateDateLabel();
  datePickerWrapper.classList.remove("expanded");
  dateChevron.classList.remove("expanded");
});

nameInput.addEventListener("input", updateNavTitle);

amountInput.addEventListener("input", () => {
  amountInput.value = amountInput.value.replace(/[^0-9.,]/g, "");
  updateSubmitState();
});

alertButton.addEventListener("click", hideAlert);

submitButton.addEventListener("click", async () => {
  const amount = parseAmount(amountInput.value);
  if (amount === null || submitting) return;

  submitting = true;
  updateSubmitState();
  const originalLabel = submitButton.textContent;
  submitButton.innerHTML = '<div class="spinner"></div>';

  const name = nameInput.value.trim() !== "" ? nameInput.value.trim() : noteInput.value.trim();

  try {
    await SheetsClient.appendExpense({
      date: dateInput.value,
      name: name,
      amount: amount,
      category: categorySelect.value
    });

    resetForm();
    showAlert("Salvato", "Spesa aggiunta al foglio.");
  } catch (err) {
    showAlert("Errore", err.message || "Si è verificato un errore.");
  } finally {
    submitting = false;
    submitButton.textContent = originalLabel;
    updateSubmitState();
  }
});

// ---------- Boot ----------

populateCategories();
dateInput.value = todayDateString();
updateDateLabel();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
