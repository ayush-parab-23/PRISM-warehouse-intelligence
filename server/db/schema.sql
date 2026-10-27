-- PRISM Warehouse Intelligence Platform Schema
-- Facility: Kharghar, Navi Mumbai, Maharashtra, India
-- Electronics Authoritative Relational Database (SQLite in WAL Mode)

PRAGMA foreign_keys = ON;

-- Users and RBAC
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'employee', 'auditor')),
  badge_number TEXT UNIQUE,
  shift TEXT CHECK (shift IN ('Morning', 'Evening', 'Night', 'General')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer Companies (Electronics Clients)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  sla_tier TEXT NOT NULL CHECK (sla_tier IN ('Tier 1 Platinum', 'Tier 2 Gold', 'Tier 3 Enterprise')),
  allocated_storage_m3 REAL NOT NULL DEFAULT 500.0,
  contract_active INTEGER NOT NULL DEFAULT 1,
  notes TEXT
);

-- Warehouse Zones (Inbound, Storage, Fulfillment, Support)
CREATE TABLE IF NOT EXISTS warehouse_zones (
  id TEXT PRIMARY KEY,
  zone_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('OPERATIONAL', 'STORAGE', 'FULFILLMENT', 'SUPPORT')),
  sub_category TEXT NOT NULL,
  purpose TEXT NOT NULL,
  temperature_controlled INTEGER NOT NULL DEFAULT 0,
  restricted_access INTEGER NOT NULL DEFAULT 0,
  max_pallet_capacity INTEGER NOT NULL DEFAULT 100,
  max_cubic_meters REAL NOT NULL DEFAULT 250.0,
  current_pallet_count INTEGER NOT NULL DEFAULT 0,
  current_cubic_meters REAL NOT NULL DEFAULT 0.0,
  coordinates_json TEXT -- x, y, width, height for 2D floor plan rendering
);

-- Bins and Storage Locations
CREATE TABLE IF NOT EXISTS storage_bins (
  id TEXT PRIMARY KEY,
  zone_id TEXT NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
  rack_code TEXT NOT NULL,
  shelf_code TEXT NOT NULL,
  bin_code TEXT NOT NULL,
  full_location_code TEXT UNIQUE NOT NULL, -- e.g. A1-R01-S02-B03
  max_weight_kg REAL NOT NULL DEFAULT 500.0,
  max_volume_m3 REAL NOT NULL DEFAULT 2.0,
  is_occupied INTEGER NOT NULL DEFAULT 0,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  customer_restriction_id TEXT REFERENCES customers(id)
);

-- Products & SKUs
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  unit_price REAL NOT NULL,
  weight_kg REAL NOT NULL,
  volume_m3 REAL NOT NULL,
  handling_class TEXT NOT NULL CHECK (handling_class IN ('STANDARD', 'FRAGILE', 'LITHIUM_BATTERY', 'HIGH_VALUE_RESTRICTED')),
  is_high_value INTEGER NOT NULL DEFAULT 0,
  reorder_threshold INTEGER NOT NULL DEFAULT 50,
  target_stock INTEGER NOT NULL DEFAULT 300,
  preferred_zone_id TEXT REFERENCES warehouse_zones(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Authoritative Inventory Balances (Strict Non-Negative Constraints)
CREATE TABLE IF NOT EXISTS inventory_balances (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  zone_id TEXT NOT NULL REFERENCES warehouse_zones(id),
  bin_id TEXT NOT NULL REFERENCES storage_bins(id),
  quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_quarantined INTEGER NOT NULL DEFAULT 0 CHECK (quantity_quarantined >= 0),
  quantity_damaged INTEGER NOT NULL DEFAULT 0 CHECK (quantity_damaged >= 0),
  last_counted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_product_bin UNIQUE (product_id, bin_id),
  CONSTRAINT chk_balance_integrity CHECK (quantity_on_hand = (quantity_available + quantity_reserved + quantity_quarantined + quantity_damaged))
);

-- Transactional Inventory Movements Ledger (Audit Log of All Physical Movements)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  movement_type TEXT NOT NULL CHECK (movement_type IN (
    'RECEIVE', 'INSPECT_PASS', 'INSPECT_FAIL', 'PUTAWAY', 'PICK_RESERVE', 'PACK_CONFIRM', 'DISPATCH', 'CYCLE_COUNT_ADJUST', 'STORAGE_TRANSFER'
  )),
  product_id TEXT NOT NULL REFERENCES products(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  source_zone_id TEXT REFERENCES warehouse_zones(id),
  source_bin_id TEXT REFERENCES storage_bins(id),
  dest_zone_id TEXT REFERENCES warehouse_zones(id),
  dest_bin_id TEXT REFERENCES storage_bins(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reference_type TEXT NOT NULL, -- PO, SO, TASK, INSPECTION, AGENT_PLAN
  reference_id TEXT NOT NULL,
  performed_by_user_id TEXT NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inbound Shipments & POs
CREATE TABLE IF NOT EXISTS inbound_shipments (
  id TEXT PRIMARY KEY,
  po_number TEXT UNIQUE NOT NULL,
  supplier TEXT NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  dock_id TEXT NOT NULL REFERENCES warehouse_zones(id),
  carrier TEXT NOT NULL,
  tracking_number TEXT,
  expected_units INTEGER NOT NULL,
  received_units INTEGER NOT NULL DEFAULT 0,
  accepted_units INTEGER NOT NULL DEFAULT 0,
  quarantined_units INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('SCHEDULED', 'ARRIVED_DOCK', 'INSPECTING', 'PUTAWAY_PENDING', 'COMPLETED', 'REJECTED')),
  eta DATETIME,
  arrived_at DATETIME,
  completed_at DATETIME,
  notes TEXT
);

-- Outbound Orders & Consignments
CREATE TABLE IF NOT EXISTS outbound_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  destination TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('URGENT', 'HIGH', 'NORMAL', 'LOW')),
  dock_id TEXT REFERENCES warehouse_zones(id),
  carrier TEXT,
  tracking_number TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING_PICK', 'PICKING', 'PACKING', 'PACKED_READY', 'DISPATCHED', 'CANCELLED')),
  total_items INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME NOT NULL,
  dispatched_at DATETIME
);

-- Outbound Order Lines
CREATE TABLE IF NOT EXISTS order_lines (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES outbound_orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity_requested INTEGER NOT NULL CHECK (quantity_requested > 0),
  quantity_picked INTEGER NOT NULL DEFAULT 0,
  quantity_packed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'PICKED', 'PACKED', 'SHORT_PICKED'))
);

-- Receiving & Inspection Records
CREATE TABLE IF NOT EXISTS quality_inspections (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL REFERENCES inbound_shipments(id),
  po_number TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  inspector_user_id TEXT NOT NULL REFERENCES users(id),
  quantity_received INTEGER NOT NULL,
  quantity_accepted INTEGER NOT NULL,
  quantity_rejected INTEGER NOT NULL DEFAULT 0,
  quantity_quarantined INTEGER NOT NULL DEFAULT 0,
  condition_grade TEXT NOT NULL CHECK (condition_grade IN ('GRADE_A_NEW', 'GRADE_B_MINOR_BOX_WEAR', 'GRADE_C_DAMAGED', 'FAIL_UNSEALED')),
  discrepancy_reason TEXT,
  serial_numbers_sample TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employee Operational Tasks
CREATE TABLE IF NOT EXISTS employee_tasks (
  id TEXT PRIMARY KEY,
  task_code TEXT UNIQUE NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('RECEIVE', 'INSPECT', 'PUTAWAY', 'PICK', 'PACK', 'DISPATCH', 'STOCK_COUNT')),
  priority TEXT NOT NULL CHECK (priority IN ('URGENT', 'HIGH', 'NORMAL', 'LOW')),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')),
  assigned_to_user_id TEXT REFERENCES users(id),
  zone_id TEXT REFERENCES warehouse_zones(id),
  bin_id TEXT REFERENCES storage_bins(id),
  product_id TEXT REFERENCES products(id),
  customer_id TEXT REFERENCES customers(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  reference_id TEXT,
  instructions TEXT NOT NULL,
  due_at DATETIME,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Agent AI System: Agents Registry
CREATE TABLE IF NOT EXISTS agent_definitions (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('IDLE', 'QUEUED', 'RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED')),
  icon_name TEXT NOT NULL,
  capabilities_json TEXT NOT NULL,
  last_run_at DATETIME,
  total_runs INTEGER NOT NULL DEFAULT 0,
  success_rate REAL NOT NULL DEFAULT 100.0
);

-- Multi-Agent AI System: Runs & Execution Log
CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agent_definitions(id),
  command_type TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED')),
  progress_pct INTEGER NOT NULL DEFAULT 0,
  start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  duration_ms INTEGER,
  summary_result TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Agent AI System: Granular Events & Tool Invocations
CREATE TABLE IF NOT EXISTS agent_events (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL REFERENCES agent_definitions(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('STEP_START', 'TOOL_CALL', 'TOOL_RESULT', 'REASONING_SUMMARY', 'HANDOFF', 'RECOMMENDATION', 'APPROVAL_REQUIRED', 'ERROR')),
  message TEXT NOT NULL,
  data_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Agent AI System: Actionable Recommendations
CREATE TABLE IF NOT EXISTS agent_recommendations (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES agent_runs(id),
  agent_id TEXT NOT NULL REFERENCES agent_definitions(id),
  product_id TEXT REFERENCES products(id),
  zone_id TEXT REFERENCES warehouse_zones(id),
  customer_id TEXT REFERENCES customers(id),
  category TEXT NOT NULL CHECK (category IN ('REORDER', 'STORAGE_OPTIMIZATION', 'INBOUND_CONGESTION', 'DISPATCH_BOTTLENECK', 'WORKFORCE_LOAD', 'COMPLIANCE_FIX')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_level TEXT NOT NULL CHECK (impact_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'INFO')),
  evidence_json TEXT NOT NULL,
  suggested_action_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXECUTED', 'DISMISSED')),
  requires_approval INTEGER NOT NULL DEFAULT 0,
  decided_at DATETIME,
  decided_by_user_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Approvals Workflow Ledger
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL REFERENCES agent_recommendations(id) ON DELETE CASCADE,
  run_id TEXT REFERENCES agent_runs(id),
  requested_action TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  decision_notes TEXT,
  decided_by_user_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  decided_at DATETIME
);

-- Electronics Compliance & Certifications
CREATE TABLE IF NOT EXISTS compliance_records (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('BIS_CERTIFICATE', 'LITHIUM_BATTERY_SOP', 'E_WASTE_AUTHORIZATION', 'HAZARDOUS_GOODS_DECLARATION', 'SLA_AGREEMENT')),
  document_number TEXT UNIQUE NOT NULL,
  issuing_authority TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('VALID', 'WARNING_EXPIRING_SOON', 'EXPIRED', 'MISSING')),
  notes TEXT,
  verified_by TEXT NOT NULL,
  verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Comprehensive Security & Operational Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  event_category TEXT NOT NULL, -- AUTH, INVENTORY, SHIPMENT, TASK, AGENT, APPROVAL, COMPLIANCE
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id TEXT REFERENCES users(id),
  user_role TEXT,
  details_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast operations and analytics
CREATE INDEX IF NOT EXISTS idx_inv_bal_product ON inventory_balances(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_bal_zone ON inventory_balances(zone_id);
CREATE INDEX IF NOT EXISTS idx_inv_bal_customer ON inventory_balances(customer_id);
CREATE INDEX IF NOT EXISTS idx_movements_prod ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_date ON inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON employee_tasks(assigned_to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_events_run ON agent_events(run_id);
CREATE INDEX IF NOT EXISTS idx_recs_status ON agent_recommendations(status);
