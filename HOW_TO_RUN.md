# How to Run PRISM — Quick Start & Team Guide
**Facility Node:** Kharghar, Navi Mumbai, Maharashtra, India  
**Stack:** React 19 + TypeScript + Vite | Node.js + Express 5 + WebSockets | SQLite (WAL Mode)

---

## ⚡ 1. Quick Start Summary (TL;DR)

Open two terminal windows in the project directory:

```bash
# Terminal 1: Start Backend (REST API + WebSocket on port 3001)
npm run server

# Terminal 2: Start Frontend (Vite on http://localhost:5173)
npm run dev
```

Then open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 📋 2. Prerequisites

Before running the project, verify that your machine has:
- **Node.js**: Version **v20.19+** or **v22.11+** (Check with `node -v`)
- **npm**: Version **v10+** (Check with `npm -v`)
- Any modern web browser (Google Chrome, Microsoft Edge, Brave, Firefox)

---

## 🚀 3. Detailed Step-by-Step Instructions

### Step 1: Clone or Open the Repository
Open your terminal (PowerShell, Command Prompt, or VS Code integrated terminal) and navigate to the project root:
```bash
cd prism
```

### Step 2: Install Dependencies (First Time Only)
Install all project dependencies for both frontend and backend:
```bash
npm install
```
*Note: You only need to run this once or whenever new packages are added.*

### Step 3: Launch the Backend & Database Server
In your first terminal, run:
```bash
npm run server
```

**What happens automatically:**
1. The server binds to port **`3001`** (both Express REST endpoints and `/ws/events` WebSocket broadcast).
2. The server checks for the SQLite database at `server/db/prism_warehouse.db`.
3. If it doesn't exist, it **automatically creates the schema** in Write-Ahead Logging (`WAL`) mode and seeds:
   - The **4 electronics customer enterprises** (Apex, Nexus, Zenith, ElectraCore).
   - **38 warehouse zones** (A1–H2, Inbound Docks, Outbound Docks, Staging).
   - Storage bins, products, initial stock allocations, and employee accounts.
   - The **7 AI Agent definitions** and default system settings.

### Step 4: Launch the Frontend Development Server
In a **second terminal tab**, run:
```bash
npm run dev
```

**What happens:**
1. Vite starts the frontend development server at **`http://localhost:5173`**.
2. Vite's proxy automatically routes all `/api/*` and `/ws/*` calls to `http://localhost:3001`, so you never have to worry about CORS or manual port configuration.

### Step 5: Open in Your Browser
Open:
👉 **`http://localhost:5173`**

---

## 👤 4. Role Switching & Available Portals

PRISM features **Role-Based Access Control (RBAC)**. You can switch users instantly via the profile switcher in the top navigation bar or the sidebar workspace switcher:

### A. Manager Workspace (`/manager/*`)
- **Active User:** `Ayush Parab` (Warehouse General Manager)
- **Key Pages:**
  - **Overview Dashboard** (`/manager/overview`): Real-time KPIs, throughput charts, category capacity, and live event ticker.
  - **3D Digital Twin Map** (`/manager/warehouse-map`): Interactive 3D isometric warehouse view. Click any zone (e.g. Zone B2) to inspect real-time bin occupancy, temperature, and SKU details in the slide-out drawer. Toggle to the 2D CAD blueprint or run an Executive Space Audit.
  - **AI Agent Command Center** (`/manager/agents`): Visual agent collaboration network, prompt chips for instant audits, step-by-step reasoning logs, human-in-the-loop approvals, and full printable Executive Engineering Reports.
  - **Inventory Explorer** (`/manager/inventory`): Search, filter, and track stock across bins and customers.
  - **Logistics & Inbound/Outbound** (`/manager/logistics`): Dock trailer tracking, carrier manifests (Blue Dart, Delhivery), and departure logging.
  - **Customer Portfolios** (`/manager/customers`): Track SLA quotas, cubic utilization, and compliance for the 4 clients.

### B. Employee Workspace (`/employee/*`)
- **Active Users:** 
  - `Priya Sharma` (Senior Inventory & Compliance Lead)
  - `Rajesh Nair` (Inbound & QC Lead)
  - `Amit Shinde` (Picker & Dispatch Specialist)
- **Key Pages:**
  - **My Tasks** (`/employee/tasks`): Live prioritized floor task queue.
  - **Receive Goods** (`/employee/receive`): Inbound PO manifest intake.
  - **Inspection & QC** (`/employee/inspection`): Tamper seal audits and quarantine segregation.
  - **Putaway Stock** (`/employee/putaway`): Automated bin slotting recommendations.
  - **Pick & Pack** (`/employee/pick-pack`): Pick orders by wave tote and scan items into cartons.
  - **Dispatch Cargo** (`/employee/dispatch`): Carrier handoff and outbound verification.

---

## 🧪 5. Testing & Verification Commands

To verify that the entire system is working properly:

```bash
# Run Core System Verification (16 tests: RBAC, balance non-negative guarantees, putaway, picking)
npm test

# Run API Integration Tests (17 tests: REST endpoints, orders, agents, zones)
npm run test:api

# Run All Tests Together
npm run test:all

# Test Production Build (Ensures no TypeScript or Vite compilation errors)
npm run build
```

---

## 🔧 6. Troubleshooting & Tips

### Port 3001 or 5173 is already in use
If another process is using port 3001 or 5173:
- **On Windows (PowerShell):**
  ```powershell
  # Find process on port 3001
  netstat -ano | findstr :3001
  # Stop the process by PID
  taskkill /PID <PID_NUMBER> /F
  ```
- Or simply run the backend on a different port by setting the environment variable:
  ```powershell
  $env:PORT=3002; npm run server
  ```

### How to reset the database to a fresh state
If you want to wipe test transactions and restore the default seed data:
1. Stop the backend server (`Ctrl + C` in Terminal 1).
2. Delete the database file:
   ```bash
   # Windows PowerShell
   Remove-Item server/db/prism_warehouse.db*
   ```
3. Restart the backend:
   ```bash
   npm run server
   ```
   The backend will recreate the SQLite file and re-seed all default records cleanly.

---

## 📂 7. Project Structure Quick Reference

- `src/` — React frontend UI components, pages, hooks, and styles.
- `server/` — Express backend, database connection, and WebSocket handlers.
- `server/agents/roles/` — Dedicated folder where the reasoning logic for each of the 7 AI agents is stored.
- `docs/PROJECT_STRUCTURE.md` — Detailed file structure guide for group collaboration.
