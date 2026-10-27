import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { Database } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { initWebSocketServer } from './ws.js';

import { authRouter } from './routes/authRoutes.js';
import { dashboardRouter } from './routes/dashboardRoutes.js';
import { inventoryRouter } from './routes/inventoryRoutes.js';
import { warehouseRouter } from './routes/warehouseRoutes.js';
import { operationsRouter } from './routes/operationsRoutes.js';
import { agentRouter } from './routes/agentRoutes.js';
import { customerRouter } from './routes/customerRoutes.js';
import { workforceRouter } from './routes/workforceRoutes.js';
import { complianceRouter } from './routes/complianceRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database and seed if new
Database.init();
seedDatabase();

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/warehouse', warehouseRouter);
app.use('/api/operations', operationsRouter);
app.use('/api/agents', agentRouter);
app.use('/api/customers', customerRouter);
app.use('/api/workforce', workforceRouter);
app.use('/api/compliance', complianceRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'PRISM Warehouse Intelligence Platform Backend',
    facility: 'Kharghar, Navi Mumbai, Maharashtra, India',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP and WebSocket Server
const server = http.createServer(app);
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  PRISM Warehouse Intelligence Server Online`);
  console.log(`  Facility: Kharghar, Navi Mumbai, Maharashtra, India`);
  console.log(`  HTTP API: http://localhost:${PORT}/api/health`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws/events`);
  console.log(`=======================================================`);
});

export { app, server };
