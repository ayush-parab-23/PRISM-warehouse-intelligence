import { Router } from 'express';
import { OperationsService } from '../services/operationsService.js';
import { Database } from '../db/database.js';

export const operationsRouter = Router();

// Employee Task Queue
operationsRouter.get('/tasks', (req, res) => {
  const { userId, status, taskType } = req.query;
  let sql = `
    SELECT 
      t.*,
      z.name as zone_name,
      z.zone_code,
      p.name as product_name,
      p.sku,
      c.name as customer_name,
      u.full_name as assigned_to_name
    FROM employee_tasks t
    LEFT JOIN warehouse_zones z ON t.zone_id = z.id
    LEFT JOIN products p ON t.product_id = p.id
    LEFT JOIN customers c ON t.customer_id = c.id
    LEFT JOIN users u ON t.assigned_to_user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (userId) {
    sql += ' AND (t.assigned_to_user_id = ? OR t.assigned_to_user_id IS NULL)';
    params.push(userId);
  }
  if (status && status !== 'All') {
    sql += ' AND t.status = ?';
    params.push(status);
  }
  if (taskType && taskType !== 'All') {
    sql += ' AND t.task_type = ?';
    params.push(taskType);
  }

  sql += " ORDER BY CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'NORMAL' THEN 3 ELSE 4 END, t.created_at DESC";

  const tasks = Database.queryAll(sql, params);
  res.json({ tasks });
});

// Update task status (e.g. start task)
operationsRouter.patch('/tasks/:id', (req, res) => {
  const { status, userId } = req.body;
  Database.execute(`
    UPDATE employee_tasks 
    SET status = ?, 
        started_at = CASE WHEN ? = 'IN_PROGRESS' AND started_at IS NULL THEN CURRENT_TIMESTAMP ELSE started_at END,
        completed_at = CASE WHEN ? = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE completed_at END,
        assigned_to_user_id = COALESCE(assigned_to_user_id, ?)
    WHERE id = ?
  `, [status, status, status, userId || null, req.params.id]);

  res.json({ success: true, message: `Task status updated to ${status}` });
});

// Inbound Shipments list
operationsRouter.get('/shipments', (req, res) => {
  const shipments = Database.queryAll(`
    SELECT s.*, c.name as customer_name, z.name as dock_name
    FROM inbound_shipments s
    JOIN customers c ON s.customer_id = c.id
    JOIN warehouse_zones z ON s.dock_id = z.id
    ORDER BY s.arrived_at DESC, s.id DESC
  `);
  res.json({ shipments });
});

// Outbound Orders list
operationsRouter.get('/orders', (req, res) => {
  const orders = Database.queryAll(`
    SELECT 
      o.*,
      c.name as customer_name,
      (SELECT COUNT(*) FROM order_lines l WHERE l.order_id = o.id) as line_items_count
    FROM outbound_orders o
    JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
  `);

  const lines = Database.queryAll(`
    SELECT l.*, p.name as product_name, p.sku, p.category
    FROM order_lines l
    JOIN products p ON l.product_id = p.id
  `);

  res.json({ orders, lines });
});

// Receive Goods Action
operationsRouter.post('/receive', (req, res) => {
  try {
    const result = OperationsService.receiveGoods(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Inspect Goods Action
operationsRouter.post('/inspect', (req, res) => {
  try {
    const result = OperationsService.submitInspection(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Putaway Action
operationsRouter.post('/putaway', (req, res) => {
  try {
    const result = OperationsService.executePutaway(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Pick Action
operationsRouter.post('/pick', (req, res) => {
  try {
    const result = OperationsService.executePick(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Pack Action
operationsRouter.post('/pack', (req, res) => {
  try {
    const result = OperationsService.executePack(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Dispatch Action
operationsRouter.post('/dispatch', (req, res) => {
  try {
    const result = OperationsService.executeDispatch(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Stock Count Action
operationsRouter.post('/count', (req, res) => {
  try {
    const result = OperationsService.submitStockCount(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
