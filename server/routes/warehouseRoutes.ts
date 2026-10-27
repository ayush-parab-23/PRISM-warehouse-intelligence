import { Router } from 'express';
import { Database } from '../db/database.js';

export const warehouseRouter = Router();

// Get all zones with floor plan coordinates and utilization metrics
warehouseRouter.get('/zones', (req, res) => {
  const zones = Database.queryAll(`
    SELECT 
      z.*,
      COUNT(DISTINCT b.id) as total_bins,
      COUNT(DISTINCT CASE WHEN inv.quantity_on_hand > 0 THEN b.id END) as occupied_bins,
      COALESCE(SUM(inv.quantity_on_hand * p.volume_m3), 0.0) as calculated_cubic_meters,
      ROUND(
        (COALESCE(SUM(inv.quantity_on_hand * p.volume_m3), 0.0) / NULLIF(z.max_cubic_meters, 0)) * 100.0, 1
      ) as utilization_pct
    FROM warehouse_zones z
    LEFT JOIN storage_bins b ON z.id = b.zone_id
    LEFT JOIN inventory_balances inv ON b.id = inv.bin_id
    LEFT JOIN products p ON inv.product_id = p.id
    GROUP BY z.id
    ORDER BY z.type, z.zone_code
  `);

  res.json({ zones });
});

// Single zone contextual detail drawer data
warehouseRouter.get('/zones/:id', (req, res) => {
  const zone = Database.queryOne(`
    SELECT z.*,
      ROUND((z.current_cubic_meters / NULLIF(z.max_cubic_meters, 0)) * 100.0, 1) as utilization_pct
    FROM warehouse_zones z
    WHERE z.id = ? OR z.zone_code = ?
  `, [req.params.id, req.params.id]);

  if (!zone) return res.status(404).json({ error: 'Zone not found' });

  // Bins in this zone
  const bins = Database.queryAll(`
    SELECT 
      sb.*,
      COALESCE(SUM(inv.quantity_on_hand), 0) as total_units_stored,
      COUNT(DISTINCT inv.product_id) as distinct_skus
    FROM storage_bins sb
    LEFT JOIN inventory_balances inv ON sb.id = inv.bin_id
    WHERE sb.zone_id = ?
    GROUP BY sb.id
    ORDER BY sb.rack_code, sb.shelf_code, sb.bin_code
  `, [zone.id]);

  // Products stored in this zone
  const products = Database.queryAll(`
    SELECT 
      p.id as product_id,
      p.sku,
      p.name as product_name,
      p.category,
      c.name as customer_name,
      SUM(inv.quantity_on_hand) as units_on_hand,
      SUM(inv.quantity_available) as units_available,
      SUM(inv.quantity_quarantined) as units_quarantined,
      ROUND(SUM(inv.quantity_on_hand * p.volume_m3), 2) as volume_used_m3
    FROM inventory_balances inv
    JOIN products p ON inv.product_id = p.id
    JOIN customers c ON inv.customer_id = c.id
    WHERE inv.zone_id = ? AND inv.quantity_on_hand > 0
    GROUP BY p.id
    ORDER BY units_on_hand DESC
  `, [zone.id]);

  // Customer ownership distribution in this zone
  const customerBreakdown = Database.queryAll(`
    SELECT 
      c.id as customer_id,
      c.name as customer_name,
      SUM(inv.quantity_on_hand) as units,
      ROUND(SUM(inv.quantity_on_hand * p.volume_m3), 2) as volume_m3
    FROM inventory_balances inv
    JOIN customers c ON inv.customer_id = c.id
    JOIN products p ON inv.product_id = p.id
    WHERE inv.zone_id = ? AND inv.quantity_on_hand > 0
    GROUP BY c.id
  `, [zone.id]);

  // Recent movements in this zone
  const recentMovements = Database.queryAll(`
    SELECT m.*, p.name as product_name, p.sku, u.full_name as performed_by
    FROM inventory_movements m
    JOIN products p ON m.product_id = p.id
    JOIN users u ON m.performed_by_user_id = u.id
    WHERE m.source_zone_id = ? OR m.dest_zone_id = ?
    ORDER BY m.created_at DESC
    LIMIT 6
  `, [zone.id, zone.id]);

  // Pending tasks in this zone
  const pendingTasks = Database.queryAll(`
    SELECT t.*, u.full_name as assigned_to
    FROM employee_tasks t
    LEFT JOIN users u ON t.assigned_to_user_id = u.id
    WHERE t.zone_id = ? AND t.status != 'COMPLETED'
    ORDER BY t.priority DESC
  `, [zone.id]);

  // Agent recommendations for this zone
  const recommendations = Database.queryAll(`
    SELECT r.*, a.name as agent_name
    FROM agent_recommendations r
    JOIN agent_definitions a ON r.agent_id = a.id
    WHERE r.zone_id = ? AND r.status = 'PENDING_APPROVAL'
  `, [zone.id]);

  res.json({
    zone,
    bins,
    products,
    customerBreakdown,
    recentMovements,
    pendingTasks,
    recommendations
  });
});

// Map Overlays data
warehouseRouter.get('/overlays', (req, res) => {
  // 1. Capacity Heatmap (zone utilization)
  const capacityHeatmap = Database.queryAll(`
    SELECT 
      z.id as zone_id,
      z.zone_code,
      ROUND((COALESCE(SUM(inv.quantity_on_hand * p.volume_m3), 0.0) / NULLIF(z.max_cubic_meters, 0)) * 100.0, 1) as value
    FROM warehouse_zones z
    LEFT JOIN storage_bins b ON z.id = b.zone_id
    LEFT JOIN inventory_balances inv ON b.id = inv.bin_id
    LEFT JOIN products p ON inv.product_id = p.id
    GROUP BY z.id
  `);

  // 2. Low-Stock Risk (zones holding SKUs with deficit)
  const lowStockRiskZones = Database.queryAll(`
    SELECT DISTINCT inv.zone_id
    FROM inventory_balances inv
    JOIN products p ON inv.product_id = p.id
    WHERE inv.quantity_available <= p.reorder_threshold
  `).map((r: any) => r.zone_id);

  // 3. Storage Optimization Suggestions (zones flagged by recommendations)
  const optimizationZones = Database.queryAll(`
    SELECT DISTINCT zone_id 
    FROM agent_recommendations 
    WHERE category = 'STORAGE_OPTIMIZATION' AND status = 'PENDING_APPROVAL' AND zone_id IS NOT NULL
  `).map((r: any) => r.zone_id);

  // 4. Inbound / Outbound Bottlenecks
  const bottleneckZones = Database.queryAll(`
    SELECT DISTINCT dock_id as zone_id FROM inbound_shipments WHERE status IN ('ARRIVED_DOCK', 'INSPECTING')
    UNION
    SELECT DISTINCT dock_id as zone_id FROM outbound_orders WHERE status IN ('PACKED_READY') AND dock_id IS NOT NULL
  `).map((r: any) => r.zone_id);

  // 5. Quarantine & RMA backlogs
  const quarantineZones = ['zone-quarantine', 'zone-rma', 'zone-h1', 'zone-h2'];

  // 6. Employee Density
  const employeeDensity = Database.queryAll(`
    SELECT zone_id, COUNT(*) as task_count
    FROM employee_tasks
    WHERE status IN ('IN_PROGRESS', 'PENDING') AND zone_id IS NOT NULL
    GROUP BY zone_id
  `);

  res.json({
    capacityHeatmap,
    lowStockRiskZones,
    optimizationZones,
    bottleneckZones,
    quarantineZones,
    employeeDensity
  });
});
