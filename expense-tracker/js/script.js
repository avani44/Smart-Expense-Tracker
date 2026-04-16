/* ===================================================
    SMART EXPENSE TRACKER — app.js
   =================================================== */

'use strict';

// ─── Constants ────────────────────────────────────────
const STORAGE_KEY = 'smartTracker_v1';

const CATEGORY_ICONS = {
    Salary: '💼',
    Freelance: '💻',
    Investment: '📈',
    Food: '🍔',
    Transport: '🚗',
    Shopping: '🛍️',
    Health: '💊',
    Entertainment: '🎬',
    Bills: '🧾',
    Education: '📚',
    Other: '🗂️',
    General: '📋',
};

// ─── State ────────────────────────────────────────────
let transactions = [];
let chartInstance = null;

// ─── Utilities ────────────────────────────────────────

/**
 * Format a number as Indian Rupee currency string.
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
    return '₹' + Math.abs(value).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Format a date string (YYYY-MM-DD) to a readable label.
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

/**
 * Extract YYYY-MM from a date string.
 * @param {string} dateStr
 * @returns {string}
 */
function getMonth(dateStr) {
    return dateStr ? dateStr.slice(0, 7) : '';
}

/**
 * Convert YYYY-MM to a short readable label, e.g. "Apr '25".
 * @param {string} ym
 * @returns {string}
 */
function monthLabel(ym) {
    const [y, m] = ym.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1, 1);
    return d.toLocaleString('en-IN', { month: 'short' }) + " '" + y.slice(2);
}

// ─── LocalStorage ────────────────────────────────────

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
        console.warn('LocalStorage write failed:', e);
    }
}

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        transactions = raw ? JSON.parse(raw) : [];
    } catch (e) {
        transactions = [];
    }
}

// ─── Toast Notification ───────────────────────────────

let toastTimer = null;

/**
 * Show a toast message.
 * @param {string} msg   - Message text
 * @param {'success'|'error'|'info'} type - Toast style
 */
function showToast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast show ${type}`;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast'; }, 2800);
}

// ─── Add Transaction ─────────────────────────────────

/**
 * Called by both income and expense buttons.
 * Reads form values, validates, pushes to array, saves, re-renders.
 * @param {string} type - 'income' | 'expense'
 */
function addTransaction(type) {
    const desc = document.getElementById('desc').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('txnDate').value;
    const category = document.getElementById('category').value;

    // ── Validation ──
    if (!desc) {
        showToast('Please enter a description.', 'error');
        document.getElementById('desc').focus();
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount greater than 0.', 'error');
        document.getElementById('amount').focus();
        return;
    }
    if (!date) {
        showToast('Please select a date.', 'error');
        document.getElementById('txnDate').focus();
        return;
    }

    const txn = {
        id: Date.now(),
        type,                   // 'income' | 'expense'
        desc,
        amount,
        date,
        category,
    };

    transactions.unshift(txn);
    saveData();
    clearForm();
    render();

    const label = type === 'income' ? 'Income' : 'Expense';
    showToast(`${label} of ${formatCurrency(amount)} added!`, 'success');
}

// ─── Delete Transaction ───────────────────────────────

/**
 * Remove a transaction by id.
 * @param {number} id
 */
function deleteTxn(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    render();
    showToast('Transaction deleted.', 'info');
}

// ─── Clear All ────────────────────────────────────────

function clearAll() {
    if (!transactions.length) { showToast('Nothing to clear.', 'info'); return; }
    if (!confirm('Delete ALL transactions? This cannot be undone.')) return;
    transactions = [];
    saveData();
    render();
    showToast('All transactions cleared.', 'info');
}

// ─── Form Helpers ─────────────────────────────────────

function clearForm() {
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
    // Keep date and category for convenience
}

// ─── Render Functions ─────────────────────────────────

/** Master render — updates summaries, list, and chart. */
function render() {
    renderSummary();
    renderTransactions();
    renderChart();
}

/** Update the three summary cards. */
function renderSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

    const balance = income - expense;

    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpense').textContent = formatCurrency(expense);

    const balEl = document.getElementById('netBalance');
    balEl.textContent = (balance < 0 ? '-' : '') + formatCurrency(balance);
    balEl.className = 'card-value ' + (balance >= 0 ? 'positive' : 'negative');
}

/** Render the filtered transaction list. */
function renderTransactions() {
    const query = (document.getElementById('searchBox').value || '').toLowerCase();
    const listEl = document.getElementById('txnList');

    const filtered = transactions.filter(t =>
        t.desc.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );

    if (!filtered.length) {
        listEl.innerHTML = `<p class="empty-msg">${query ? 'No results found. Try a different search.' : 'No transactions yet. Add one above!'
            }</p>`;
        return;
    }

    listEl.innerHTML = filtered.map(t => `
    <div class="txn-item">
        <div class="txn-icon ${t.type}">
        ${CATEGORY_ICONS[t.category] || '📋'}
        </div>
        <div class="txn-info">
        <p class="txn-desc">${escapeHtml(t.desc)}</p>
        <p class="txn-meta">${t.category} &bull; ${formatDate(t.date)}</p>
        </div>
        <div class="txn-right">
        <span class="txn-amount ${t.type}">
            ${t.type === 'income' ? '+' : '−'}${formatCurrency(t.amount)}
        </span>
        <button class="txn-del" onclick="deleteTxn(${t.id})" title="Delete">✕</button>
        </div>
    </div>
    `).join('');
}

/** Build / update the Chart.js bar chart. */
function renderChart() {
    // Aggregate by month
    const monthMap = {};
    transactions.forEach(t => {
        const ym = getMonth(t.date);
        if (!monthMap[ym]) monthMap[ym] = { income: 0, expense: 0 };
        monthMap[ym][t.type] += t.amount;
    });

    const sortedMonths = Object.keys(monthMap).sort();
    const labels = sortedMonths.map(monthLabel);
    const incomeData = sortedMonths.map(m => Math.round(monthMap[m].income));
    const expenseData = sortedMonths.map(m => Math.round(monthMap[m].expense));

    const ctx = document.getElementById('monthChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    // Empty state drawn on canvas
    if (!sortedMonths.length) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '14px Segoe UI, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.textAlign = 'center';
        ctx.fillText(
            'Add transactions to see your monthly chart',
            ctx.canvas.offsetWidth / 2,
            120
        );
        return;
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#1D9E75',
                    borderRadius: 6,
                    borderSkipped: false,
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: '#E24B4A',
                    borderRadius: 6,
                    borderSkipped: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ' ₹' + ctx.raw.toLocaleString('en-IN'),
                    },
                },
            },
            scales: {
                x: {
                    ticks: { color: '#64748B', font: { size: 12 } },
                    grid: { display: false },
                    border: { display: false },
                },
                y: {
                    ticks: {
                        color: '#64748B',
                        font: { size: 12 },
                        callback: v => '₹' + v.toLocaleString('en-IN'),
                    },
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    border: { display: false },
                },
            },
        },
    });
}

// ─── Security ─────────────────────────────────────────

/**
 * Prevent XSS when rendering user-supplied text in innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ─── Init ─────────────────────────────────────────────

function init() {
    // Set today's date as default
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('txnDate').value = today;

    // Load saved data and render
    loadData();
    render();
}

document.addEventListener('DOMContentLoaded', init);
