# 📦 BharatStock

A premium, simple, sober, and highly effective **Multi-Tenant Point-of-Sale (POS) & Inventory Ledger** designed for small business owners.

BharatStock bridges the gap between complex accounting software and traditional paper notebooks. It provides a clean, responsive, and visual tool to manage inventory, track daily sales, and log customer invoices.

---

## ✨ Features

*   **📊 Interactive Analytics Dashboard**
    *   Dynamic statistics showing 30-day revenue, order placement volumes, and restock alarms.
    *   Custom SVG daily trend line graphs with hover tooltips displaying date-by-date sales.
*   **📦 Real-Time Inventory Sourcing**
    *   Catalog search, category filtering, and inventory status badges (In Stock, Low Stock, Out of Stock).
    *   Fast stock adjustments (+/- corrections) directly from the list view.
*   **🧾 Smart Billing & POS Receipt Generation**
    *   Frictionless invoice creation selecting items and assigning walk-in or CRM client details.
    *   Automatic tax breakdown (CGST 9% and SGST 9%) with clean print-ready popups.
    *   Client-side stock limits validation to prevent overselling.
*   **🎨 Premium Responsive Aesthetics**
    *   Cosmic dark space and clean slate light themes with a sliding footer toggle.
    *   High-end **Electric Indigo & Neon Cyan** fintech gradients.
    *   Full mobile responsiveness—adapts cleanly to tablet and smartphone viewports.
*   **🔮 3D Interactive Landing View**
    *   Features a mouse-responsive **3D Parallax Tilt card** with floating depth translation layers.
    *   Animated glassmorphic floating 3D spheres in the visual side-panel.
*   **🛡️ Multi-Tenant Architecture**
    *   Secure password hashing and token-based JWT authentication.
    *   Complete database isolation ensuring shop owners can only view and manage their own store data.

---

## 🛠️ Technology Stack

*   **Frontend:** React (Vite), React Router DOM, Vanilla CSS variables.
*   **Backend:** Node.js, Express, Mongoose (MongoDB).
*   **Deployment:** Render.com (Backend API) & Vercel.com (Frontend SPA).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have Node.js and MongoDB installed on your local machine.

### 2. Backend Installation & Setup
Navigate to the `backend` folder:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your configurations:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_phrase
```
Optional: Seed the database with sample products and client profiles:
```bash
npm run seed
```
Start the development server:
```bash
npm run dev
```

### 3. Frontend Installation & Setup
Navigate to the `frontend` folder:
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment

*   **Backend:** Hosted as a Web Service on **Render.com**. Remember to enter `backend` as the Root Directory and configure `MONGO_URI` and `JWT_SECRET` in Render's environment variables.
*   **Frontend:** Hosted as a static SPA on **Vercel.com**. Configure `frontend` as the Root Directory, Vite as the framework preset, and add `VITE_API_URL` pointing to your Render backend URL ending in `/api`.
