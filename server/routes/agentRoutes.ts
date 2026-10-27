import { Router } from 'express';
import { Database } from '../db/database.js';
import { AgentOrchestrator } from '../agents/orchestrator.js';

export const agentRouter = Router();

// List all 7 AI Agents
agentRouter.get(['/', '/agents'], (req, res) => {
  const agents = Database.queryAll(`
    SELECT 
      a.*,
      (SELECT COUNT(*) FROM agent_recommendations r WHERE r.agent_id = a.id AND r.status = 'PENDING_APPROVAL') as pending_approvals,
      (SELECT ar.summary_result FROM agent_runs ar WHERE ar.agent_id = a.id ORDER BY ar.start_time DESC LIMIT 1) as latest_result
    FROM agent_definitions a
    ORDER BY a.code ASC
  `);
  res.json({ agents });
});

// Run history across agents
agentRouter.get('/runs', (req, res) => {
  const runs = Database.queryAll(`
    SELECT r.*, a.name as agent_name, a.code as agent_code, a.icon_name
    FROM agent_runs r
    JOIN agent_definitions a ON r.agent_id = a.id
    ORDER BY r.start_time DESC
    LIMIT 30
  `);
  res.json({ runs });
});

// Granular execution events for a single run (Timeline / Graph)
agentRouter.get('/runs/:id', (req, res) => {
  const run = Database.queryOne(`
    SELECT r.*, a.name as agent_name, a.code as agent_code, a.icon_name
    FROM agent_runs r
    JOIN agent_definitions a ON r.agent_id = a.id
    WHERE r.id = ?
  `, [req.params.id]);

  if (!run) return res.status(404).json({ error: 'Run not found' });

  const events = Database.queryAll(`
    SELECT e.*, a.name as agent_name
    FROM agent_events e
    JOIN agent_definitions a ON e.agent_id = a.id
    WHERE e.run_id = ?
    ORDER BY e.created_at ASC
  `, [req.params.id]);

  const recommendations = Database.queryAll(`
    SELECT * FROM agent_recommendations WHERE run_id = ?
  `, [req.params.id]);

  res.json({ run, events, recommendations });
});

// Submit an AI Command (Natural Language or Specific Action)
agentRouter.post('/command', async (req, res) => {
  try {
    const { agentId, commandType, userPrompt, userId } = req.body;
    if (!userPrompt && !commandType) {
      return res.status(400).json({ error: 'userPrompt or commandType is required.' });
    }

    const result = await AgentOrchestrator.executeCommand({
      agentId: agentId || 'agent-orchestrator',
      commandType: commandType || 'NATURAL_LANGUAGE_QUERY',
      userPrompt: userPrompt || commandType,
      userId: userId || 'usr-mgr-1'
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Recommendations Ledger
agentRouter.get('/recommendations', (req, res) => {
  const { status, category } = req.query;
  let sql = `
    SELECT 
      r.*,
      a.name as agent_name,
      a.code as agent_code,
      p.name as product_name,
      p.sku as product_sku,
      z.name as zone_name,
      c.name as customer_name,
      appr.id as approval_id,
      appr.requested_action,
      appr.risk_level
    FROM agent_recommendations r
    JOIN agent_definitions a ON r.agent_id = a.id
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN warehouse_zones z ON r.zone_id = z.id
    LEFT JOIN customers c ON r.customer_id = c.id
    LEFT JOIN approvals appr ON r.id = appr.recommendation_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'All') {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  if (category && category !== 'All') {
    sql += ' AND r.category = ?';
    params.push(category);
  }

  sql += " ORDER BY CASE r.impact_level WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, r.created_at DESC";

  const recommendations = Database.queryAll(sql, params);
  res.json({ recommendations });
});

// Resolve an Approval Gate (Approve or Reject by Manager)
agentRouter.post('/approvals/:id/resolve', async (req, res) => {
  try {
    const { decision, userId, notes } = req.body;
    if (!decision || (decision !== 'APPROVED' && decision !== 'REJECTED')) {
      return res.status(400).json({ error: 'decision must be APPROVED or REJECTED.' });
    }

    const result = await AgentOrchestrator.resolveApproval(
      req.params.id,
      decision,
      userId || 'usr-mgr-1',
      notes
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
