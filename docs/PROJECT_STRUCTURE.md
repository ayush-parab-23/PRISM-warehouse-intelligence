# PRISM — Project Architecture & File Organization Guide
## For Group Members & Developers

Welcome to the **PRISM (Multi-Agent AI Warehouse Intelligence Platform)** codebase.  
This guide documents the repository structure so any team member can easily locate, understand, and edit any frontend view, backend service, or agent logic.

---

## 1. High-Level Folder Structure

```
prism/
├── docs/                               # Architecture, checklists, and project documentation
│   ├── PROJECT_STRUCTURE.md            # THIS FILE — Developer navigation manual
│   └── IMPLEMENTATION_CHECKLIST.md     # 18-stage master implementation tracker
│
├── server/                             # Backend application (Node.js, Express, SQLite, WebSockets)
│   ├── index.ts                        # Server bootstrap (Port 3001)
│   ├── ws.ts                           # WebSocket real-time event broadcasting
│   │
│   ├── agents/                         # 🧠 MULTI-AGENT AI SUBSYSTEM (Dedicated modular folder)
│   │   ├── index.ts                    # Unified barrel export
│   │   ├── orchestrator.ts             # Central coordinator, task router, approval gates
│   │   ├── tools.ts                    # 10 typed deterministic database tools
│   │   ├── types.ts                    # TypeScript types (AgentRun, AgentEvent, etc.)
│   │   └── roles/                      # ⭐ INDIVIDUAL AGENT DOMAIN LOGIC (EDIT HERE!)
│   │       ├── orchestratorAgent.ts    # Main Orchestrator Agent (ORCH-01)
│   │       ├── inventoryAgent.ts       # Inventory Intelligence Agent (INV-02)
│   │       ├── storageAgent.ts         # Storage Optimization Agent (STR-03)
│   │       ├── inboundOutboundAgent.ts # Inbound & Outbound Agent (LOG-04)
│   │       ├── workforceAgent.ts       # Workforce & Capacity Agent (WKF-05)
│   │       ├── analyticsAgent.ts       # Analytics & Forecasting Agent (ANA-06)
│   │       └── complianceAgent.ts      # Compliance & Regulatory Agent (CMP-07)
│   │
│   ├── db/                             # Authoritative Relational Database Layer
│   │   ├── database.ts                 # Native node:sqlite manager in WAL mode
│   │   ├── schema.sql                  # Authoritative DDL schema (24 relational tables)
│   │   ├── seed.ts                     # Database seed data (Kharghar DC, 4 clients, 38 zones)
│   │   └── prism_warehouse.db          # Active SQLite database file
│   │
│   ├── routes/                         # Express HTTP REST Route Handlers
│   │   ├── authRoutes.ts               # /api/auth (Login, users, profile switching)
│   │   ├── dashboardRoutes.ts          # /api/dashboard (Overview KPIs, charts data)
│   │   ├── inventoryRoutes.ts          # /api/inventory (SKU catalog, balances, filters)
│   │   ├── warehouseRoutes.ts          # /api/warehouse (Zones, racks, bins, overlays)
│   │   ├── operationsRoutes.ts         # /api/operations (Receive, inspect, putaway, pick, count)
│   │   ├── agentRoutes.ts              # /api/agents (Command dispatch, runs, approvals)
│   │   ├── customerRoutes.ts           # /api/customers (The 4 contracted clients)
│   │   ├── workforceRoutes.ts          # /api/workforce (Staff roster, active task loads)
│   │   └── complianceRoutes.ts         # /api/compliance (Certifications, audit logs)
│   │
│   └── services/                       # Core Transactional Domain Services
│       ├── inventoryService.ts         # Balance updates, transfers, non-negative checks
│       ├── operationsService.ts        # Receiving, inspection, putaway, dispatch workflows
│       └── analyticsService.ts         # Capacity gauges, SLAs, aging, volume trends
│
├── src/                                # Frontend application (React 19, TypeScript, Tailwind CSS)
│   ├── main.tsx                        # Client entry point
│   ├── App.tsx                         # Client router & role-based route guard
│   ├── index.css                       # Enterprise design tokens, typography, CSS variables
│   │
│   ├── components/                     # Reusable UI Component Library
│   │   ├── layout/                     # Sidebar (Manager/Employee navigation), Topbar
│   │   ├── common/                     # StatCard, StatusBadge, PageHeader, EmptyState, SystemArchitectureDiagram
│   │   ├── warehouse/                  # IsometricWarehouseDiagram, WarehouseMap, ZoneDetailDrawer
│   │   └── agents/                     # AgentCard, AgentCommandBar, ExecutionTimeline, AgentReportModal
│   │
│   ├── pages/                          # Role-Based Workspaces
│   │   ├── manager/                    # 11 Manager views (Overview, Agents, Warehouse Map, Inventory, etc.)
│   │   └── employee/                   # 8 Employee operational views (Receive, Putaway, Pick/Pack, etc.)
│   │
│   ├── context/                        # React Context Providers
│   │   ├── AuthContext.tsx             # Active user & instant role switching (Manager <-> Employee)
│   │   └── WebSocketContext.tsx        # Live real-time WebSocket event connection
│   │
│   └── services/                       # Client API & Report Helpers
│       ├── api.ts                      # Typed Axios/Fetch client for all /api endpoints
│       └── reportGenerator.ts          # Detailed Executive Engineering Report generator
│
├── tests/                              # Automated Test Suites
│   ├── verify_prism.ts                 # 16-point core business rules verification
│   └── api_e2e_test.ts                 # 17-point live REST API integration test suite
│
├── package.json                        # Dependencies & npm scripts
├── tsconfig.json                       # TypeScript compiler configuration
├── tailwind.config.js                  # Enterprise design tokens (Navy, Warm Canvas, Teal, etc.)
└── vite.config.ts                      # Vite build & development proxy configuration
```

---

## 2. Where Do I Find or Edit Agent Logic? (Quick Cheat Sheet)

All agent code is located in: `server/agents/roles/`

| Agent Name | Code | File Location | What it does |
| :--- | :---: | :--- | :--- |
| **Main Orchestrator** | `ORCH-01` | [`server/agents/roles/orchestratorAgent.ts`](file:///c:/Users/AYUSH/.gemini/antigravity/scratch/prism/server/agents/roles/orchestratorAgent.ts) | Parses user prompts, delegates sub-tasks to specialized agents, and synthesizes results. |
| **Inventory Intelligence** | `INV-02` | [`server/agents/roles/inventoryAgent.ts`](file:///c:/Users/AYUSH/.gemini/antigravity/scratch/prism/server/agents/roles/inventoryAgent.ts) | Audits stock levels, flags low-stock SKUs, calculates runout hours, and proposes replenishment POs. |
| **Storage Optimization** | `STR-03` | [`server/agents/roles/storageAgent.ts`](file:///c:/Users/AYUSH/.gemini/antigravity/scratch/prism/server/agents/roles/storageAgent.ts) | Evaluates cubic volume, detects zone congestion, checks customer segregation, and plans pallet reallocations. |
| **Inbound & Outbound** | `LOG-04` | [`server/agents/roles/inboundOutboundAgent.ts`](file:///c:/Users/AYUSH/.gemini/antigravity/scratch/prism/server/agents/roles/inboundOutboundAgent.ts) | Audits trailer dock dwell times, monitors receiving staging, and tracks outbound dispatch waves. |
| **Workforce & Capacity** | `WKF-05` | [`server/agents/roles/workforceAgent.ts`](file:///c:/Users/AYUSH/.gemini/antigravity/scratch/prism/server/agents/roles/workforceAgent.ts) | Monitors operator task density, measures pick velocities, and balances shift allocations. |
| **Predictive Analytics** | `ANA-06` | [`server/agents/roles/analyticsAgent.ts`](file:///c:/Users/AYUSH/.gemini/antigravity/scratch/prism/server/agents/roles/analyticsAgent.ts) | Computes historical turnover cohorts, stock aging buckets, and 4-week demand forecasts. |
| **Regulatory Compliance** | `CMP-07` | [`server/agents/roles/complianceAgent.ts`](file:///c:/Users/AYUSH/.gemini/antigravity/scratch/prism/server/agents/roles/complianceAgent.ts) | Audits Bureau of Indian Standards (BIS) CRS certificates and hazardous battery transport rules. |

---

## 3. How to Add a New Capability to an Existing Agent

1. Open the agent's file in `server/agents/roles/<agentName>.ts`.
2. Add your business logic, database queries, or tool calls inside `run<AgentName>Workflow(...)`.
3. Use `logEvent(runId, agentId, eventType, message, data)` to emit step-by-step reasoning visible in the UI execution timeline.
4. If the action should be gated behind human authorization, return `finalStatus: 'WAITING_APPROVAL'`.

---

## 4. How to Test Your Changes

```bash
# 1. Run core verification tests (16 gates)
npm.cmd test

# 2. Run REST API integration tests (17 endpoints)
npm.cmd run test:api

# 3. Validate TypeScript & build for production
npm.cmd run build
```
