import { Database } from '../server/db/database.js';

Database.init();
Database.execute(`
  INSERT OR IGNORE INTO order_lines (id, order_id, product_id, quantity_requested, quantity_picked, quantity_packed, status)
  VALUES 
    ('line-out-1', 'ord-out-202', 'prod-7', 25, 0, 0, 'PENDING'),
    ('line-out-2', 'ord-out-203', 'prod-12', 25, 0, 0, 'PENDING'),
    ('line-out-3', 'ord-out-201', 'prod-1', 45, 45, 45, 'PACKED')
`);

console.log('Order lines in DB:', Database.queryAll('SELECT * FROM order_lines'));
