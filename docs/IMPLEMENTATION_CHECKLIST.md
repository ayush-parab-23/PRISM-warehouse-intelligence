# PRISM — Master Implementation Checklist & Architecture Plan
**Multi-Agent AI Warehouse Intelligence Platform**
**Facility Location:** Kharghar, Navi Mumbai, Maharashtra, India

---

## 1. Inspection Summary & Baseline Status
- **Frontend Stack:** React 19, TypeScript, Vite 8.2, Tailwind CSS 3.4, Recharts 3.10, Lucide React.
- **Previous State:** Standalone mock-only single-dashboard React app without backend, without real database, without real-time sync, lacking employee portal, lacking the 2D interactive digital twin warehouse floor plan, and lacking genuine agent orchestration.
- **Node & Runtime:** Node v22.11.0 on Windows x64 with native `node:sqlite` (ACID transactional SQL) and Express + WebSocket.

---

## 2. Multi-Stage Implementation Checklist

### Stage A: Foundation, Inspection & Brand Design Tokens
- [x] Inspect existing directory, packages, configuration, and build pipeline.
- [x] Establish implementation checklist (`docs/IMPLEMENTATION_CHECKLIST.md`).
- [ ] Centralize brand identity & design tokens (Navy `#203247`, Warm Canvas `#F5F4F0`, Surface `#FFFFFF`, Slate `#64748B`, Teal `#0F8276`, Amber `#D99A27`, Error Red `#C44D4D`).
- [ ] Configure Tailwind & typography (Inter / tabular numerals, 8pt spacing system, elevation tokens).

### Stage B: Backend Architecture & Authoritative Relational Database
- [ ] Create `server/` with Express REST API + WebSocket Server (`server/index.ts`).
- [ ] Implement database schema with SQLite in WAL mode (`server/db/schema.sql` and `server/db/database.ts`):
  - Users & Roles (`manager`, `employee`)
  - 4 Seed Customers:
    1. *Apex Electronics India Pvt Ltd* (Laptops & Desktops)
    2. *Nexus Mobile Technologies* (Smartphones & Tablets)
    3. *Zenith Peripherals & Networking* (Peripherals, Switches, Cables)
    4. *ElectraCore Components* (Chargers, Adapters, High-value components)
  - Zones (Operational: Receiving 1/2, Staging, Inspection, Quarantine, RMA; Storage: A1..H2; Fulfillment: Picking 1/2, Batch, Packing 1/2, Staging, Dispatch 1/2; Support: Office, IT, MHE, Exits)
  - Racks & Bins (e.g. `A1-R01-B01` with defined cubic volume and pallet/carton capacities)
  - Products & SKUs with customer association and handling constraints
  - Inventory Balances (Tracking `on_hand`, `available`, `reserved`, `quarantined`, `damaged`)
  - Transactional Inventory Movements ledger (strict audit trail, non-negative constraint)
  - Shipments, Inbound POs, Customer Orders & Line Items
  - Employee Tasks (Receive, Inspect, Putaway, Pick, Pack, Dispatch, Count)
  - Agent Definitions, Runs, Events, Recommendations & Human Approval ledger
  - Compliance Documents & System Audit Logs
- [ ] Seed comprehensive realistic electronics warehouse data for Kharghar facility.
- [ ] Provide seed script and automated schema initialization.

### Stage C: Multi-Agent AI Architecture & Orchestration Engine
- [ ] Extensible Agent Registry (`server/agents/registry.ts`)
- [ ] Implement 7 Required Agents:
  1. **Main Orchestrator Agent**: Task decomposition, agent-to-agent delegation, natural language command parsing, synthesis.
  2. **Inventory Agent**: Low-stock detection, safety stock, dynamic reorder points, consumption velocity.
  3. **Storage Optimization Agent**: Usable capacity evaluation, congestion detection, zone compatibility, customer segregation, slotting recommendations.
  4. **Inbound/Outbound Agent**: Shipment monitoring, inspection queue tracking, dock scheduling, dispatch bottlenecks.
  5. **Workforce Agent**: Shift allocation, queue balancing, skill-matched task assignment, fatigue and backlog detection.
  6. **Analytics & Forecasting Agent**: Statistical trends, exponential smoothing/moving averages, confidence intervals, model limitations.
  7. **Compliance Agent**: Hazardous electronics handling, lithium battery packaging compliance, BIS certification check, customer SLA audit.
- [ ] Typed Tool Definitions & Execution Sandbox.
- [ ] Approval workflow with human-in-the-loop gates for high-impact actions (Purchase Orders, Zone Reallocations, Shift Reassignments).
- [ ] Real-time agent event streaming over WebSocket.

### Stage D: Interactive Warehouse Digital Twin (2D Floor Plan)
- [ ] Top-down 2D architectural schematic of the Kharghar facility with SVG/Canvas.
- [ ] Full proposed zone structure:
  - Inbound & Operational (Docks 1-2, Staging, Inspection, Quarantine, Returns)
  - Storage Zones: A1-A3 (Laptops), B1-B3 (Mobiles/Tablets), C1-C3 (Accessories/Cables), D1-D2 (Networking/Electronics), E1-E2 (Customer Reserved), F1-F2 (High-Value / Restricted), G1-G2 (Overflow / Staging), H1-H2 (Returns / Quarantine)
  - Fulfillment (Picking 1-2, Batch Consolidation, Packing 1-2, Final Verification, Outbound Staging, Dispatch Docks 1-2)
  - Support (Office, IT Room, Workforce Check-in, MHE Park, Exits)
- [ ] Interactive features: Zoom, Pan, Reset, Search (SKU/Product/Bin/Customer), Zone Highlights.
- [ ] Contextual Zone Detail Drawer: utilization %, bins, SKUs stored, customer breakdown, active tasks, agent recommendations.
- [ ] Live Data Overlays:
  - Capacity Utilization Heatmap
  - Low Stock Risk Overlay
  - Storage Optimization Suggestions
  - Inbound / Outbound Bottlenecks
  - Quarantine / RMA Backlog
  - Employee Activity Density

### Stage E: Role-Based Workspaces & Navigation
- [ ] Manager Portal (`/manager/*`):
  - Overview Dashboard (KPI hierarchy, Recharts analytics, real-time activity stream)
  - AI Command Center (natural language prompt bar, agent status cards, execution timeline, tool logs, approval modal)
  - Interactive Warehouse Map (digital twin)
  - Inventory Explorer (multi-level filter, SKU drill-down, customer segregation)
  - Inbound & Outbound Management (shipment trackers, dock assignments)
  - Customer Accounts (4 electronics partners, inventory breakdown, compliance)
  - Workforce & Tasks (shift allocation, employee rosters, live task queue)
  - Analytics & Forecasts (predictive demand, stock velocity, export to CSV)
  - Compliance & Documents (regulatory certifications, BIS, audits)
  - Reports & Audit Logs (immutable event ledger)
  - Settings & System Config (warehouse metadata, Kharghar node parameters)
- [ ] Employee Portal (`/employee/*`):
  - My Tasks (priority-sorted action queue)
  - Receive Goods (PO lookup, condition notes, dock selection, duplicate prevention)
  - Inspection & Verification (pass/reject/quarantine quantities, serial capture)
  - Putaway Stock (recommended bin suggestions from Storage Agent, bin scan verification)
  - Pick & Pack (order wave picking, short-pick alerts, barcode verification)
  - Dispatch Goods (dock assignment, carrier tracking, manifest generation)
  - Stock Count (cycle counts, variance calculation, supervisor reconciliation)
  - Activity History & Performance Metrics
- [ ] Role switcher & authentication state (Manager vs Employee demo profiles with role enforcement).

### Stage F: Real-Time Synchronization & Domain Events
- [ ] WebSocket hub (`server/ws.ts`) broadcasting domain events:
  - `INVENTORY_MOVED`, `GOODS_RECEIVED`, `INSPECTION_COMPLETED`, `TASK_ASSIGNED`, `AGENT_RUN_UPDATE`, `RECOMMENDATION_CREATED`, `APPROVAL_RESOLVED`
- [ ] Frontend real-time hook (`usePrismWebSocket`) providing live auto-updating KPIs, floor plan states, and notification toasts.

### Stage G: Verification, Automated Testing & Documentation
- [ ] Comprehensive test suite verifying:
  - Role permissions enforcement
  - Non-negative inventory balance guarantees
  - Inbound -> Inspection -> Putaway state transitions
  - Picking & dispatch reservations
  - Agent command creation, execution, and approval gates
  - Warehouse map capacity calculation
- [ ] Production build verification (`npm.cmd run build`).
- [ ] Complete setup and operational documentation.
