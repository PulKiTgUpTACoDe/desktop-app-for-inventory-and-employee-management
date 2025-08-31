# 📦 Swaraj Enterprises ERP System (Desktop App)

## 📖 Overview

Swaraj Enterprises ERP is a **Windows desktop application** designed for managing a wholesale **Import–Export business**.
It streamlines **Inventory, Purchase, Sales, Payroll, and Reporting** workflows in a single unified tool.

The app is built with **Electron.js + React (TypeScript)**, styled using **TailwindCSS + ShadCN UI**, and backed by **PostgreSQL with Prisma ORM** (future integration).

This project is intended to **digitize and automate operations** for small-to-medium businesses dealing in wholesale trading.

---

## 🚀 Features

✅ **Inventory Management**

* Track stock levels for each product
* Organize products by categories and brands
* Auto stock update on purchases/sales

✅ **Purchase Management**

* Create & manage purchase orders with suppliers
* Record goods received and update stock automatically

✅ **Sales Management**

* Create sales orders for vendors
* Generate invoices automatically
* Track pending vs completed payments

✅ **Payroll Management**

* Maintain employee records
* Process monthly payroll
* Generate payslips in PDF format

✅ **Reports & Insights**

* Sales, Purchase, Payroll, and Stock reports
* Export reports as **PDF or Email**
* Monthly summary insights

---

## 🛠️ Tech Stack

### Frontend

* **Electron.js** → Desktop app shell
* **React (TypeScript)** → User Interface
* **TailwindCSS** → Styling
* **ShadCN UI** → Modern, prebuilt UI components
* **Lucide Icons** → Beautiful icons for navigation

### Backend

* **Node.js + Vite** → Build system & app runtime
* **Prisma ORM** (future integration) → Database access
* **PostgreSQL** → Relational database for persistence

### Packaging & Deployment

* **Electron Builder** → Generate Windows `.exe` installer
* **Cross-env** → Environment variable management
* **Dotenv** → Manage `.env` secrets

---

## 📂 Project Structure

```
swaraj-erp/
├── electron/           # Electron main process files
│   ├── main.ts
│   └── preload.ts
├── src/                # React frontend
│   ├── components/     # Reusable UI components (buttons, forms, tables)
│   ├── pages/          # App pages (Login, Dashboard, Inventory, Sales, Payroll, Reports)
│   ├── lib/            # Utilities & helpers
│   ├── App.tsx         # Main React app entry
│   └── index.tsx
├── prisma/             # Prisma schema (future integration)
│   └── schema.prisma
├── public/             # Static assets
├── dist/               # Build output
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 👨‍💻 Author

**Mandeep Gupta**
Project: *Enterprise Resource Planning System for Swaraj Enterprises*

---

## 📌 Notes

* This version is **Admin-only** (single login).
* Vendors/Suppliers will be considered for **future multi-user expansion**.
* App is designed specifically for **Windows OS**.

---

