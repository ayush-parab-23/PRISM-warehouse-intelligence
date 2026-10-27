import { Router } from 'express';
import { Database } from '../db/database.js';

export const authRouter = Router();

// Demo users list for fast switching
authRouter.get('/users', (req, res) => {
  const users = Database.queryAll(`
    SELECT id, username, full_name, email, role, badge_number, shift
    FROM users
    ORDER BY role DESC, full_name ASC
  `);
  res.json({ users });
});

// Login / switch profile
authRouter.post('/login', (req, res) => {
  const { username } = req.body;
  const user = Database.queryOne(`
    SELECT id, username, full_name, email, role, badge_number, shift
    FROM users
    WHERE username = ? OR id = ?
  `, [username, username]);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  res.json({
    user,
    token: `token-demo-${user.id}-${Date.now()}`
  });
});
