# 🚀 Product Strategy Document (gemini.md)

## 🧾 Product Name

LED Shop Inventory & Accounting System

---

## 🎯 Objective

To build a lightweight ERP system for small retail shops to manage inventory, sales, and basic accounting with automation.

---

## 👤 Target Users

* Shop Owner (Primary)
* Store Staff (Secondary)

---

## 💡 Core Value Proposition

A simple, fast, and reliable system to:

* Track stock across multiple warehouses
* Create sales invoices easily
* Automatically manage accounting and inventory

---

## 🧱 Core Modules

### 1. Inventory Management

* Item creation and categorization
* Multi-warehouse stock tracking
* Stock movement tracking

---

### 2. Warehouse Management

* Create multiple warehouses
* Track stock per warehouse

---

### 3. Sales Management

* Create Sales Invoices
* Add multiple items
* Select warehouse
* Auto stock deduction

---

### 4. Accounting (Automated)

* Auto journal entries on invoice submit
* Debit: Customer
* Credit: Sales

---

### 5. Dashboard

* Total stock
* Low stock alerts
* Sales summary

---

### 6. Reports

* Stock Report
* Sales Report
* Item-wise Sales

---

## 🔁 Core Workflow

1. Create Items
2. Add Opening Stock
3. Create Sales Invoice
4. System auto:

   * Reduces stock
   * Creates accounting entry

---

## ⚙️ Tech Stack

### Backend:

* Frappe Framework

### Frontend:

* React (Vite)

### API Layer:

* Frappe REST API

---

## 🔐 Roles & Permissions

### Admin:

* Full control

### Staff:

* Create Sales Invoice only

---

## 💡 Key Features (Differentiators)

* Real-time stock updates
* Warehouse-wise inventory
* Automated accounting entries
* Simple UI for non-technical users

---

## 🚀 Future Scope

* POS Billing Mode
* GST Integration
* Barcode Scanning
* Supplier & Purchase Module
* Payment Tracking

---

## ✅ Success Criteria

* User can create invoice in < 30 seconds
* Stock updates instantly
* No manual accounting required
* Mobile-friendly UI

---

## ⚠️ Constraints

* Keep system simple (avoid ERP-level complexity)
* Focus on usability over features
