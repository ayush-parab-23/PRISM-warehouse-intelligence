# PRISM — Multi-Agent AI Warehouse Intelligence Platform
**Facility Node:** Kharghar, Navi Mumbai, Maharashtra, India

[![CI Status](https://github.com/ayush-parab-23/PRISM-warehouse-intelligence/actions/workflows/ci.yml/badge.svg)](https://github.com/ayush-parab-23/PRISM-warehouse-intelligence/actions)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-5.x-black?logo=express)
![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green.svg)

PRISM is an industrial-enterprise warehouse intelligence operations platform designed for a single electronics distribution hub in Kharghar, Maharashtra, India. The warehouse manages hardware across exactly four contracted customer enterprises:

1. **Apex Electronics India Pvt Ltd** — Enterprise Laptops, Desktops & Workstation Computing (Tier 1 Platinum SLA)
2. **Nexus Mobile Technologies** — Flagship 5G Smartphones, Tablets & OEM Display Modules (Tier 1 Platinum SLA)
3. **Zenith Peripherals & Networking** — Managed Switches, Structured Cabling, Keyboards & Ergonomic Mice (Tier 2 Gold SLA)
4. **ElectraCore Components** — GaN Fast Chargers, Power Banks, Lithium Replacement Packs & Internal PCBs (Tier 3 Enterprise SLA)

> 📖 **Quick Guides for Team Members:**
> - 🚀 **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** — Step-by-step instructions to start the backend, frontend, run tests, and troubleshoot.
> - 📁 **[docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** — Guide to the folder hierarchy and how to edit/add AI agent roles.

---

## 1. Core Architecture & System Features

### A. Two Role-Based Workspaces
PRISM provides two distinct, role-secured portals sharing an authoritative relational database:
- **Manager Portal (`/manager/*`)**:
  - **Overview Dashboard**: Real-time KPI hierarchy (Available units, Utilization %, Inbound receipts, Low-stock SKUs), Recharts throughput trends, category distribution, and live activity feed.
  - **AI Command Center**: Natural-language instruction bar for the Main Orchestrator, status cards for all 7 specialized agents, step-by-step reasoning timeline, tool telemetry payloads, and human-in-the-loop approval modal.
  - **Interactive Warehouse Digital Twin**: Clickable top-down 2D SVG architectural floor plan of Kharghar facility with 19 storage zones (A1–H2), operational docks, cross-aisles, live overlay heatmaps (Capacity, Low-Stock Risk, AI Optimization, Dock Bottlenecks), and a contextual Zone Detail Drawer showing rack/bin allocations.
  - **Inventory Explorer**: Search and filter by customer, category, and health; drill down into physical bin coordinates and transactional movement logs.
  - **Inbound & Outbound Logistics**: Inbound trailer receipts, dock gate assignments (Docks 1 & 2), and outbound carrier dispatch manifests (Blue Dart, Delhivery, Speed Post).
  - **Customer Portfolios & SLAs**: Contracted cubic quotas, stored product counts, and compliance health across the 4 clients.
  - **Workforce & Tasks**: Employee rosters, shift distribution (Morning, Evening, Night, General), and active floor load.
  - **Analytics & Demand Forecasts**: Holt-Winters double exponential demand smoothing with 91.5% confidence intervals and CSV export.
  - **Compliance & Safety**: Bureau of Indian Standards (BIS) filings, UN 38.3 lithium battery transport SOPs, and MPCB e-waste authorizations.
  - **Reports & Audits**: Formally synthesized printable/exportable executive warehouse statement.
  - **Settings & Audit Logs**: Facility parameters, IoT setpoints, and immutable SQLite WAL audit trail.

- **Employee Portal (`/employee/*`)**:
  - **My Tasks**: Real-time task queue sorted by priority (`URGENT`, `HIGH`, `NORMAL`, `LOW`) with one-click progress transitions.
  - **Receive Goods**: PO manifest intake, supplier tracking, condition notes, and dock selection.
  - **Inspection & QC**: Tamper seal audit, serial/IMEI barcode sampling, and segregation of accepted versus quarantined stock.
  - **Putaway Stock**: Automated bin slotting recommendations powered by the Storage Optimization Agent.
  - **Pick & Pack**: Wave order picking tote lists, barcode validation, and shipping carton consolidation.
  - **Dispatch Cargo**: Outbound loading verification, carrier waybill assignment, and departure logging.
  - **Stock Count**: Blind physical cycle counts and variance reconciliation.
  - **Activity History**: Personal transactional movement audit ledger.

### B. Multi-Agent AI System (7 Specialized Agents)
1. **Main Orchestrator Agent (`ORCH-01`)**: Decomposes user instructions, coordinates cross-agent delegations, and triggers human approval gates.
2. **Inventory Intelligence Agent (`INV-02`)**: Monitors stock levels against dynamic safety thresholds and generates purchase orders.
3. **Storage Optimization Agent (`STR-03`)**: Evaluates cubic volume and pallet capacity, resolves rack congestion, and enforces customer segregation.
4. **Inbound & Outbound Agent (`LOG-04`)**: Tracks dock trailer dwell times, QC dwell backlogs, and dispatch queues.
5. **Workforce & Capacity Agent (`WKF-05`)**: Balances floor tasks across shifts according to employee availability and role skills.
6. **Analytics & Forecasting Agent (`ANL-06`)**: Computes exponential demand smoothing and reports model confidence bounds.
7. **Compliance & Safety Agent (`CMP-07`)**: Audits mandatory BIS registrations, hazardous goods rules, and lithium battery transport SOPs.

---

## 2. Technology Stack & Database Model

- **Frontend**: React 19, TypeScript, Vite 8.2, Tailwind CSS 3.4 (with customized enterprise industrial tokens: Deep Navy `#203247`, Warm Canvas `#F5F4F0`, Restrained Teal `#0F8276`, Amber `#D99A27`, Error Red `#C44D4D`), Recharts 3.10, Lucide React.
- **Backend**: Node.js v22 (ESM) with Express 5 REST API and WebSocket Server (`ws`) for real-time domain event broadcasting.
- **Database**: Relational SQLite in Write-Ahead Logging (`WAL`) mode with foreign key enforcement and strict non-negative check constraints (`chk_balance_integrity`).
- **Real-Time Sync**: `/ws/events` pushes domain events (`INVENTORY_MOVED`, `GOODS_RECEIVED`, `INSPECTION_COMPLETED`, `AGENT_RUN_UPDATE`, `APPROVAL_RESOLVED`), instantly updating all open Manager sessions without polling.

---

## 3. Installation & Running Locally

### Prerequisites
- Node.js version 20.19+ or 22.11+
- Windows, macOS, or Linux

### Install Dependencies
```bash
npm install
```

### Run the Backend Server
```bash
npm run server
```
*The backend automatically initializes `server/db/prism_warehouse.db` and seeds the 4 electronics customer companies, 38 warehouse zones, bins, products, and agent configurations.*

### Run the Frontend Development Server
```bash
npm run dev
```
*Open `http://localhost:5173` in your browser. The Vite development proxy forwards all `/api/*` and `/ws/*` requests to `http://localhost:3001`.*

### Run Automated Tests
```bash
npm test
```
*Executes the 16-point automated verification test suite checking role permissions, non-negative balance guarantees, transactional putaway conservation, picking over-allocation guards, agent command runs, and approval resolution.*

### Build for Production
```bash
npm run build
```

---

## 4. Role Switching in UI
Use the profile dropdown in the top-right corner or the "Active Workspace" switcher in the left sidebar to toggle instantly between:
- **Ayush Parab** — Warehouse General Manager (`usr-mgr-1`, General Shift)
- **Priya Sharma** — Senior Inventory & Compliance Specialist (`usr-emp-1`, Morning Shift)
- **Rajesh Nair** — Receiving & Inbound QC Lead (`usr-emp-2`, Morning Shift)
- **Amit Shinde** — Floor Picker & Dispatch Specialist (`usr-emp-3`, Evening Shift)

---

## 5. Environment Variables
All configuration options have production-safe local defaults. To override:
- `PORT` (Default: `3001`): Port for the Express and WebSocket server.
- `PRISM_DB_PATH` (Default: `server/db/prism_warehouse.db`): Path to SQLite database file.
- `NODE_ENV` (Default: `development`): Set to `production` for production deployments.

---

## 6. Authoritative Database Schema Overview

- `users`: ID, username, password hash, role (`manager`, `employee`, `auditor`), shift, badge number.
- `customers`: ID, code, company name, industry, SLA tier, contracted storage m³.
- `warehouse_zones`: ID, zone code, name, type (`OPERATIONAL`, `STORAGE`, `FULFILLMENT`, `SUPPORT`), purpose, coordinates JSON, capacity in m³ and pallets.
- `storage_bins`: ID, zone ID, rack code, shelf code, bin code, full location code (e.g. `A1-R01-S01-B01`), max volume.
- `products`: ID, SKU, name, category, customer ID, unit price, handling class, reorder threshold, target stock.
- `inventory_balances`: Product ID, Customer ID, Zone ID, Bin ID, `quantity_on_hand`, `quantity_available`, `quantity_reserved`, `quantity_quarantined`, `quantity_damaged`. Enforces `quantity_available >= 0` and non-negative constraints.
- `inventory_movements`: Immutable transactional ledger recording every physical move with source/dest coordinates, timestamps, and operator IDs.
- `inbound_shipments` & `outbound_orders`: POs, carriers, tracking references, and dock assignments.
- `agent_definitions`, `agent_runs`, `agent_events`, `agent_recommendations`, `approvals`: Full state tracking and audit ledger for multi-agent AI execution and human decision gates.
- `compliance_records` & `audit_logs`: Regulatory filings and immutable system action logs.
