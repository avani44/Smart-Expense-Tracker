# 💰 Smart Expense Tracker

A clean, fully client-side expense tracker built with **HTML, CSS, and vanilla JavaScript**.  
No frameworks, no build tools, no server — just open `index.html` and go.

---

## 📁 Project Structure

```
expense-tracker/
├── index.html          ← Main HTML file (entry point)
├── css/
│   └── style.css       ← All styles (variables, layout, components)
├── js/
│   └── app.js          ← All logic (CRUD, LocalStorage, Chart.js)
└── README.md           ← This file
```

---

## 🚀 Getting Started

### Option 1 — Open directly (easiest)
1. Download or unzip the project folder.
2. Double-click `index.html` — it opens in your browser.
3. Done! Start adding transactions.

> ⚠️ LocalStorage works even without a server.  
> Data is saved **per browser per device**.

---

### Option 2 — VS Code Live Server (recommended for development)
1. Open the project folder in [VS Code](https://code.visualstudio.com/).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.
4. Browser opens at `http://127.0.0.1:5500/`.

---

### Option 3 — Python local server
Open a terminal in the project folder and run:

```bash
# Python 3
python -m http.server 8080

# Then open:
# http://localhost:8080
```

---

## ✨ Features

| Feature | Details |
|---------|---------|
| ➕ Add Income | Name, amount, date, category |
| ➖ Add Expense | Same form, different button |
| 💾 LocalStorage | Data persists across page refreshes |
| 📊 Monthly Chart | Chart.js bar chart — income vs expenses per month |
| 🔍 Live Search | Filter transactions by description or category |
| 🗑️ Delete | Remove individual transactions |
| 💱 Currency | Indian Rupee (₹) formatted with `en-IN` locale |
| 📱 Responsive | Works on mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Custom properties, Grid, Flexbox, responsive design |
| **Vanilla JS (ES6+)** | DOM manipulation, LocalStorage API |
| **Chart.js (CDN)** | Monthly bar chart visualization |

No npm, no webpack, no React — pure web platform APIs.

---

## 📖 How to Use

1. **Add a transaction** — fill in description, amount, date, and category, then click **Add Income** or **Add Expense**.
2. **View summary** — the three cards at the top update instantly (Total Income, Total Expenses, Net Balance).
3. **Search** — type in the search box to filter your transaction list in real time.
4. **Delete** — click the ✕ button on any transaction to remove it.
5. **Chart** — scroll down to see your monthly income vs expense bar chart, auto-updated as you add data.
6. **Clear all** — use the "🗑 Clear All" button in the header to reset everything (with confirmation).

---

## 🎨 Customising

### Change the currency symbol
In `js/app.js`, find `formatCurrency()` and replace `'₹'` with your symbol (e.g. `'$'`, `'€'`).

### Add a new category
In both `index.html` (the `<select id="category">`) and `js/app.js` (`CATEGORY_ICONS` object), add your new entry.

### Change colours
All colours are CSS custom properties at the top of `css/style.css` under `:root { }`.

---

## 📦 Dependencies

| Library | Version | Loaded via |
|---------|---------|-----------|
| Chart.js | Latest | CDN (`cdn.jsdelivr.net`) |

No installation required — CDN is fetched at runtime.

---

## 🔒 Data & Privacy

All data is stored **locally in your browser** using `localStorage`.  
Nothing is sent to any server. Clearing browser data or using a different browser/device starts fresh.
