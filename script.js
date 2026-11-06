/**
 * SMART EXPENSE TRACKER
 * Senior Full-Stack Architecture - Production-Grade Vanilla JavaScript
 * Persistent LocalStorage, Chart.js Visualizations, Dynamic Budget Tracking & Analytics
 */

// ==========================================================================
// 1. CONSTANTS & DEFAULT CONFIGURATION
// ==========================================================================

const STORAGE_KEYS = {
    TRANSACTIONS: 'smart_expense_transactions_v2',
    CATEGORIES: 'smart_expense_categories_v2',
    BUDGETS: 'smart_expense_budgets_v2',
    SETTINGS: 'smart_expense_settings_v2'
};

const CURRENCY_CONFIG = {
    USD: { symbol: '$', code: 'USD', locale: 'en-US' },
    EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' },
    GBP: { symbol: '£', code: 'GBP', locale: 'en-GB' },
    INR: { symbol: '₹', code: 'INR', locale: 'en-IN' },
    JPY: { symbol: '¥', code: 'JPY', locale: 'ja-JP', noDecimals: true },
    CAD: { symbol: 'CA$', code: 'CAD', locale: 'en-CA' },
    AUD: { symbol: 'AU$', code: 'AUD', locale: 'en-AU' }
};

const DEFAULT_CATEGORIES = [
    // Expense Categories
    { id: 'cat-food', name: 'Food & Dining', type: 'expense', color: '#f97316', icon: 'food' },
    { id: 'cat-shopping', name: 'Shopping', type: 'expense', color: '#ec4899', icon: 'shopping' },
    { id: 'cat-travel', name: 'Travel & Transport', type: 'expense', color: '#06b6d4', icon: 'travel' },
    { id: 'cat-education', name: 'Education', type: 'expense', color: '#8b5cf6', icon: 'education' },
    { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', color: '#a855f7', icon: 'entertainment' },
    { id: 'cat-bills', name: 'Bills & Utilities', type: 'expense', color: '#eab308', icon: 'bills' },
    { id: 'cat-healthcare', name: 'Healthcare', type: 'expense', color: '#10b981', icon: 'healthcare' },
    { id: 'cat-other-exp', name: 'Other Expense', type: 'expense', color: '#64748b', icon: 'other' },

    // Income Categories
    { id: 'cat-salary', name: 'Salary', type: 'income', color: '#10b981', icon: 'salary' },
    { id: 'cat-freelance', name: 'Freelance & Contract', type: 'income', color: '#3b82f6', icon: 'wallet' },
    { id: 'cat-investments', name: 'Investments', type: 'income', color: '#6366f1', icon: 'trending-up' },
    { id: 'cat-side-biz', name: 'Side Business', type: 'income', color: '#14b8a6', icon: 'wallet' },
    { id: 'cat-gifts', name: 'Gifts & Grants', type: 'income', color: '#d946ef', icon: 'other' },
    { id: 'cat-other-inc', name: 'Other Income', type: 'income', color: '#64748b', icon: 'other' }
];

const COLOR_PALETTE = [
    '#38bdf8', '#6366f1', '#a855f7', '#ec4899', 
    '#f43f5e', '#f97316', '#eab308', '#10b981', 
    '#06b6d4', '#14b8a6', '#8b5cf6', '#64748b'
];

// ==========================================================================
// 2. APPLICATION STATE
// ==========================================================================

const AppState = {
    transactions: [],
    categories: [],
    budgets: {
        monthlyOverall: 4000,
        categories: {
            'Food & Dining': 600,
            'Shopping': 400,
            'Bills & Utilities': 500,
            'Entertainment': 250,
            'Travel & Transport': 300,
            'Healthcare': 200,
            'Education': 200
        }
    },
    settings: {
        currency: 'USD',
        theme: 'dark'
    },
    filters: {
        search: '',
        type: 'all',
        category: 'all',
        payment: 'all',
        datePreset: 'this-month',
        startDate: '',
        endDate: '',
        sortBy: 'date-desc',
        page: 1,
        pageSize: 25
    },
    activeView: 'dashboard',
    analyticsTimeframe: 'monthly',
    charts: {
        incomeExpense: null,
        categoryDonut: null,
        monthlyTrend: null,
        analyticsTimeline: null,
        analyticsSavings: null,
        analyticsDow: null,
        analyticsPayment: null
    }
};

// ==========================================================================
// 3. STORAGE SERVICE
// ==========================================================================

const StorageService = {
    load() {
        try {
            const rawTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
            const rawCat = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
            const rawBud = localStorage.getItem(STORAGE_KEYS.BUDGETS);
            const rawSet = localStorage.getItem(STORAGE_KEYS.SETTINGS);

            if (rawTx) AppState.transactions = JSON.parse(rawTx);
            if (rawCat) AppState.categories = JSON.parse(rawCat);
            else AppState.categories = [...DEFAULT_CATEGORIES];

            if (rawBud) AppState.budgets = JSON.parse(rawBud);
            if (rawSet) AppState.settings = { ...AppState.settings, ...JSON.parse(rawSet) };

            // If completely empty on first visit, load rich realistic demo data automatically
            if (!rawTx && (!AppState.transactions || AppState.transactions.length === 0)) {
                DemoDataService.loadDemoData(false);
            }
        } catch (err) {
            console.error('StorageService: Error reading from localStorage', err);
            AppState.categories = [...DEFAULT_CATEGORIES];
        }
    },

    saveTransactions() {
        try {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(AppState.transactions));
        } catch (err) {
            console.error('StorageService: Failed to save transactions', err);
            ToastService.show('Failed to save to local storage', 'error');
        }
    },

    saveCategories() {
        try {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(AppState.categories));
        } catch (err) {
            console.error('StorageService: Failed to save categories', err);
        }
    },

    saveBudgets() {
        try {
            localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(AppState.budgets));
        } catch (err) {
            console.error('StorageService: Failed to save budgets', err);
        }
    },

    saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(AppState.settings));
        } catch (err) {
            console.error('StorageService: Failed to save settings', err);
        }
    },

    clearAll() {
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
        localStorage.removeItem(STORAGE_KEYS.BUDGETS);
        AppState.transactions = [];
        AppState.categories = [...DEFAULT_CATEGORIES];
        AppState.budgets = { monthlyOverall: 0, categories: {} };
        this.saveTransactions();
        this.saveCategories();
        this.saveBudgets();
    }
};

// ==========================================================================
// 4. DEMO DATA GENERATOR
// ==========================================================================

const DemoDataService = {
    loadDemoData(showToast = true) {
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();

        const formatDate = (year, month, day) => {
            const dateObj = new Date(year, month, day);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        const sampleRecords = [
            // Current Month Income
            { id: 'demo-1', type: 'income', amount: 4850.00, description: 'Monthly Corporate Salary', category: 'Salary', paymentMethod: 'Bank Transfer', date: formatDate(y, m, 1), notes: 'Primary payroll direct deposit' },
            { id: 'demo-2', type: 'income', amount: 820.00, description: 'UI/UX Freelance Contract', category: 'Freelance & Contract', paymentMethod: 'Bank Transfer', date: formatDate(y, m, 5), notes: 'Web redesign milestone 2' },
            { id: 'demo-3', type: 'income', amount: 340.50, description: 'Stock Dividend Payout', category: 'Investments', paymentMethod: 'Digital Wallet', date: formatDate(y, m, 12), notes: 'Quarterly index fund dividend' },

            // Current Month Expenses
            { id: 'demo-4', type: 'expense', amount: 1250.00, description: 'Apartment Rent & Service Fee', category: 'Bills & Utilities', paymentMethod: 'Bank Transfer', date: formatDate(y, m, 2), notes: 'Monthly rent' },
            { id: 'demo-5', type: 'expense', amount: 145.20, description: 'Organic Grocery Whole Foods', category: 'Food & Dining', paymentMethod: 'Credit Card', date: formatDate(y, m, 3), notes: 'Weekly pantry stock' },
            { id: 'demo-6', type: 'expense', amount: 54.00, description: 'Fuel & Highway Tolls', category: 'Travel & Transport', paymentMethod: 'Credit Card', date: formatDate(y, m, 4), notes: 'Shell station' },
            { id: 'demo-7', type: 'expense', amount: 78.50, description: 'Fine Dining with Friends', category: 'Food & Dining', paymentMethod: 'Debit Card', date: formatDate(y, m, 6), notes: 'Italian bistro' },
            { id: 'demo-8', type: 'expense', amount: 120.00, description: 'Electricity & High-speed Internet', category: 'Bills & Utilities', paymentMethod: 'Digital Wallet', date: formatDate(y, m, 8), notes: 'Fiber broadband + power' },
            { id: 'demo-9', type: 'expense', amount: 165.00, description: 'Online Tech Certification Course', category: 'Education', paymentMethod: 'Credit Card', date: formatDate(y, m, 9), notes: 'Cloud architecture exam prep' },
            { id: 'demo-10', type: 'expense', amount: 210.00, description: 'Winter Apparel & Running Shoes', category: 'Shopping', paymentMethod: 'Credit Card', date: formatDate(y, m, 11), notes: 'Nike athletic gear' },
            { id: 'demo-11', type: 'expense', amount: 32.99, description: 'Movie Tickets & IMAX Popcorn', category: 'Entertainment', paymentMethod: 'Digital Wallet', date: formatDate(y, m, 13), notes: 'Weekend screening' },
            { id: 'demo-12', type: 'expense', amount: 85.00, description: 'Dental Checkup & Cleaning', category: 'Healthcare', paymentMethod: 'Debit Card', date: formatDate(y, m, 15), notes: 'Routine visit' },
            { id: 'demo-13', type: 'expense', amount: 112.40, description: 'Supermarket Grocery Haul', category: 'Food & Dining', paymentMethod: 'Credit Card', date: formatDate(y, m, 18), notes: 'Produce and essentials' },
            { id: 'demo-14', type: 'expense', amount: 45.00, description: 'Uber Rides across Town', category: 'Travel & Transport', paymentMethod: 'Digital Wallet', date: formatDate(y, m, 20), notes: 'Airport transit' },
            { id: 'demo-15', type: 'expense', amount: 69.90, description: 'Amazon Home Organization Tools', category: 'Shopping', paymentMethod: 'Credit Card', date: formatDate(y, m, 22), notes: 'Desk shelves' },
            { id: 'demo-16', type: 'expense', amount: 18.99, description: 'Streaming & Music Subscriptions', category: 'Entertainment', paymentMethod: 'Credit Card', date: formatDate(y, m, 24), notes: 'Spotify + Netflix' },

            // Past Month (m - 1)
            { id: 'demo-17', type: 'income', amount: 4850.00, description: 'Monthly Corporate Salary', category: 'Salary', paymentMethod: 'Bank Transfer', date: formatDate(y, m - 1, 1), notes: 'Previous month pay' },
            { id: 'demo-18', type: 'income', amount: 650.00, description: 'Consulting Honorarium', category: 'Freelance & Contract', paymentMethod: 'Bank Transfer', date: formatDate(y, m - 1, 14), notes: 'System architecture review' },
            { id: 'demo-19', type: 'expense', amount: 1250.00, description: 'Apartment Rent', category: 'Bills & Utilities', paymentMethod: 'Bank Transfer', date: formatDate(y, m - 1, 2), notes: '' },
            { id: 'demo-20', type: 'expense', amount: 420.00, description: 'Monthly Grocery Shopping', category: 'Food & Dining', paymentMethod: 'Credit Card', date: formatDate(y, m - 1, 10), notes: '' },
            { id: 'demo-21', type: 'expense', amount: 280.00, description: 'Weekend Getaway Lodging', category: 'Travel & Transport', paymentMethod: 'Credit Card', date: formatDate(y, m - 1, 17), notes: 'Cabin rental' },
            { id: 'demo-22', type: 'expense', amount: 140.00, description: 'Books and Audiobooks', category: 'Education', paymentMethod: 'Debit Card', date: formatDate(y, m - 1, 22), notes: '' },

            // Two Months Ago (m - 2)
            { id: 'demo-23', type: 'income', amount: 4850.00, description: 'Monthly Corporate Salary', category: 'Salary', paymentMethod: 'Bank Transfer', date: formatDate(y, m - 2, 1), notes: '' },
            { id: 'demo-24', type: 'income', amount: 450.00, description: 'Quarterly Bonus Award', category: 'Salary', paymentMethod: 'Bank Transfer', date: formatDate(y, m - 2, 15), notes: 'Performance bonus' },
            { id: 'demo-25', type: 'expense', amount: 1250.00, description: 'Apartment Rent', category: 'Bills & Utilities', paymentMethod: 'Bank Transfer', date: formatDate(y, m - 2, 2), notes: '' },
            { id: 'demo-26', type: 'expense', amount: 490.00, description: 'Food & Gourmet Groceries', category: 'Food & Dining', paymentMethod: 'Debit Card', date: formatDate(y, m - 2, 12), notes: '' },
            { id: 'demo-27', type: 'expense', amount: 320.00, description: 'Electronics & Audio Equipment', category: 'Shopping', paymentMethod: 'Credit Card', date: formatDate(y, m - 2, 20), notes: 'Wireless headphones' },
            { id: 'demo-28', type: 'expense', amount: 95.00, description: 'Concert Festival Pass', category: 'Entertainment', paymentMethod: 'Digital Wallet', date: formatDate(y, m - 2, 25), notes: '' },

            // Three Months Ago (m - 3)
            { id: 'demo-29', type: 'income', amount: 4850.00, description: 'Monthly Corporate Salary', category: 'Salary', paymentMethod: 'Bank Transfer', date: formatDate(y, m - 3, 1), notes: '' },
            { id: 'demo-30', type: 'expense', amount: 1250.00, description: 'Apartment Rent', category: 'Bills & Utilities', paymentMethod: 'Bank Transfer', date: formatDate(y, m - 3, 2), notes: '' },
            { id: 'demo-31', type: 'expense', amount: 380.00, description: 'Restaurant Dining Haul', category: 'Food & Dining', paymentMethod: 'Credit Card', date: formatDate(y, m - 3, 14), notes: '' },
            { id: 'demo-32', type: 'expense', amount: 190.00, description: 'Vehicle Service & Oil Change', category: 'Travel & Transport', paymentMethod: 'Debit Card', date: formatDate(y, m - 3, 18), notes: '' }
        ];

        AppState.transactions = sampleRecords;
        AppState.categories = [...DEFAULT_CATEGORIES];
        AppState.budgets = {
            monthlyOverall: 3500,
            categories: {
                'Food & Dining': 500,
                'Shopping': 350,
                'Bills & Utilities': 1450,
                'Entertainment': 150,
                'Travel & Transport': 200,
                'Healthcare': 150,
                'Education': 200
            }
        };

        StorageService.saveTransactions();
        StorageService.saveCategories();
        StorageService.saveBudgets();

        if (showToast) {
            ToastService.show('Realistic demo dataset loaded successfully!', 'success');
        }

        AppUI.refreshAll();
    }
};

// ==========================================================================
// 5. FORMATTING & CURRENCY UTILITIES
// ==========================================================================

const CurrencyService = {
    format(amount, forceSymbol = true) {
        const curCode = AppState.settings.currency || 'USD';
        const cur = CURRENCY_CONFIG[curCode] || CURRENCY_CONFIG.USD;
        const absVal = Math.abs(amount);

        const formatted = new Intl.NumberFormat(cur.locale, {
            minimumFractionDigits: cur.noDecimals ? 0 : 2,
            maximumFractionDigits: cur.noDecimals ? 0 : 2
        }).format(absVal);

        if (!forceSymbol) return formatted;
        const prefix = amount < 0 ? '-' : '';
        return `${prefix}${cur.symbol}${formatted}`;
    },

    getSymbol() {
        const curCode = AppState.settings.currency || 'USD';
        return (CURRENCY_CONFIG[curCode] || CURRENCY_CONFIG.USD).symbol;
    }
};

const DateService = {
    format(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    isSameMonth(dateStr, targetYear, targetMonth) {
        if (!dateStr) return false;
        const [y, m] = dateStr.split('-');
        return parseInt(y, 10) === targetYear && (parseInt(m, 10) - 1) === targetMonth;
    },

    getCurrentMonthYear() {
        const d = new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    }
};

// ==========================================================================
// 6. TOAST NOTIFICATIONS SERVICE
// ==========================================================================

const ToastService = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
    },

    show(message, type = 'info', duration = 3500) {
        if (!this.container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">${message}</div>
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration);
    }
};

// ==========================================================================
// 7. CHART.JS VISUALIZATION SERVICE
// ==========================================================================

const ChartService = {
    isDark() {
        return AppState.settings.theme === 'dark';
    },

    getCommonThemeOptions() {
        const dark = this.isDark();
        const gridColor = dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
        const textColor = dark ? '#94a3b8' : '#64748b';

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 500 },
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: dark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: dark ? '#f8fafc' : '#0f172a',
                    bodyColor: dark ? '#cbd5e1' : '#334155',
                    borderColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || context.label || '';
                            let value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                            return ` ${label}: ${CurrencyService.format(value)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: { color: textColor, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
                },
                y: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: {
                        color: textColor,
                        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                        callback: (val) => CurrencyService.format(val)
                    }
                }
            }
        };
    },

    destroyChart(key) {
        if (AppState.charts[key]) {
            AppState.charts[key].destroy();
            AppState.charts[key] = null;
        }
    },

    // 1. Dashboard: Income vs Expense Bar Chart
    renderIncomeExpenseChart() {
        this.destroyChart('incomeExpense');
        const ctx = document.getElementById('chart-income-expense');
        if (!ctx) return;

        // Group last 6 months
        const monthsData = this.getLastNMonthsData(6);

        AppState.charts.incomeExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthsData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: monthsData.income,
                        backgroundColor: '#10b981',
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6,
                        categoryPercentage: 0.7
                    },
                    {
                        label: 'Expense',
                        data: monthsData.expense,
                        backgroundColor: '#f43f5e',
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6,
                        categoryPercentage: 0.7
                    }
                ]
            },
            options: {
                ...this.getCommonThemeOptions()
            }
        });
    },

    // 2. Dashboard: Category Donut Chart
    renderCategoryDonutChart() {
        this.destroyChart('categoryDonut');
        const ctx = document.getElementById('chart-category-donut');
        if (!ctx) return;

        const { year, month } = DateService.getCurrentMonthYear();
        const currentMonthTxs = AppState.transactions.filter(t => 
            t.type === 'expense' && DateService.isSameMonth(t.date, year, month)
        );

        // Fallback to all expense transactions if current month is empty
        const txsToUse = currentMonthTxs.length > 0 ? currentMonthTxs : AppState.transactions.filter(t => t.type === 'expense');

        const catMap = {};
        txsToUse.forEach(t => {
            catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
        });

        const labels = Object.keys(catMap);
        const data = Object.values(catMap);
        const colors = labels.map(catName => {
            const found = AppState.categories.find(c => c.name === catName);
            return found ? found.color : '#64748b';
        });

        const dark = this.isDark();
        const textColor = dark ? '#94a3b8' : '#64748b';

        AppState.charts.categoryDonut = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['No Expense Recorded'],
                datasets: [{
                    data: data.length > 0 ? data : [1],
                    backgroundColor: colors.length > 0 ? colors : ['#334155'],
                    borderWidth: 2,
                    borderColor: dark ? '#0f172a' : '#ffffff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                            boxWidth: 8,
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: dark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: dark ? '#f8fafc' : '#0f172a',
                        bodyColor: dark ? '#cbd5e1' : '#334155',
                        borderColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function (context) {
                                if (data.length === 0) return ' No expense data';
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const val = context.parsed;
                                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                return ` ${context.label}: ${CurrencyService.format(val)} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // 3. Dashboard: Monthly Expense Trend
    renderMonthlyTrendChart() {
        this.destroyChart('monthlyTrend');
        const ctx = document.getElementById('chart-monthly-trend');
        if (!ctx) return;

        const monthsData = this.getLastNMonthsData(6);

        AppState.charts.monthlyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthsData.labels,
                datasets: [{
                    label: 'Total Expenses',
                    data: monthsData.expense,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#ffffff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...this.getCommonThemeOptions()
            }
        });
    },

    // 4. Analytics: Timeline Chart
    renderAnalyticsTimelineChart() {
        this.destroyChart('analyticsTimeline');
        const ctx = document.getElementById('chart-analytics-timeline');
        if (!ctx) return;

        const tf = AppState.analyticsTimeframe;
        let labels = [];
        let expenseData = [];
        let incomeData = [];

        if (tf === 'weekly') {
            const weeks = this.getLastNWeeksData(8);
            labels = weeks.labels;
            expenseData = weeks.expense;
            incomeData = weeks.income;
        } else if (tf === 'yearly') {
            const years = this.getYearlyData(4);
            labels = years.labels;
            expenseData = years.expense;
            incomeData = years.income;
        } else {
            const months = this.getLastNMonthsData(12);
            labels = months.labels;
            expenseData = months.expense;
            incomeData = months.income;
        }

        AppState.charts.analyticsTimeline = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: '#10b981',
                        borderRadius: 5,
                        barPercentage: 0.6
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        backgroundColor: '#f43f5e',
                        borderRadius: 5,
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                ...this.getCommonThemeOptions()
            }
        });
    },

    // 5. Analytics: Savings Trend Chart
    renderAnalyticsSavingsChart() {
        this.destroyChart('analyticsSavings');
        const ctx = document.getElementById('chart-analytics-savings');
        if (!ctx) return;

        const monthsData = this.getLastNMonthsData(8);
        const savingsData = monthsData.labels.map((_, i) => monthsData.income[i] - monthsData.expense[i]);

        AppState.charts.analyticsSavings = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthsData.labels,
                datasets: [{
                    label: 'Net Monthly Savings',
                    data: savingsData,
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#a855f7',
                    pointBorderColor: '#ffffff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...this.getCommonThemeOptions()
            }
        });
    },

    // 6. Analytics: Day of Week Heat
    renderAnalyticsDowChart() {
        this.destroyChart('analyticsDow');
        const ctx = document.getElementById('chart-analytics-dow');
        if (!ctx) return;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayTotals = [0, 0, 0, 0, 0, 0, 0];

        AppState.transactions.forEach(t => {
            if (t.type === 'expense' && t.date) {
                const [y, m, d] = t.date.split('-');
                const dayIdx = new Date(y, m - 1, d).getDay();
                dayTotals[dayIdx] += Number(t.amount);
            }
        });

        AppState.charts.analyticsDow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [{
                    label: 'Spending by Day',
                    data: dayTotals,
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                }]
            },
            options: {
                ...this.getCommonThemeOptions()
            }
        });
    },

    // 7. Analytics: Payment Method Distribution
    renderAnalyticsPaymentChart() {
        this.destroyChart('analyticsPayment');
        const ctx = document.getElementById('chart-analytics-payment');
        if (!ctx) return;

        const pMap = {};
        AppState.transactions.forEach(t => {
            if (t.type === 'expense') {
                const method = t.paymentMethod || 'Other';
                pMap[method] = (pMap[method] || 0) + Number(t.amount);
            }
        });

        const labels = Object.keys(pMap);
        const data = Object.values(pMap);
        const palette = ['#38bdf8', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#64748b'];

        const dark = this.isDark();
        const textColor = dark ? '#94a3b8' : '#64748b';

        AppState.charts.analyticsPayment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['None'],
                datasets: [{
                    data: data.length > 0 ? data : [1],
                    backgroundColor: palette.slice(0, Math.max(1, labels.length)),
                    borderWidth: 2,
                    borderColor: dark ? '#0f172a' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                            boxWidth: 8,
                            padding: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: dark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: dark ? '#f8fafc' : '#0f172a',
                        bodyColor: dark ? '#cbd5e1' : '#334155',
                        borderColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function (context) {
                                return ` ${context.label}: ${CurrencyService.format(context.parsed)}`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Helper: Build Last N Months aggregate buckets
    getLastNMonthsData(count = 6) {
        const labels = [];
        const income = [];
        const expense = [];
        const now = new Date();

        for (let i = count - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth();
            const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
            labels.push(monthLabel);

            let incSum = 0;
            let expSum = 0;

            AppState.transactions.forEach(t => {
                if (DateService.isSameMonth(t.date, y, m)) {
                    if (t.type === 'income') incSum += Number(t.amount);
                    if (t.type === 'expense') expSum += Number(t.amount);
                }
            });

            income.push(incSum);
            expense.push(expSum);
        }

        return { labels, income, expense };
    },

    // Helper: Build Last N Weeks aggregate buckets
    getLastNWeeksData(count = 8) {
        const labels = [];
        const income = [];
        const expense = [];
        const oneDay = 24 * 60 * 60 * 1000;
        const now = new Date();

        for (let i = count - 1; i >= 0; i--) {
            const end = new Date(now.getTime() - i * 7 * oneDay);
            const start = new Date(end.getTime() - 6 * oneDay);

            const startStr = start.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
            const endStr = end.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
            labels.push(`${startStr}-${endStr}`);

            let inc = 0;
            let exp = 0;

            AppState.transactions.forEach(t => {
                if (t.date) {
                    const [y, m, d] = t.date.split('-');
                    const txDate = new Date(y, m - 1, d);
                    if (txDate >= start && txDate <= end) {
                        if (t.type === 'income') inc += Number(t.amount);
                        if (t.type === 'expense') exp += Number(t.amount);
                    }
                }
            });

            income.push(inc);
            expense.push(exp);
        }

        return { labels, income, expense };
    },

    // Helper: Build Yearly buckets
    getYearlyData(count = 4) {
        const labels = [];
        const income = [];
        const expense = [];
        const currYear = new Date().getFullYear();

        for (let i = count - 1; i >= 0; i--) {
            const yr = currYear - i;
            labels.push(String(yr));

            let inc = 0;
            let exp = 0;

            AppState.transactions.forEach(t => {
                if (t.date && t.date.startsWith(String(yr))) {
                    if (t.type === 'income') inc += Number(t.amount);
                    if (t.type === 'expense') exp += Number(t.amount);
                }
            });

            income.push(inc);
            expense.push(exp);
        }

        return { labels, income, expense };
    },

    refreshAllCharts() {
        if (AppState.activeView === 'dashboard') {
            this.renderIncomeExpenseChart();
            this.renderCategoryDonutChart();
            this.renderMonthlyTrendChart();
        } else if (AppState.activeView === 'analytics') {
            this.renderAnalyticsTimelineChart();
            this.renderAnalyticsSavingsChart();
            this.renderAnalyticsDowChart();
            this.renderAnalyticsPaymentChart();
        }
    }
};

// ==========================================================================
// 8. TRANSACTION MANAGER & FILTERING ENGINE
// ==========================================================================

const TransactionManager = {
    getFilteredTransactions() {
        const f = AppState.filters;
        const now = new Date();

        return AppState.transactions.filter(t => {
            // 1. Search Query
            if (f.search) {
                const q = f.search.toLowerCase().trim();
                const matchDesc = t.description.toLowerCase().includes(q);
                const matchCat = t.category.toLowerCase().includes(q);
                const matchMethod = (t.paymentMethod || '').toLowerCase().includes(q);
                const matchNotes = (t.notes || '').toLowerCase().includes(q);
                const matchAmount = String(t.amount).includes(q);
                if (!matchDesc && !matchCat && !matchMethod && !matchNotes && !matchAmount) return false;
            }

            // 2. Type Filter
            if (f.type !== 'all' && t.type !== f.type) return false;

            // 3. Category Filter
            if (f.category !== 'all' && t.category !== f.category) return false;

            // 4. Payment Method Filter
            if (f.payment !== 'all' && t.paymentMethod !== f.payment) return false;

            // 5. Date Preset Filter
            if (t.date) {
                const [y, m, d] = t.date.split('-').map(Number);
                const txDate = new Date(y, m - 1, d);

                if (f.datePreset === 'today') {
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    if (t.date !== todayStr) return false;
                } else if (f.datePreset === 'this-week') {
                    const diffDays = Math.floor((now - txDate) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0 || diffDays > 7) return false;
                } else if (f.datePreset === 'this-month') {
                    if (txDate.getFullYear() !== now.getFullYear() || txDate.getMonth() !== now.getMonth()) return false;
                } else if (f.datePreset === 'last-month') {
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    if (txDate.getFullYear() !== lastMonth.getFullYear() || txDate.getMonth() !== lastMonth.getMonth()) return false;
                } else if (f.datePreset === 'this-year') {
                    if (txDate.getFullYear() !== now.getFullYear()) return false;
                } else if (f.datePreset === 'custom') {
                    if (f.startDate && t.date < f.startDate) return false;
                    if (f.endDate && t.date > f.endDate) return false;
                }
            }

            return true;
        }).sort((a, b) => {
            // Sort
            if (f.sortBy === 'date-asc') return a.date.localeCompare(b.date);
            if (f.sortBy === 'amount-desc') return b.amount - a.amount;
            if (f.sortBy === 'amount-asc') return a.amount - b.amount;
            // Default date-desc
            return b.date.localeCompare(a.date);
        });
    },

    add(txData) {
        const newTx = {
            id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            type: txData.type || 'expense',
            amount: parseFloat(txData.amount),
            description: txData.description.trim(),
            category: txData.category,
            paymentMethod: txData.paymentMethod || 'Other',
            date: txData.date,
            notes: (txData.notes || '').trim(),
            createdAt: new Date().toISOString()
        };

        AppState.transactions.unshift(newTx);
        StorageService.saveTransactions();
        ToastService.show('Transaction added successfully', 'success');
        AppUI.refreshAll();
    },

    update(id, txData) {
        const idx = AppState.transactions.findIndex(t => t.id === id);
        if (idx === -1) return false;

        AppState.transactions[idx] = {
            ...AppState.transactions[idx],
            type: txData.type,
            amount: parseFloat(txData.amount),
            description: txData.description.trim(),
            category: txData.category,
            paymentMethod: txData.paymentMethod || 'Other',
            date: txData.date,
            notes: (txData.notes || '').trim()
        };

        StorageService.saveTransactions();
        ToastService.show('Transaction updated successfully', 'success');
        AppUI.refreshAll();
        return true;
    },

    delete(id) {
        const idx = AppState.transactions.findIndex(t => t.id === id);
        if (idx === -1) return;

        AppState.transactions.splice(idx, 1);
        StorageService.saveTransactions();
        ToastService.show('Transaction deleted', 'info');
        AppUI.refreshAll();
    }
};

// ==========================================================================
// 9. BUDGET ENGINE & OVERRUN DETECTION
// ==========================================================================

const BudgetService = {
    calculateStatus() {
        const { year, month } = DateService.getCurrentMonthYear();
        const monthlyExpenses = AppState.transactions.filter(t => 
            t.type === 'expense' && DateService.isSameMonth(t.date, year, month)
        );

        const totalSpent = monthlyExpenses.reduce((acc, t) => acc + Number(t.amount), 0);
        const overallLimit = AppState.budgets.monthlyOverall || 0;
        const overallRemaining = overallLimit - totalSpent;
        const overallPct = overallLimit > 0 ? Math.round((totalSpent / overallLimit) * 100) : 0;

        // Category-wise calculations
        const catSpent = {};
        monthlyExpenses.forEach(t => {
            catSpent[t.category] = (catSpent[t.category] || 0) + Number(t.amount);
        });

        const categoryStatuses = [];
        const warnings = [];
        const exceeded = [];

        // Scan all expense categories
        AppState.categories.filter(c => c.type === 'expense').forEach(cat => {
            const spent = catSpent[cat.name] || 0;
            const limit = (AppState.budgets.categories && AppState.budgets.categories[cat.name]) || 0;
            const remaining = limit - spent;
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

            let status = 'normal';
            if (limit > 0) {
                if (pct >= 100) {
                    status = 'danger';
                    exceeded.push({ name: cat.name, spent, limit, pct });
                } else if (pct >= 80) {
                    status = 'warning';
                    warnings.push({ name: cat.name, spent, limit, pct });
                } else if (pct >= 70) {
                    status = 'caution';
                }
            }

            categoryStatuses.push({
                category: cat,
                spent,
                limit,
                remaining,
                pct,
                status
            });
        });

        // Check overall limit warnings
        if (overallLimit > 0) {
            if (overallPct >= 100) {
                exceeded.unshift({ name: 'Overall Monthly Budget', spent: totalSpent, limit: overallLimit, pct: overallPct });
            } else if (overallPct >= 80) {
                warnings.unshift({ name: 'Overall Monthly Budget', spent: totalSpent, limit: overallLimit, pct: overallPct });
            }
        }

        return {
            totalSpent,
            overallLimit,
            overallRemaining,
            overallPct,
            categoryStatuses,
            warnings,
            exceeded
        };
    }
};

// ==========================================================================
// 10. EXPORT & REPORTING SERVICES
// ==========================================================================

const ExportService = {
    exportToCSV() {
        const filtered = TransactionManager.getFilteredTransactions();
        if (filtered.length === 0) {
            ToastService.show('No transactions to export', 'warning');
            return;
        }

        const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Category', 'Payment Method', 'Description', 'Notes'];
        const cur = AppState.settings.currency || 'USD';

        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

        const rows = filtered.map(t => [
            escapeCSV(t.id),
            escapeCSV(t.date),
            escapeCSV(t.type),
            escapeCSV(t.amount.toFixed(2)),
            escapeCSV(cur),
            escapeCSV(t.category),
            escapeCSV(t.paymentMethod),
            escapeCSV(t.description),
            escapeCSV(t.notes || '')
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-expense-report-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        ToastService.show('CSV export generated successfully', 'success');
    },

    exportJSONBackup() {
        const backupData = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            settings: AppState.settings,
            budgets: AppState.budgets,
            categories: AppState.categories,
            transactions: AppState.transactions
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-expense-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        ToastService.show('JSON backup exported', 'success');
    },

    importJSONBackup(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.transactions || !Array.isArray(data.transactions)) {
                    throw new Error('Invalid backup structure');
                }

                AppState.transactions = data.transactions;
                if (data.categories) AppState.categories = data.categories;
                if (data.budgets) AppState.budgets = data.budgets;
                if (data.settings) AppState.settings = { ...AppState.settings, ...data.settings };

                StorageService.saveTransactions();
                StorageService.saveCategories();
                StorageService.saveBudgets();
                StorageService.saveSettings();

                ToastService.show('Backup restored successfully!', 'success');
                AppUI.refreshAll();
            } catch (err) {
                console.error(err);
                ToastService.show('Failed to import backup: invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    },

    generateMonthlyStatement(yearMonthStr) {
        let year, month;
        if (yearMonthStr) {
            const parts = yearMonthStr.split('-');
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
        } else {
            const cur = DateService.getCurrentMonthYear();
            year = cur.year;
            month = cur.month;
        }

        const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const monthlyTxs = AppState.transactions.filter(t => DateService.isSameMonth(t.date, year, month));

        let totalIncome = 0;
        let totalExpense = 0;
        const categoryMap = {};

        monthlyTxs.forEach(t => {
            if (t.type === 'income') totalIncome += Number(t.amount);
            if (t.type === 'expense') {
                totalExpense += Number(t.amount);
                categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
            }
        });

        const netSavings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

        let categoryRowsHtml = '';
        Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).forEach(([cat, amt]) => {
            const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
            categoryRowsHtml += `
                <tr>
                    <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color);">${cat}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); text-align: right; font-weight: 700;">${CurrencyService.format(amt)}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); text-align: right; color: var(--text-muted);">${pct}%</td>
                </tr>
            `;
        });

        let txRowsHtml = '';
        monthlyTxs.slice(0, 30).forEach(t => {
            const isInc = t.type === 'income';
            txRowsHtml += `
                <tr>
                    <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); font-size: 0.8rem; color: var(--text-muted);">${DateService.format(t.date)}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); font-weight: 600;">${t.description}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">${t.category}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); text-align: right; font-weight: 700; color: ${isInc ? 'var(--success)' : 'var(--danger)'};">
                        ${isInc ? '+' : '-'}${CurrencyService.format(t.amount)}
                    </td>
                </tr>
            `;
        });

        return `
            <div class="report-header-section">
                <div>
                    <div class="report-brand-name">SmartExpense Pro</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">Executive Financial Statement</div>
                </div>
                <div style="text-align: right;">
                    <div class="report-period-tag">${monthName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Generated: ${new Date().toLocaleDateString()}</div>
                </div>
            </div>

            <div class="report-summary-boxes">
                <div class="report-box">
                    <div class="report-box-label">Total Inflow</div>
                    <div class="report-box-val text-success">${CurrencyService.format(totalIncome)}</div>
                </div>
                <div class="report-box">
                    <div class="report-box-label">Total Outflow</div>
                    <div class="report-box-val text-danger">${CurrencyService.format(totalExpense)}</div>
                </div>
                <div class="report-box">
                    <div class="report-box-label">Net Monthly Savings</div>
                    <div class="report-box-val ${netSavings >= 0 ? 'text-primary' : 'text-danger'}">
                        ${CurrencyService.format(netSavings)} (${savingsRate}%)
                    </div>
                </div>
            </div>

            <h4 style="margin: 1.5rem 0 0.75rem; font-size: 1rem; font-weight: 700;">Expense Category Allocations</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem;">
                <thead>
                    <tr style="background: var(--bg-pill); text-align: left; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">
                        <th style="padding: 8px 12px;">Category</th>
                        <th style="padding: 8px 12px; text-align: right;">Amount Spent</th>
                        <th style="padding: 8px 12px; text-align: right;">Share</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryRowsHtml || '<tr><td colspan="3" style="padding: 12px; text-align: center; color: var(--text-muted);">No expenses recorded for this period.</td></tr>'}
                </tbody>
            </table>

            <h4 style="margin: 1.5rem 0 0.75rem; font-size: 1rem; font-weight: 700;">Itemized Transactions Ledger</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                <thead>
                    <tr style="background: var(--bg-pill); text-align: left; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">
                        <th style="padding: 8px 12px;">Date</th>
                        <th style="padding: 8px 12px;">Description</th>
                        <th style="padding: 8px 12px;">Category</th>
                        <th style="padding: 8px 12px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${txRowsHtml || '<tr><td colspan="4" style="padding: 12px; text-align: center; color: var(--text-muted);">No transactions recorded for this period.</td></tr>'}
                </tbody>
            </table>
        `;
    }
};

// ==========================================================================
// 11. UI RENDERER & VIEW CONTROLLER
// ==========================================================================

const AppUI = {
    init() {
        this.bindNavigation();
        this.bindTheme();
        this.bindModals();
        this.bindForms();
        this.bindFilters();
        this.bindSettings();
        this.bindGlobalShortcuts();

        // Update default date inputs to today
        const todayStr = new Date().toISOString().slice(0, 10);
        const txDateInput = document.getElementById('tx-date');
        if (txDateInput) txDateInput.value = todayStr;

        const reportMonthInput = document.getElementById('report-month-select');
        if (reportMonthInput) reportMonthInput.value = todayStr.slice(0, 7);

        // Apply saved theme & currency
        this.applyTheme(AppState.settings.theme);
        const curSelect = document.getElementById('currency-select');
        if (curSelect) curSelect.value = AppState.settings.currency;

        this.renderCategoryOptionsInForm();
        this.renderCategoryFilters();
        this.refreshAll();
    },

    refreshAll() {
        this.updateDashboardStats();
        this.renderRecentTransactions();
        this.renderTransactionsTable();
        this.renderBudgetsView();
        this.renderAnalyticsView();
        this.renderCategoriesView();
        this.updateBudgetAlertBanners();
        ChartService.refreshAllCharts();
    },

    // --- Dashboard View Updates ---
    updateDashboardStats() {
        let totalIncome = 0;
        let totalExpense = 0;

        AppState.transactions.forEach(t => {
            if (t.type === 'income') totalIncome += Number(t.amount);
            if (t.type === 'expense') totalExpense += Number(t.amount);
        });

        const totalBalance = totalIncome - totalExpense;

        // Current Month Specific
        const { year, month } = DateService.getCurrentMonthYear();
        let curMonthIncome = 0;
        let curMonthExpense = 0;

        AppState.transactions.forEach(t => {
            if (DateService.isSameMonth(t.date, year, month)) {
                if (t.type === 'income') curMonthIncome += Number(t.amount);
                if (t.type === 'expense') curMonthExpense += Number(t.amount);
            }
        });

        const monthlySavings = curMonthIncome - curMonthExpense;
        const savingsRate = curMonthIncome > 0 ? Math.round((monthlySavings / curMonthIncome) * 100) : 0;

        // DOM elements
        const elBalance = document.getElementById('dash-total-balance');
        const elIncome = document.getElementById('dash-total-income');
        const elExpense = document.getElementById('dash-total-expense');
        const elSavings = document.getElementById('dash-monthly-savings');
        const elSavingsRate = document.getElementById('dash-savings-rate');
        const elTxCount = document.getElementById('dash-tx-total-label');
        const elNavCount = document.getElementById('nav-tx-count');

        if (elBalance) elBalance.textContent = CurrencyService.format(totalBalance);
        if (elIncome) elIncome.textContent = CurrencyService.format(totalIncome);
        if (elExpense) elExpense.textContent = CurrencyService.format(totalExpense);
        if (elSavings) {
            elSavings.textContent = CurrencyService.format(monthlySavings);
            elSavings.className = `stat-amount ${monthlySavings >= 0 ? 'text-primary' : 'text-danger'}`;
        }
        if (elSavingsRate) {
            elSavingsRate.textContent = `${savingsRate}% rate`;
        }
        if (elTxCount) elTxCount.textContent = `${AppState.transactions.length} records logged`;
        if (elNavCount) elNavCount.textContent = AppState.transactions.length;

        // Balance ratio pill
        const elBalanceRatio = document.getElementById('dash-balance-ratio');
        if (elBalanceRatio) {
            if (totalIncome > 0) {
                const ratio = Math.round((totalBalance / totalIncome) * 100);
                elBalanceRatio.textContent = `${ratio}% retained`;
            } else {
                elBalanceRatio.textContent = 'Net Savings';
            }
        }
    },

    renderRecentTransactions() {
        const container = document.getElementById('dashboard-recent-tx');
        if (!container) return;

        const recent = [...AppState.transactions]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = `
                <div style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
                    No transactions yet. Click "+ Add Transaction" or "Demo Data" to get started!
                </div>
            `;
            return;
        }

        container.innerHTML = recent.map(t => {
            const isInc = t.type === 'income';
            const cat = AppState.categories.find(c => c.name === t.category) || { color: '#64748b' };
            return `
                <div class="recent-tx-item">
                    <div class="recent-tx-left">
                        <div class="recent-tx-icon" style="background: ${cat.color}22; color: ${cat.color}; border: 1px solid ${cat.color}44;">
                            ${isInc ? '↑' : '↓'}
                        </div>
                        <div class="recent-tx-details">
                            <div class="recent-tx-desc">${t.description}</div>
                            <div class="recent-tx-sub">
                                <span>${DateService.format(t.date)}</span>
                                <span>•</span>
                                <span>${t.category}</span>
                            </div>
                        </div>
                    </div>
                    <div class="recent-tx-right">
                        <div class="recent-tx-amount ${isInc ? 'text-success' : 'text-danger'}">
                            ${isInc ? '+' : '-'}${CurrencyService.format(t.amount)}
                        </div>
                        <div class="recent-tx-payment">${t.paymentMethod || 'Other'}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // --- Transactions View Table & Pagination ---
    renderTransactionsTable() {
        const tbody = document.getElementById('tx-table-body');
        const emptyState = document.getElementById('tx-empty-state');
        const countLabel = document.getElementById('tx-results-count');
        const sumIncome = document.getElementById('filter-sum-income');
        const sumExpense = document.getElementById('filter-sum-expense');
        const sumNet = document.getElementById('filter-sum-net');
        const paginationInfo = document.getElementById('pagination-info');
        const prevBtn = document.getElementById('page-prev-btn');
        const nextBtn = document.getElementById('page-next-btn');

        if (!tbody) return;

        const filtered = TransactionManager.getFilteredTransactions();

        // Calculate filtered sums
        let filteredInc = 0;
        let filteredExp = 0;
        filtered.forEach(t => {
            if (t.type === 'income') filteredInc += Number(t.amount);
            if (t.type === 'expense') filteredExp += Number(t.amount);
        });

        if (sumIncome) sumIncome.textContent = `+${CurrencyService.format(filteredInc)}`;
        if (sumExpense) sumExpense.textContent = `-${CurrencyService.format(filteredExp)}`;
        if (sumNet) sumNet.textContent = `Net: ${CurrencyService.format(filteredInc - filteredExp)}`;
        if (countLabel) countLabel.textContent = `Showing ${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`;

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            if (paginationInfo) paginationInfo.textContent = 'Page 0 of 0';
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Pagination math
        const pageSize = AppState.filters.pageSize || 25;
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        if (AppState.filters.page > totalPages) AppState.filters.page = totalPages;
        if (AppState.filters.page < 1) AppState.filters.page = 1;

        const startIndex = (AppState.filters.page - 1) * pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + pageSize);

        if (paginationInfo) paginationInfo.textContent = `Page ${AppState.filters.page} of ${totalPages}`;
        if (prevBtn) prevBtn.disabled = AppState.filters.page <= 1;
        if (nextBtn) nextBtn.disabled = AppState.filters.page >= totalPages;

        tbody.innerHTML = pageItems.map(t => {
            const isInc = t.type === 'income';
            const cat = AppState.categories.find(c => c.name === t.category) || { color: '#64748b' };

            return `
                <tr data-id="${t.id}">
                    <td class="col-date">${DateService.format(t.date)}</td>
                    <td class="col-desc">
                        <div>${t.description}</div>
                        ${t.notes ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">${t.notes}</div>` : ''}
                    </td>
                    <td class="col-category">
                        <span class="category-tag">
                            <span class="category-dot" style="background-color: ${cat.color};"></span>
                            <span>${t.category}</span>
                        </span>
                    </td>
                    <td class="col-payment">
                        <span class="payment-tag">${t.paymentMethod || 'Other'}</span>
                    </td>
                    <td class="col-amount text-right ${isInc ? 'text-success' : 'text-danger'}">
                        ${isInc ? '+' : '-'}${CurrencyService.format(t.amount)}
                    </td>
                    <td class="col-actions text-center">
                        <div class="table-actions">
                            <button class="action-btn edit" data-action="edit" data-id="${t.id}" title="Edit transaction">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="action-btn delete" data-action="delete" data-id="${t.id}" title="Delete transaction">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // --- Budgets View ---
    renderBudgetsView() {
        const status = BudgetService.calculateStatus();

        // Overall Card
        const spentEl = document.getElementById('overall-spent-val');
        const budgetEl = document.getElementById('overall-budget-val');
        const remainingEl = document.getElementById('overall-remaining-val');
        const progressBar = document.getElementById('overall-progress-bar');
        const statusText = document.getElementById('overall-status-text');
        const statusPct = document.getElementById('overall-status-pct');

        if (spentEl) spentEl.textContent = CurrencyService.format(status.totalSpent);
        if (budgetEl) budgetEl.textContent = CurrencyService.format(status.overallLimit);
        if (remainingEl) {
            remainingEl.textContent = CurrencyService.format(status.overallRemaining);
            remainingEl.className = `val remaining ${status.overallRemaining < 0 ? 'negative' : ''}`;
        }

        if (progressBar) {
            const width = Math.min(100, status.overallPct);
            progressBar.style.width = `${width}%`;
            progressBar.className = `budget-progress-bar status-${status.overallPct >= 100 ? 'danger' : status.overallPct >= 80 ? 'warning' : status.overallPct >= 70 ? 'caution' : 'normal'}`;
        }

        if (statusPct) statusPct.textContent = `${status.overallPct}% used`;
        if (statusText) {
            if (status.overallLimit === 0) statusText.textContent = 'No overall limit set';
            else if (status.overallPct >= 100) statusText.textContent = '🚨 OVER BUDGET EXCEEDED!';
            else if (status.overallPct >= 80) statusText.textContent = '⚠️ Critical warning: 80% limit reached!';
            else statusText.textContent = 'Budget health on track';
        }

        // Sidebar quick stat widget
        const sidebarBar = document.getElementById('sidebar-budget-bar');
        const sidebarPct = document.getElementById('sidebar-budget-pct');
        if (sidebarBar) {
            sidebarBar.style.width = `${Math.min(100, status.overallPct)}%`;
            sidebarBar.style.background = status.overallPct >= 100 ? 'var(--danger)' : status.overallPct >= 80 ? 'var(--warning)' : 'linear-gradient(90deg, var(--electric-blue), var(--primary))';
        }
        if (sidebarPct) sidebarPct.textContent = `${status.overallPct}% used`;

        // Category Budgets Grid
        const grid = document.getElementById('category-budgets-grid');
        if (!grid) return;

        grid.innerHTML = status.categoryStatuses.map(item => {
            const hasLimit = item.limit > 0;
            const progressWidth = hasLimit ? Math.min(100, item.pct) : 0;

            return `
                <div class="category-budget-card glass-card">
                    <div class="cat-budget-header">
                        <div class="cat-budget-title-wrap">
                            <div class="cat-budget-icon" style="background-color: ${item.category.color};">
                                •
                            </div>
                            <span class="cat-budget-name">${item.category.name}</span>
                        </div>
                        <span class="cat-budget-badge ${item.status}">
                            ${!hasLimit ? 'No limit' : item.pct >= 100 ? 'Exceeded' : item.pct >= 80 ? 'Warning' : 'Normal'}
                        </span>
                    </div>

                    <div class="cat-budget-figures">
                        <div class="cat-spent-figure">${CurrencyService.format(item.spent)}</div>
                        <div class="cat-limit-figure">${hasLimit ? 'of ' + CurrencyService.format(item.limit) : 'Spent'}</div>
                    </div>

                    <div class="cat-budget-progress">
                        <div class="budget-progress-bar status-${item.status}" style="width: ${progressWidth}%;"></div>
                    </div>

                    <div class="cat-budget-footer">
                        <span>${hasLimit ? CurrencyService.format(item.remaining) + ' remaining' : 'No ceiling set'}</span>
                        <span>${hasLimit ? item.pct + '% used' : ''}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // --- Budget Warning Banners & Nav Dots ---
    updateBudgetAlertBanners() {
        const container = document.getElementById('global-alert-container');
        const navDot = document.getElementById('nav-budget-alert-dot');
        const status = BudgetService.calculateStatus();

        const hasOverruns = status.exceeded.length > 0 || status.warnings.length > 0;
        if (navDot) navDot.style.display = hasOverruns ? 'inline-block' : 'none';

        if (!container) return;

        if (!hasOverruns) {
            container.innerHTML = '';
            return;
        }

        let alertHtml = '';
        status.exceeded.forEach(item => {
            alertHtml += `
                <div class="budget-alert-banner danger">
                    <div class="alert-message-content">
                        <span>🚨 <strong>Budget Alert:</strong> ${item.name} has exceeded its monthly limit (${CurrencyService.format(item.spent)} spent / ${CurrencyService.format(item.limit)} budget).</span>
                    </div>
                    <button class="alert-dismiss-btn" onclick="this.parentElement.remove()">×</button>
                </div>
            `;
        });

        status.warnings.forEach(item => {
            alertHtml += `
                <div class="budget-alert-banner warning">
                    <div class="alert-message-content">
                        <span>⚠️ <strong>Budget Caution:</strong> ${item.name} has reached ${item.pct}% of its monthly allocation.</span>
                    </div>
                    <button class="alert-dismiss-btn" onclick="this.parentElement.remove()">×</button>
                </div>
            `;
        });

        container.innerHTML = alertHtml;
    },

    // --- Analytics View Updates ---
    renderAnalyticsView() {
        const avgDailyEl = document.getElementById('analytics-avg-daily');
        const avgDailySub = document.getElementById('analytics-avg-daily-sub');
        const topCatEl = document.getElementById('analytics-top-category');
        const topCatSub = document.getElementById('analytics-top-category-amount');
        const savingsRateEl = document.getElementById('analytics-savings-rate');
        const savingsAmountEl = document.getElementById('analytics-savings-amount');
        const largestExpEl = document.getElementById('analytics-largest-expense');
        const largestExpSub = document.getElementById('analytics-largest-expense-desc');

        const { year, month } = DateService.getCurrentMonthYear();
        const currentMonthTxs = AppState.transactions.filter(t => DateService.isSameMonth(t.date, year, month));

        let curIncome = 0;
        let curExpense = 0;
        let largest = { amount: 0, description: 'None' };
        const catMap = {};
        const activeDays = new Set();

        currentMonthTxs.forEach(t => {
            if (t.type === 'income') curIncome += Number(t.amount);
            if (t.type === 'expense') {
                curExpense += Number(t.amount);
                catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
                if (t.amount > largest.amount) largest = t;
                if (t.date) activeDays.add(t.date);
            }
        });

        // Top Category
        let topCat = 'None';
        let topCatAmt = 0;
        Object.entries(catMap).forEach(([cat, amt]) => {
            if (amt > topCatAmt) {
                topCat = cat;
                topCatAmt = amt;
            }
        });

        const dayCount = Math.max(1, activeDays.size);
        const avgDaily = curExpense / dayCount;
        const netSavings = curIncome - curExpense;
        const rate = curIncome > 0 ? Math.round((netSavings / curIncome) * 100) : 0;

        if (avgDailyEl) avgDailyEl.textContent = CurrencyService.format(avgDaily);
        if (avgDailySub) avgDailySub.textContent = `Across ${dayCount} active spending days`;
        if (topCatEl) topCatEl.textContent = topCat;
        if (topCatSub) topCatSub.textContent = `${CurrencyService.format(topCatAmt)} spent this month`;
        if (savingsRateEl) savingsRateEl.textContent = `${rate}%`;
        if (savingsAmountEl) savingsAmountEl.textContent = `${CurrencyService.format(netSavings)} saved this month`;
        if (largestExpEl) largestExpEl.textContent = CurrencyService.format(largest.amount);
        if (largestExpSub) largestExpSub.textContent = largest.description || 'None recorded';
    },

    // --- Categories View Updates ---
    renderCategoriesView() {
        const expGrid = document.getElementById('expense-categories-grid');
        const incGrid = document.getElementById('income-categories-grid');
        const expCount = document.getElementById('expense-cat-count');
        const incCount = document.getElementById('income-cat-count');

        // Calculate totals per category
        const catTotals = {};
        const catCounts = {};

        AppState.transactions.forEach(t => {
            catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
            catCounts[t.category] = (catCounts[t.category] || 0) + 1;
        });

        const expCats = AppState.categories.filter(c => c.type === 'expense');
        const incCats = AppState.categories.filter(c => c.type === 'income');

        if (expCount) expCount.textContent = `${expCats.length} Categories`;
        if (incCount) incCount.textContent = `${incCats.length} Categories`;

        const renderGrid = (list) => {
            return list.map(c => {
                const total = catTotals[c.name] || 0;
                const count = catCounts[c.name] || 0;

                return `
                    <div class="category-card glass-card">
                        <div class="category-card-left">
                            <div class="cat-color-badge" style="background-color: ${c.color};">
                                ${c.name.charAt(0)}
                            </div>
                            <div class="cat-info-col">
                                <div class="cat-title-text">${c.name}</div>
                                <div class="cat-spend-text">${CurrencyService.format(total)} (${count} logs)</div>
                            </div>
                        </div>
                        ${c.isCustom ? `
                            <button class="action-btn delete" data-delete-cat="${c.id}" title="Delete category">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('');
        };

        if (expGrid) expGrid.innerHTML = renderGrid(expCats);
        if (incGrid) incGrid.innerHTML = renderGrid(incCats);
    },

    // --- Dynamic Form Dropdowns ---
    renderCategoryOptionsInForm(selectedType = 'expense', selectedCat = '') {
        const select = document.getElementById('tx-category');
        if (!select) return;

        const filtered = AppState.categories.filter(c => c.type === selectedType);
        select.innerHTML = filtered.map(c => `
            <option value="${c.name}" ${c.name === selectedCat ? 'selected' : ''}>${c.name}</option>
        `).join('');
    },

    renderCategoryFilters() {
        const select = document.getElementById('filter-category');
        if (!select) return;

        const currentVal = AppState.filters.category;
        select.innerHTML = '<option value="all">All Categories</option>' + 
            AppState.categories.map(c => `
                <option value="${c.name}" ${c.name === currentVal ? 'selected' : ''}>${c.name}</option>
            `).join('');
    },

    // --- Navigation & Router ---
    bindNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const viewSections = document.querySelectorAll('.view-section');
        const viewTitle = document.getElementById('current-view-title');
        const dateDisplay = document.getElementById('current-date-display');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const menuBtn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('sidebar-close-btn');

        const titleMap = {
            dashboard: { title: 'Dashboard', sub: 'Real-time Financial Overview' },
            transactions: { title: 'Transactions', sub: 'Manage Income & Outflow Records' },
            budgets: { title: 'Budget Management', sub: 'Monthly Caps & Overrun Protection' },
            analytics: { title: 'Deep Analytics', sub: 'Trends, Trajectories & Day Heat' },
            categories: { title: 'Categories', sub: 'Classifications & Custom Tags' },
            settings: { title: 'Reports & Data', sub: 'Export, Backup & Purge Tools' }
        };

        const switchView = (targetView) => {
            if (!titleMap[targetView]) targetView = 'dashboard';
            AppState.activeView = targetView;

            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.view === targetView);
            });

            viewSections.forEach(section => {
                section.classList.toggle('active', section.id === `view-${targetView}`);
            });

            if (viewTitle) viewTitle.textContent = titleMap[targetView].title;
            if (dateDisplay) dateDisplay.textContent = titleMap[targetView].sub;

            // Close mobile sidebar if open
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');

            // Trigger charts rendering for active view
            ChartService.refreshAllCharts();
        };

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                window.location.hash = view;
                switchView(view);
            });
        });

        // Delegate view switches for in-page link buttons (e.g. View All Transactions)
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-view]');
            if (btn && !btn.classList.contains('nav-link')) {
                e.preventDefault();
                const view = btn.dataset.view;
                window.location.hash = view;
                switchView(view);
            }
        });

        // Hash change routing
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && titleMap[hash]) switchView(hash);
        });

        // Initial hash check
        if (window.location.hash) {
            const hash = window.location.hash.replace('#', '');
            if (titleMap[hash]) switchView(hash);
        }

        // Mobile Sidebar Toggles
        if (menuBtn && sidebar && overlay) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.add('open');
                overlay.classList.add('active');
            });
        }

        if (closeBtn && sidebar && overlay) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }

        if (overlay && sidebar) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }
    },

    // --- Theme Switcher ---
    bindTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const nextTheme = AppState.settings.theme === 'dark' ? 'light' : 'dark';
                this.applyTheme(nextTheme);
            });
        }
    },

    applyTheme(theme) {
        AppState.settings.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        StorageService.saveSettings();
        ChartService.refreshAllCharts();
    },

    // --- Modals System ---
    bindModals() {
        const setupModal = (modalId, openBtnIds, closeBtnIds) => {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            openBtnIds.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.addEventListener('click', () => {
                        modal.classList.add('active');
                        modal.setAttribute('aria-hidden', 'false');
                    });
                }
            });

            closeBtnIds.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.addEventListener('click', () => {
                        modal.classList.remove('active');
                        modal.setAttribute('aria-hidden', 'true');
                    });
                }
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                }
            });
        };

        setupModal('transaction-modal', ['btn-quick-add', 'btn-add-tx-view', 'btn-empty-add-tx'], ['modal-tx-close', 'btn-cancel-tx']);
        setupModal('budget-modal', ['btn-set-budget-modal'], ['modal-budget-close', 'btn-cancel-budget']);
        setupModal('category-modal', ['btn-add-category-modal'], ['modal-cat-close', 'btn-cancel-cat']);
        setupModal('report-modal', ['btn-generate-report'], ['modal-report-close']);
        setupModal('confirm-modal', [], ['confirm-modal-close', 'btn-confirm-cancel']);

        // Type toggle in Transaction Modal
        const pillExpense = document.getElementById('pill-expense');
        const pillIncome = document.getElementById('pill-income');
        const hiddenType = document.getElementById('tx-type');

        const setTxModalType = (type) => {
            hiddenType.value = type;
            if (pillExpense) pillExpense.classList.toggle('active', type === 'expense');
            if (pillIncome) pillIncome.classList.toggle('active', type === 'income');
            this.renderCategoryOptionsInForm(type);
        };

        if (pillExpense) pillExpense.addEventListener('click', () => setTxModalType('expense'));
        if (pillIncome) pillIncome.addEventListener('click', () => setTxModalType('income'));

        // Reset Transaction Modal when opening for "Add"
        ['btn-quick-add', 'btn-add-tx-view', 'btn-empty-add-tx'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    const form = document.getElementById('transaction-form');
                    if (form) form.reset();
                    document.getElementById('tx-id').value = '';
                    document.getElementById('modal-tx-title').textContent = 'Add Transaction';
                    document.getElementById('tx-date').value = new Date().toISOString().slice(0, 10);
                    setTxModalType('expense');
                });
            }
        });

        // Prepopulate Budget Modal
        const btnBudgetModal = document.getElementById('btn-set-budget-modal');
        if (btnBudgetModal) {
            btnBudgetModal.addEventListener('click', () => {
                const totalInput = document.getElementById('monthly-total-budget');
                if (totalInput) totalInput.value = AppState.budgets.monthlyOverall || '';

                const container = document.getElementById('category-budget-inputs-container');
                if (container) {
                    const expCats = AppState.categories.filter(c => c.type === 'expense');
                    container.innerHTML = expCats.map(c => {
                        const currentLimit = (AppState.budgets.categories && AppState.budgets.categories[c.name]) || '';
                        return `
                            <div class="cat-budget-input-row">
                                <div class="cat-budget-row-label">
                                    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${c.color};"></span>
                                    <span>${c.name}</span>
                                </div>
                                <input type="number" class="form-input cat-budget-row-input" data-cat-name="${c.name}" placeholder="0" min="0" value="${currentLimit}">
                            </div>
                        `;
                    }).join('');
                }
            });
        }

        // Color Picker Palette inside Category Modal
        const colorPaletteContainer = document.getElementById('color-picker-palette');
        const colorInput = document.getElementById('new-cat-color');
        if (colorPaletteContainer && colorInput) {
            colorPaletteContainer.innerHTML = COLOR_PALETTE.map((color, idx) => `
                <div class="color-option ${idx === 0 ? 'selected' : ''}" style="background-color: ${color};" data-color="${color}"></div>
            `).join('');

            colorPaletteContainer.addEventListener('click', (e) => {
                const opt = e.target.closest('.color-option');
                if (!opt) return;
                colorPaletteContainer.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
                opt.classList.add('selected');
                colorInput.value = opt.dataset.color;
            });
        }
    },

    // --- Forms Submission Handlers ---
    bindForms() {
        // 1. Transaction Form
        const txForm = document.getElementById('transaction-form');
        if (txForm) {
            txForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const id = document.getElementById('tx-id').value;
                const type = document.getElementById('tx-type').value;
                const amount = parseFloat(document.getElementById('tx-amount').value);
                const date = document.getElementById('tx-date').value;
                const description = document.getElementById('tx-description').value.trim();
                const category = document.getElementById('tx-category').value;
                const paymentMethod = document.getElementById('tx-payment-method').value;
                const notes = document.getElementById('tx-notes').value.trim();

                // Validation
                let isValid = true;
                const errAmount = document.getElementById('error-tx-amount');
                const errDate = document.getElementById('error-tx-date');
                const errDesc = document.getElementById('error-tx-desc');

                if (errAmount) errAmount.textContent = '';
                if (errDate) errDate.textContent = '';
                if (errDesc) errDesc.textContent = '';

                if (isNaN(amount) || amount <= 0) {
                    if (errAmount) errAmount.textContent = 'Please enter a valid amount greater than 0';
                    isValid = false;
                }
                if (!date) {
                    if (errDate) errDate.textContent = 'Date is required';
                    isValid = false;
                }
                if (!description) {
                    if (errDesc) errDesc.textContent = 'Description is required';
                    isValid = false;
                }
                if (!category) {
                    ToastService.show('Please select a category', 'error');
                    isValid = false;
                }

                if (!isValid) return;

                const txData = { type, amount, date, description, category, paymentMethod, notes };

                if (id) {
                    TransactionManager.update(id, txData);
                } else {
                    TransactionManager.add(txData);
                }

                document.getElementById('transaction-modal').classList.remove('active');
            });
        }

        // 2. Budget Form
        const budgetForm = document.getElementById('budget-form');
        if (budgetForm) {
            budgetForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const totalVal = parseFloat(document.getElementById('monthly-total-budget').value) || 0;
                AppState.budgets.monthlyOverall = totalVal;

                const inputs = document.querySelectorAll('.cat-budget-row-input');
                const catBudgets = {};
                inputs.forEach(input => {
                    const catName = input.dataset.catName;
                    const val = parseFloat(input.value) || 0;
                    if (val > 0) catBudgets[catName] = val;
                });

                AppState.budgets.categories = catBudgets;
                StorageService.saveBudgets();
                ToastService.show('Monthly budgets updated successfully', 'success');

                document.getElementById('budget-modal').classList.remove('active');
                AppUI.refreshAll();
            });
        }

        // 3. Category Form
        const categoryForm = document.getElementById('category-form');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const type = document.getElementById('new-cat-type').value;
                const name = document.getElementById('new-cat-name').value.trim();
                const color = document.getElementById('new-cat-color').value;
                const errName = document.getElementById('error-cat-name');

                if (errName) errName.textContent = '';

                if (!name) {
                    if (errName) errName.textContent = 'Category name is required';
                    return;
                }

                const exists = AppState.categories.some(c => c.name.toLowerCase() === name.toLowerCase() && c.type === type);
                if (exists) {
                    if (errName) errName.textContent = 'A category with this name already exists';
                    return;
                }

                const newCategory = {
                    id: 'custom-cat-' + Date.now(),
                    name: name,
                    type: type,
                    color: color,
                    icon: 'other',
                    isCustom: true
                };

                AppState.categories.push(newCategory);
                StorageService.saveCategories();
                ToastService.show(`Category "${name}" created`, 'success');

                document.getElementById('category-modal').classList.remove('active');
                categoryForm.reset();
                AppUI.renderCategoryOptionsInForm();
                AppUI.renderCategoryFilters();
                AppUI.renderCategoriesView();
            });
        }
    },

    // --- Search, Filters & Table Interactions ---
    bindFilters() {
        const searchInput = document.getElementById('tx-search-input');
        const clearSearchBtn = document.getElementById('tx-search-clear');
        const filterType = document.getElementById('filter-type');
        const filterCat = document.getElementById('filter-category');
        const filterPay = document.getElementById('filter-payment');
        const filterDatePreset = document.getElementById('filter-date-preset');
        const customDateWrap = document.getElementById('custom-date-container');
        const startDateInput = document.getElementById('filter-start-date');
        const endDateInput = document.getElementById('filter-end-date');
        const filterSort = document.getElementById('filter-sort');
        const resetFiltersBtn = document.getElementById('btn-reset-filters');
        const pageSizeSelect = document.getElementById('page-size-select');
        const prevBtn = document.getElementById('page-prev-btn');
        const nextBtn = document.getElementById('page-next-btn');

        let debounceTimer = null;
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    AppState.filters.search = e.target.value;
                    AppState.filters.page = 1;
                    if (clearSearchBtn) clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
                    this.renderTransactionsTable();
                }, 200);
            });
        }

        if (clearSearchBtn && searchInput) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                AppState.filters.search = '';
                AppState.filters.page = 1;
                this.renderTransactionsTable();
            });
        }

        if (filterType) {
            filterType.addEventListener('change', (e) => {
                AppState.filters.type = e.target.value;
                AppState.filters.page = 1;
                this.renderTransactionsTable();
            });
        }

        if (filterCat) {
            filterCat.addEventListener('change', (e) => {
                AppState.filters.category = e.target.value;
                AppState.filters.page = 1;
                this.renderTransactionsTable();
            });
        }

        if (filterPay) {
            filterPay.addEventListener('change', (e) => {
                AppState.filters.payment = e.target.value;
                AppState.filters.page = 1;
                this.renderTransactionsTable();
            });
        }

        if (filterDatePreset) {
            filterDatePreset.addEventListener('change', (e) => {
                AppState.filters.datePreset = e.target.value;
                AppState.filters.page = 1;
                if (customDateWrap) {
                    customDateWrap.style.display = e.target.value === 'custom' ? 'flex' : 'none';
                }
                this.renderTransactionsTable();
            });
        }

        if (startDateInput) {
            startDateInput.addEventListener('change', (e) => {
                AppState.filters.startDate = e.target.value;
                AppState.filters.page = 1;
                this.renderTransactionsTable();
            });
        }

        if (endDateInput) {
            endDateInput.addEventListener('change', (e) => {
                AppState.filters.endDate = e.target.value;
                AppState.filters.page = 1;
                this.renderTransactionsTable();
            });
        }

        if (filterSort) {
            filterSort.addEventListener('change', (e) => {
                AppState.filters.sortBy = e.target.value;
                AppState.filters.page = 1;
                this.renderTransactionsTable();
            });
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                AppState.filters.search = '';
                AppState.filters.type = 'all';
                AppState.filters.category = 'all';
                AppState.filters.payment = 'all';
                AppState.filters.datePreset = 'all';
                AppState.filters.startDate = '';
                AppState.filters.endDate = '';
                AppState.filters.sortBy = 'date-desc';
                AppState.filters.page = 1;

                if (searchInput) searchInput.value = '';
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';
                if (filterType) filterType.value = 'all';
                if (filterCat) filterCat.value = 'all';
                if (filterPay) filterPay.value = 'all';
                if (filterDatePreset) filterDatePreset.value = 'all';
                if (customDateWrap) customDateWrap.style.display = 'none';
                if (filterSort) filterSort.value = 'date-desc';

                ToastService.show('Filters reset', 'info');
                this.renderTransactionsTable();
            });
        }

        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                AppState.filters.pageSize = parseInt(e.target.value, 10);
                AppState.filters.page = 1;
                this.renderTransactionsTable();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (AppState.filters.page > 1) {
                    AppState.filters.page--;
                    this.renderTransactionsTable();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                AppState.filters.page++;
                this.renderTransactionsTable();
            });
        }

        // Table Action Delegations (Edit / Delete)
        const tableBody = document.getElementById('tx-table-body');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const editBtn = e.target.closest('[data-action="edit"]');
                const deleteBtn = e.target.closest('[data-action="delete"]');

                if (editBtn) {
                    const id = editBtn.dataset.id;
                    const tx = AppState.transactions.find(t => t.id === id);
                    if (tx) {
                        document.getElementById('tx-id').value = tx.id;
                        document.getElementById('tx-type').value = tx.type;
                        document.getElementById('tx-amount').value = tx.amount;
                        document.getElementById('tx-date').value = tx.date;
                        document.getElementById('tx-description').value = tx.description;
                        document.getElementById('tx-payment-method').value = tx.paymentMethod || 'Other';
                        document.getElementById('tx-notes').value = tx.notes || '';
                        document.getElementById('modal-tx-title').textContent = 'Edit Transaction';

                        const pillExpense = document.getElementById('pill-expense');
                        const pillIncome = document.getElementById('pill-income');
                        if (pillExpense) pillExpense.classList.toggle('active', tx.type === 'expense');
                        if (pillIncome) pillIncome.classList.toggle('active', tx.type === 'income');

                        this.renderCategoryOptionsInForm(tx.type, tx.category);

                        const modal = document.getElementById('transaction-modal');
                        modal.classList.add('active');
                        modal.setAttribute('aria-hidden', 'false');
                    }
                }

                if (deleteBtn) {
                    const id = deleteBtn.dataset.id;
                    this.showConfirmDialog(
                        'Delete Transaction',
                        'Are you sure you want to permanently delete this transaction record?',
                        () => TransactionManager.delete(id)
                    );
                }
            });
        }

        // Categories delete delegation
        const catContainer = document.querySelector('.categories-container');
        if (catContainer) {
            catContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-delete-cat]');
                if (!btn) return;
                const catId = btn.dataset.deleteCat;
                const cat = AppState.categories.find(c => c.id === catId);
                if (cat) {
                    this.showConfirmDialog(
                        'Delete Category',
                        `Are you sure you want to delete category "${cat.name}"? Transactions using it will remain categorized as "${cat.name}".`,
                        () => {
                            AppState.categories = AppState.categories.filter(c => c.id !== catId);
                            StorageService.saveCategories();
                            ToastService.show(`Category "${cat.name}" deleted`, 'info');
                            this.renderCategoryOptionsInForm();
                            this.renderCategoryFilters();
                            this.renderCategoriesView();
                        }
                    );
                }
            });
        }

        // Analytics Timeframe buttons
        const tfButtons = document.querySelectorAll('.timeframe-btn');
        tfButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tfButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                AppState.analyticsTimeframe = btn.dataset.timeframe;
                ChartService.renderAnalyticsTimelineChart();
            });
        });
    },

    // --- Settings & Reports Controls ---
    bindSettings() {
        // Currency Selector
        const curSelect = document.getElementById('currency-select');
        if (curSelect) {
            curSelect.addEventListener('change', (e) => {
                AppState.settings.currency = e.target.value;
                StorageService.saveSettings();
                
                // Update prefixes in forms
                const sym = CurrencyService.getSymbol();
                const txPref = document.getElementById('tx-currency-prefix');
                const budPref = document.getElementById('budget-currency-prefix');
                if (txPref) txPref.textContent = sym;
                if (budPref) budPref.textContent = sym;

                ToastService.show(`Currency updated to ${e.target.value}`, 'info');
                this.refreshAll();
            });
        }

        // Demo Data Buttons
        const demoBtnTop = document.getElementById('btn-demo-data');
        const demoBtnSettings = document.getElementById('btn-settings-load-demo');

        const triggerDemoLoad = () => {
            this.showConfirmDialog(
                'Load Demo Dataset',
                'This will load realistic sample income, expense, and budget data. Proceed?',
                () => DemoDataService.loadDemoData(true)
            );
        };

        if (demoBtnTop) demoBtnTop.addEventListener('click', triggerDemoLoad);
        if (demoBtnSettings) demoBtnSettings.addEventListener('click', triggerDemoLoad);

        // Export CSV Buttons
        const csvBtn1 = document.getElementById('btn-export-csv-tx');
        const csvBtn2 = document.getElementById('btn-export-csv-settings');
        if (csvBtn1) csvBtn1.addEventListener('click', () => ExportService.exportToCSV());
        if (csvBtn2) csvBtn2.addEventListener('click', () => ExportService.exportToCSV());

        // Backup & Restore
        const backupBtn = document.getElementById('btn-backup-json');
        const restoreInput = document.getElementById('input-restore-json');
        if (backupBtn) backupBtn.addEventListener('click', () => ExportService.exportJSONBackup());
        if (restoreInput) {
            restoreInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) ExportService.importJSONBackup(file);
                restoreInput.value = '';
            });
        }

        // Monthly Executive Statement Generator
        const reportBtn = document.getElementById('btn-generate-report');
        const reportContent = document.getElementById('printable-report-content');
        const reportModal = document.getElementById('report-modal');
        const printBtn = document.getElementById('btn-print-statement');

        if (reportBtn && reportContent && reportModal) {
            reportBtn.addEventListener('click', () => {
                const monthVal = document.getElementById('report-month-select').value;
                reportContent.innerHTML = ExportService.generateMonthlyStatement(monthVal);
                reportModal.classList.add('active');
                reportModal.setAttribute('aria-hidden', 'false');
            });
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Wipe All Data
        const clearBtn = document.getElementById('btn-clear-all-data');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.showConfirmDialog(
                    'Wipe All Local Data',
                    'DANGER: This action cannot be undone. All your transactions, custom categories, and budgets will be permanently deleted.',
                    () => {
                        StorageService.clearAll();
                        ToastService.show('All local data cleared', 'info');
                        this.refreshAll();
                    }
                );
            });
        }
    },

    // --- Confirmation Modal Utility ---
    showConfirmDialog(title, message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-modal-title');
        const msgEl = document.getElementById('confirm-modal-msg');
        const confirmBtn = document.getElementById('btn-confirm-action');

        if (!modal) return;

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');

        const handleConfirm = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            confirmBtn.removeEventListener('click', handleConfirm);
            if (typeof onConfirm === 'function') onConfirm();
        };

        // Remove old listeners
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        newBtn.addEventListener('click', handleConfirm);
    },

    // --- Global Accessibility & Keyboard Shortcuts ---
    bindGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal-overlay.active');
                activeModals.forEach(m => {
                    m.classList.remove('active');
                    m.setAttribute('aria-hidden', 'true');
                });
            }
        });
    }
};

// ==========================================================================
// 12. BOOTSTRAP APPLICATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    ToastService.init();
    StorageService.load();
    AppUI.init();
});

