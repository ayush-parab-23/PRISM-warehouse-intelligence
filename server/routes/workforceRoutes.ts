import { Router } from 'express';
import { Database } from '../db/database.js';

export const workforceRouter = Router();

workforceRouter.get('/', (req, res) => {
  const staff = Database.queryAll(`
    SELECT 
      u.id, u.full_name, u.email, u.role, u.badge_number, u.shift,
      COUNT(t.id) as active_tasks_count,
      SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count,
      SUM(CASE WHEN t.priority = 'URGENT' AND t.status != 'COMPLETED' THEN 1 ELSE 0 END) as urgent_count
    FROM users u
    LEFT JOIN employee_tasks t ON u.id = t.assigned_to_user_id AND t.status != 'COMPLETED'
    WHERE u.role = 'employee'
    GROUP BY u.id
    ORDER BY active_tasks_count DESC
  `);

  const taskStats = Database.queryAll(`
    SELECT task_type, status, COUNT(*) as count
    FROM employee_tasks
    GROUP BY task_type, status
  `);

  res.json({ staff, taskStats });
});
