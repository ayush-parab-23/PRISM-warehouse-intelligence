import { Router } from 'express';
import { Database } from '../db/database.js';

export const inventoryRouter = Router();

// Products list with stock balances
inventoryRouter.get('/products', (req, res) => {
  const { category, customerId, search } = req.query;

  let sql = `
    SELECT 
      p.*,
      c.name as customer_name,
      c.code as customer_code,
      COALESCE(SUM(b.quantity_on_hand), 0) as current_stock,
      COALESCE(SUM(b.quantity_available), 0) as available_stock,
      COALESCE(SUM(b.quantity_reserved), 0) as reserved_stock,
      COALESCE(SUM(b.quantity_quarantined), 0) as quarantined_stock,
      COALESCE(SUM(b.quantity_damaged), 0) as damaged_stock,
      CASE 
        WHEN COALESCE(SUM(b.quantity_available), 0) <= (p.reorder_threshold * 0.5) THEN 'Critical'
        WHEN COALESCE(SUM(b.quantity_available), 0) <= p.reorder_threshold THEN 'Low Stock'
        ELSE 'Healthy'
      END as status
    FROM products p
    JOIN customers c ON p.customer_id = c.id
    LEFT JOIN inventory_balances b ON p.id = b.product_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category && category !== 'All') {
    sql += ' AND p.category = ?';
    params.push(category);
  }
  if (customerId && customerId !== 'All') {
    sql += ' AND p.customer_id = ?';
    params.push(customerId);
  }
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' GROUP BY p.id ORDER BY p.name ASC';

  const products = Database.queryAll(sql, params);
  res.json({ products });
});

// Single product detail
inventoryRouter.get('/products/:id', (req, res) => {
  const product = Database.queryOne(`
    SELECT p.*, c.name as customer_name 
    FROM products p
    JOIN customers c ON p.customer_id = c.id
    WHERE p.id = ?
  `, [req.params.id]);

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const balances = Database.queryAll(`
    SELECT b.*, z.zone_code, z.name as zone_name, sb.full_location_code
    FROM inventory_balances b
    JOIN warehouse_zones z ON b.zone_id = z.id
    JOIN storage_bins sb ON b.bin_id = sb.id
    WHERE b.product_id = ?
  `, [req.params.id]);

  const movements = Database.queryAll(`
    SELECT m.*, u.full_name as performed_by
    FROM inventory_movements m
    JOIN users u ON m.performed_by_user_id = u.id
    WHERE m.product_id = ?
    ORDER BY m.created_at DESC
    LIMIT 10
  `, [req.params.id]);

  res.json({ product, balances, movements });
});

// Movement history log
inventoryRouter.get('/movements', (req, res) => {
  const movements = Database.queryAll(`
    SELECT 
      m.*,
      p.name as product_name,
      p.sku,
      c.name as customer_name,
      u.full_name as performed_by
    FROM inventory_movements m
    JOIN products p ON m.product_id = p.id
    JOIN customers c ON m.customer_id = c.id
    JOIN users u ON m.performed_by_user_id = u.id
    ORDER BY m.created_at DESC
    LIMIT 50
  `);
  res.json({ movements });
});
