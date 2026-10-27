/**
 * PRISM AI Warehouse Platform - Main Orchestrator Agent (ORCH-01)
 * Location: server/agents/roles/orchestratorAgent.ts
 * 
 * Role & Responsibilities:
 * - Central coordinator & intent parser for warehouse manager instructions.
 * - Decomposes cross-functional operational goals.
 * - Delegates tasks to specialized domain agents (Inventory, Storage, Logistics, Workforce, Compliance).
 * - Synthesizes multi-agent findings into unified executive summaries.
 * - Enforces human-in-the-loop approval safety gates for high-impact actions.
 */

import { AgentStatus, AgentEvent } from '../types.js';
import { runInventoryWorkflow } from './inventoryAgent.js';
import { runStorageWorkflow } from './storageAgent.js';
import { runLogisticsWorkflow } from './inboundOutboundAgent.js';
import { runWorkforceWorkflow } from './workforceAgent.js';
import { runComplianceWorkflow } from './complianceAgent.js';

export const ORCHESTRATOR_AGENT_META = {
  id: 'agent-orchestrator',
  code: 'ORCH-01',
  name: 'Main Orchestrator Agent',
  role: 'Global Operations Coordinator',
  facility: 'Kharghar Central DC, Sector 23, Navi Mumbai',
  capabilities: [
    'intent_decomposition',
    'cross_agent_routing',
    'human_approval_gate',
    'safety_validation',
    'multi_agent_synthesis'
  ]
};

export async function runOrchestratorWorkflow(
  runId: string,
  prompt: string,
  logEvent: (runId: string, agentId: string, type: AgentEvent['event_type'], message: string, data?: any) => void
): Promise<{ finalStatus: AgentStatus; summary: string }> {
  const lower = prompt.toLowerCase();
  logEvent(
    runId,
    ORCHESTRATOR_AGENT_META.id,
    'REASONING_SUMMARY',
    `Decomposing request intent: "${prompt}". Evaluating operational ontology & routing table.`
  );

  // Keyword intent mapping
  const needsInventory = lower.includes('stock') || lower.includes('inventory') || lower.includes('reorder') || lower.includes('deficit');
  const needsStorage = lower.includes('capacity') || lower.includes('space') || lower.includes('slot') || lower.includes('congest') || lower.includes('zone');
  const needsLogistics = lower.includes('dock') || lower.includes('truck') || lower.includes('inbound') || lower.includes('outbound') || lower.includes('dispatch') || lower.includes('shipment');
  const needsWorkforce = lower.includes('workforce') || lower.includes('employee') || lower.includes('shift') || lower.includes('task') || lower.includes('picker');
  const needsCompliance = lower.includes('compliance') || lower.includes('bis') || lower.includes('hazard') || lower.includes('battery') || lower.includes('cert');

  const summaries: string[] = [];
  let requiresApproval = false;

  // 1. Inventory Handoff
  if (needsInventory || (!needsStorage && !needsLogistics && !needsWorkforce && !needsCompliance)) {
    logEvent(runId, ORCHESTRATOR_AGENT_META.id, 'HANDOFF', 'Delegating stock level evaluation to Inventory Intelligence Agent (INV-02).');
    const res = await runInventoryWorkflow(runId, 'ANALYZE_STOCK', logEvent);
    summaries.push(`[Inventory]: ${res.summary}`);
    if (res.finalStatus === 'WAITING_APPROVAL') requiresApproval = true;
  }

  // 2. Storage Handoff
  if (needsStorage) {
    logEvent(runId, ORCHESTRATOR_AGENT_META.id, 'HANDOFF', 'Delegating space optimization and rack utilization to Storage Optimization Agent (STR-03).');
    const res = await runStorageWorkflow(runId, 'EVALUATE_CAPACITY', logEvent);
    summaries.push(`[Storage]: ${res.summary}`);
    if (res.finalStatus === 'WAITING_APPROVAL') requiresApproval = true;
  }

  // 3. Logistics Handoff
  if (needsLogistics) {
    logEvent(runId, ORCHESTRATOR_AGENT_META.id, 'HANDOFF', 'Delegating dock queue and dispatch timeline audit to Inbound & Outbound Agent (LOG-04).');
    const res = await runLogisticsWorkflow(runId, 'INSPECT_DOCKS', logEvent);
    summaries.push(`[Logistics]: ${res.summary}`);
    if (res.finalStatus === 'WAITING_APPROVAL') requiresApproval = true;
  }

  // 4. Workforce Handoff
  if (needsWorkforce) {
    logEvent(runId, ORCHESTRATOR_AGENT_META.id, 'HANDOFF', 'Delegating floor shift load and backlog review to Workforce Agent (WKF-05).');
    const res = await runWorkforceWorkflow(runId, 'AUDIT_WORKFORCE', logEvent);
    summaries.push(`[Workforce]: ${res.summary}`);
  }

  // 5. Compliance Handoff
  if (needsCompliance) {
    logEvent(runId, ORCHESTRATOR_AGENT_META.id, 'HANDOFF', 'Delegating regulatory and BIS certification check to Compliance Agent (CMP-07).');
    const res = await runComplianceWorkflow(runId, 'AUDIT_COMPLIANCE', logEvent);
    summaries.push(`[Compliance]: ${res.summary}`);
  }

  const combinedSummary = summaries.join(' | ') || 'Orchestration cycle completed across warehouse nodes.';
  logEvent(runId, ORCHESTRATOR_AGENT_META.id, 'REASONING_SUMMARY', `Multi-agent synthesis complete. Final status: ${requiresApproval ? 'WAITING_APPROVAL' : 'COMPLETED'}`);

  return {
    finalStatus: requiresApproval ? 'WAITING_APPROVAL' : 'COMPLETED',
    summary: combinedSummary
  };
}
