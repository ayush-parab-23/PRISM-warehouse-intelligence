import { Router } from 'express';
import { Database } from '../db/database.js';

export const customerRouter = Router();

customerRouter.get('/', (req, res) => {
  const customers = Database.queryAll(`
    SELECT 
      c.*,
      COUNT(DISTINCT p.id) as total_products,
      COALESCE(SUM(b.quantity_on_hand), 0) as total_stored_units,
      ROUND(COALESCE(SUM(b.quantity_on_hand * p.volume_m3), 0.0), 2) as used_storage_m3,
      ROUND((COALESCE(SUM(b.quantity_on_hand * p.volume_m3), 0.0) / NULLIF(c.allocated_storage_m3, 0)) * 100.0, 1) as storage_utilization_pct,
      (SELECT COUNT(*) FROM outbound_orders o WHERE o.customer_id = c.id AND o.status != 'DISPATCHED') as active_orders_count
    FROM customers c
    LEFT JOIN products p ON c.id = p.customer_id
    LEFT JOIN inventory_balances b ON p.id = b.product_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
  res.json({ customers });
});

customerRouter.get('/:id', (req, res) => {
  const customer = Database.queryOne(`SELECT * FROM customers WHERE id = ?`, [req.params.id]);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const products = Database.queryAll(`
    SELECT p.*, COALESCE(SUM(b.quantity_on_hand), 0) as on_hand
    FROM products p
    LEFT JOIN inventory_balances b ON p.id = b.product_id
    WHERE p.customer_id = ?
    GROUP BY p.id
  `, [customer.id]);

  const compliance = Database.queryAll(`
    SELECT * FROM compliance_records WHERE customer_id = ?
  `, [customer.id]);

  res.json({ customer, products, compliance });
});
