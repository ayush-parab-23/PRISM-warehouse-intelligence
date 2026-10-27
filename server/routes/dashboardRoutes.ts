import { Router } from 'express';
import { AnalyticsService } from '../services/analyticsService.js';
import { Database } from '../db/database.js';

export const dashboardRouter = Router();

dashboardRouter.get('/overview', (req, res) => {
  try {
    const data = AnalyticsService.getDashboardOverview();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

dashboardRouter.get('/recent-activity', (req, res) => {
  const activities = Database.queryAll(`
    SELECT id, movement_type, product_id, quantity, reference_type, reference_id, created_at
    FROM inventory_movements
    ORDER BY created_at DESC
    LIMIT 20
  `);
  res.json({ activities });
});
