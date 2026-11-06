# Smart Expense Tracker Pro 📊

A modern, high-performance, client-side personal finance and budgeting dashboard web application built with **HTML5, CSS3, Vanilla JavaScript, Chart.js**, and **LocalStorage**.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-purple.svg)
![GitHub Pages Compatible](https://img.shields.io/badge/GitHub%20Pages-Ready-brightgreen.svg)
![Dependencies: Zero Build](https://img.shields.io/badge/build-Zero%20Config-informational.svg)

---

## 🌟 Key Features

### 1. Executive Financial Dashboard
- **Real-Time Key Stats:** Total Balance, Lifetime Income, Lifetime Expenses, Monthly Savings, and retention ratio.
- **Dynamic Chart.js Visualizations:**
  - **Income vs. Expense:** Grouped monthly cashflow bar chart.
  - **Category Breakdown:** Interactive donut chart showcasing expense distribution with percentage tooltips.
  - **Monthly Expense Trend:** Smooth curved spline showing historical outflow trajectory.
- **Recent Transactions Feed:** High-priority ledger feed with color-coded badges and payment icons.

### 2. Transaction Management
- **Full CRUD Capabilities:** Add, edit, inspect, and delete income and expense records.
- **Comprehensive Fields:** Amount, Description, Date picker, Category, Payment Method (Cash, Credit Card, Debit Card, Bank Transfer, Digital Wallet/UPI, Other), and optional notes/tags.
- **Instant Search:** Debounced multi-term search query across description, category, payment method, notes, and amount.
- **Advanced Filtering Pipeline:**
  - Filter by Type (All, Income, Expense).
  - Filter by Category (All or specific built-in / custom category).
  - Filter by Payment Method.
  - Filter by Date Presets: *All Time, Today, This Week, This Month, Last Month, This Year*, or *Custom Date Range*.
  - Sort by Date (Newest/Oldest) or Amount (Highest/Lowest).
- **Pagination:** Smooth pagination with configurable items per page (10, 25, 50).

### 3. Smart Budget Management & Overrun Alerts
- **Monthly Spending Ceilings:** Set overall monthly spending limits and individual category allocations.
- **Visual Progress Indicators:** Multi-stage glowing progress bars:
  - 🟢 **Normal (< 70%):** On track with electric cyan/emerald gradients.
  - 🟡 **Caution (70% - 79%):** Approaching budget limit.
  - 🟠 **Critical Warning (≥ 80%):** Glowing orange alert trigger on dashboard and sidebar.
  - 🔴 **Exceeded (≥ 100%):** Pulsing red danger banner alert and badges.
- **Remaining Balance Calculations:** Automatically computes remaining balance and usage percentage in real-time.

### 4. Deep Financial Analytics
- **Timeframe Selector:** Monthly, Weekly, and Yearly aggregations.
- **Behavioral Insights:**
  - Average Daily Spend across active spending days.
  - Top Expense Category & amount spent.
  - Net Savings Rate percentage and monthly surplus.
  - Largest single expense identification.
- **Visual Analytics:**
  - Time-series spending bar chart.
  - Net savings trend line chart.
  - Day-of-Week spending heat chart (identifies weekend vs. weekday habits).
  - Payment method share donut chart.

### 5. Custom Category Creator
- Built-in expense categories: *Food & Dining, Shopping, Travel & Transport, Education, Entertainment, Bills & Utilities, Healthcare, Other Expense*.
- Built-in income categories: *Salary, Freelance & Contract, Investments, Side Business, Gifts & Grants, Other Income*.
- **Custom Categories:** Create custom categories with tailored classifications (Income or Expense) and a 12-color hex palette picker.

### 6. Reports, Backup & Data Portability
- **Executive Monthly Statement:** Interactive modal generating a printable summary statement for any selected month.
- **Print / PDF Ready:** Standard `@media print` styling strips unnecessary navigation to produce clean, professional statements.
- **CSV Export:** Standard RFC 4180-compliant CSV export compatible with Microsoft Excel, Google Sheets, and accounting software.
- **JSON Backup & Restore:** Export complete database backups as `.json` and restore seamlessly on any machine.
- **One-Click Demo Data:** Pre-loaded with realistic multi-month transactions and budgets for instant demonstration.
- **Data Wipe:** Safe reset modal with confirmation safeguard.

### 7. UI/UX Design System
- **Dark & Light Themes:** Default dark obsidian/navy aesthetic (`#080b11`) with electric blue (`#38bdf8`) and purple (`#a855f7`) accents, toggleable to a clean light mode.
- **Glassmorphism:** Multi-layered blurred backdrops (`backdrop-filter: blur(16px)`), translucent cards, and smooth micro-animations.
- **Responsive Layout:** Optimized for mobile phones, tablets, and wide-screen desktop displays with a collapsible mobile drawer navigation.
- **Multi-Currency Support:** USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), CAD (CA$), and AUD (AU$) with locale-aware number formatting.
- **Accessible & Clean:** No page reloads; client-side SPA architecture with keyboard shortcuts (`Esc` to dismiss modals).

---

## 📁 Project Structure

```
smart-expense-tracker/
│
├── index.html          # Semantic HTML5 layout, modals, sidebar and SPA views
├── style.css           # Modern SaaS CSS with Glassmorphism, CSS variables, dark/light themes
├── script.js           # Vanilla JS state store, storage service, Chart.js engine & UI controller
├── README.md           # Documentation, setup & deployment instructions
└── assets/
    └── icons/          # Clean SVG icons
        ├── food.svg
        ├── shopping.svg
        ├── travel.svg
        ├── education.svg
        ├── entertainment.svg
        ├── bills.svg
        ├── healthcare.svg
        ├── other.svg
        ├── salary.svg
        ├── wallet.svg
        ├── trending-up.svg
        ├── calendar.svg
        ├── settings.svg
        ├── plus.svg
        ├── trash.svg
        ├── edit.svg
        └── download.svg
```

---

## 🚀 Getting Started

Because Smart Expense Tracker is built with native web standards and zero build-step dependencies, you can run it immediately without `npm install` or compilers.

### Option A: Direct Open
1. Clone or download this repository.
2. Double-click `index.html` in your file explorer to open it directly in any modern web browser (Chrome, Firefox, Safari, Edge, Brave, Opera).

### Option B: Local Development Server (Recommended)
Running through a local web server enables optimal module handling and caching:

**Using Python:**
```bash
# Python 3.x
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

**Using Node.js (npx serve):**
```bash
npx serve .
```

**Using VS Code Live Server:**
1. Open the project folder in Visual Studio Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

---

## 🌐 Deploying to GitHub Pages

Smart Expense Tracker is 100% static and fully GitHub Pages compatible:

1. Create a new repository on GitHub (e.g. `smart-expense-tracker`).
2. Push your files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Smart Expense Tracker v2.0"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Navigate to **Settings** → **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select `main` branch and `/ (root)` folder.
   - Click **Save**.
4. In a few seconds, your site will be live at `https://<your-username>.github.io/<repo-name>/`.

---

## 🔒 Privacy & Persistence

- **100% Local & Private:** All transactions, categories, budgets, and user settings are stored securely inside your browser's `window.localStorage`.
- **No Remote Tracking:** No third-party trackers, no backend server, and no analytics beacons.
- **Portability:** Use the **Backup & Restore (JSON)** feature in the *Reports & Data* view to export or sync your records across devices.

---

## 📄 License
This project is open-source and released under the **MIT License**.

#   s m a r t - e x p e n s e - t r a c k e r  
 