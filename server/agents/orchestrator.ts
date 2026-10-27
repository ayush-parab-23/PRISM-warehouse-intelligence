/**
 * PRISM AI Warehouse Platform - Multi-Agent Orchestrator
 * Location: server/agents/orchestrator.ts
 * 
 * Central coordinator and execution engine for all 7 autonomous agents.
 * Delegates individual agent domain logic to modular role files in server/agents/roles/.
 */

import { Database } from '../db/database.js';
import { AgentRun, AgentEvent, AgentStatus } from './types.js';
import { broadcastDomainEvent } from '../ws.js';

// Modular Role Implementations
import { runOrchestratorWorkflow, ORCHESTRATOR_AGENT_META } from './roles/orchestratorAgent.js';
import { runInventoryWorkflow, INVENTORY_AGENT_META } from './roles/inventoryAgent.js';
import { runStorageWorkflow, STORAGE_AGENT_META } from './roles/storageAgent.js';
import { runLogisticsWorkflow, LOGISTICS_AGENT_META } from './roles/inboundOutboundAgent.js';
import { runWorkforceWorkflow, WORKFORCE_AGENT_META } from './roles/workforceAgent.js';
import { runAnalyticsWorkflow, ANALYTICS_AGENT_META } from './roles/analyticsAgent.js';
import { runComplianceWorkflow, COMPLIANCE_AGENT_META } from './roles/complianceAgent.js';

export class AgentOrchestrator {
  /**
   * Submit an execution command to an agent or the main orchestrator
   */
  public static async executeCommand(params: {
    agentId?: string;
    commandType: string;
    userPrompt: string;
    userId: string;
  }): Promise<{ runId: string; status: AgentStatus; summary: string }> {
    const runId = `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const targetAgentId = params.agentId || 'agent-orchestrator';

    // 1. Initialize Run Record in Authoritative Database
    Database.execute(`
      INSERT INTO agent_runs (
        id, agent_id, command_type, user_prompt, status, progress_pct, start_time
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [runId, targetAgentId, params.commandType, params.userPrompt, 'RUNNING', 10]);

    Database.execute(`
      UPDATE agent_definitions 
      SET status = 'RUNNING', last_run_at = CURRENT_TIMESTAMP, total_runs = total_runs + 1 
      WHERE id = ?
    `, [targetAgentId]);

    broadcastDomainEvent('AGENT_RUN_UPDATE', { runId, agentId: targetAgentId, status: 'RUNNING', progress: 10 });

    try {
      // 2. Dispatch to dedicated agent role module
      const outcome = await AgentOrchestrator.dispatchExecution(runId, targetAgentId, params.commandType, params.userPrompt);

      Database.execute(`
        UPDATE agent_runs 
        SET status = ?, progress_pct = 100, end_time = CURRENT_TIMESTAMP, summary_result = ?
        WHERE id = ?
      `, [outcome.finalStatus, outcome.summary, runId]);

      Database.execute(`
        UPDATE agent_definitions 
        SET status = ? 
        WHERE id = ?
      `, [outcome.finalStatus === 'WAITING_APPROVAL' ? 'WAITING_APPROVAL' : 'IDLE', targetAgentId]);

      broadcastDomainEvent('AGENT_RUN_UPDATE', { 
        runId, 
        agentId: targetAgentId, 
        status: outcome.finalStatus, 
        progress: 100,
        summary: outcome.summary 
      });

      return { runId, status: outcome.finalStatus, summary: outcome.summary };
    } catch (err: any) {
      console.error(`[AGENT ERROR] Run ${runId} failed:`, err);
      Database.execute(`
        UPDATE agent_runs 
        SET status = 'FAILED', progress_pct = 100, end_time = CURRENT_TIMESTAMP, error_message = ?
        WHERE id = ?
      `, [err.message || 'Execution error encountered', runId]);

      Database.execute(`
        UPDATE agent_definitions SET status = 'FAILED' WHERE id = ?
      `, [targetAgentId]);

      broadcastDomainEvent('AGENT_RUN_UPDATE', { runId, agentId: targetAgentId, status: 'FAILED', error: err.message });
      throw err;
    }
  }

  /**
   * Log an event to the audit trail & WebSocket
   */
  public static logEvent(
    runId: string,
    agentId: string,
    eventType: AgentEvent['event_type'],
    message: string,
    data?: any
  ) {
    const eventId = `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const dataJson = data !== undefined ? JSON.stringify(data) : null;

    Database.execute(`
      INSERT INTO agent_events (id, run_id, agent_id, event_type, message, data_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [eventId, runId, agentId, eventType, message, dataJson]);

    broadcastDomainEvent('AGENT_EVENT', {
      id: eventId,
      runId,
      agentId,
      eventType,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Route execution to specific modular agent role
   */
  private static async dispatchExecution(
    runId: string,
    agentId: string,
    commandType: string,
    prompt: string
  ): Promise<{ finalStatus: AgentStatus; summary: string }> {
    AgentOrchestrator.logEvent(
      runId, agentId, 'STEP_START',
      `Target Agent [${agentId}] initialized execution for command "${commandType}".`
    );

    switch (agentId) {
      case 'agent-orchestrator':
        return await runOrchestratorWorkflow(runId, prompt, AgentOrchestrator.logEvent);
      case 'agent-inventory':
        return await runInventoryWorkflow(runId, commandType, AgentOrchestrator.logEvent);
      case 'agent-storage':
        return await runStorageWorkflow(runId, commandType, AgentOrchestrator.logEvent);
      case 'agent-inbound-outbound':
        return await runLogisticsWorkflow(runId, commandType, AgentOrchestrator.logEvent);
      case 'agent-workforce':
        return await runWorkforceWorkflow(runId, commandType, AgentOrchestrator.logEvent);
      case 'agent-analytics':
        return await runAnalyticsWorkflow(runId, commandType, AgentOrchestrator.logEvent);
      case 'agent-compliance':
        return await runComplianceWorkflow(runId, commandType, AgentOrchestrator.logEvent);
      default:
        return { finalStatus: 'COMPLETED', summary: `Completed execution of ${commandType}.` };
    }
  }

  /**
   * Resolve an Approval Gate (Approve or Reject by Manager)
   */
  public static async resolveApproval(
    approvalId: string,
    decision: 'APPROVED' | 'REJECTED',
    userId: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    const approval = Database.queryOne(`
      SELECT a.*, r.id as rec_id, r.product_id, r.customer_id, r.category, r.suggested_action_json
      FROM approvals a
      JOIN agent_recommendations r ON a.recommendation_id = r.id
      WHERE a.id = ?
    `, [approvalId]);

    if (!approval) {
      throw new Error(`Approval ID ${approvalId} not found.`);
    }

    if (approval.status !== 'PENDING') {
      throw new Error(`Approval ${approvalId} is already ${approval.status}.`);
    }

    Database.transaction(() => {
      // 1. Update Approval Record
      Database.execute(`
        UPDATE approvals 
        SET status = ?, decision_notes = ?, decided_by_user_id = ?, decided_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [decision, notes || null, userId, approvalId]);

      // 2. Update Recommendation Record
      Database.execute(`
        UPDATE agent_recommendations 
        SET status = ?, decided_by_user_id = ?, decided_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [decision === 'APPROVED' ? 'APPROVED' : 'REJECTED', userId, approval.rec_id]);

      // 3. Update associated Agent Run if waiting
      if (approval.run_id) {
        Database.execute(`
          UPDATE agent_runs 
          SET status = 'COMPLETED', end_time = CURRENT_TIMESTAMP
          WHERE id = ? AND status = 'WAITING_APPROVAL'
        `, [approval.run_id]);
      }

      // 4. Log to Audit Table
      Database.execute(`
        INSERT INTO audit_logs (id, event_category, action, entity_type, entity_id, user_id, user_role, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `aud-appr-${Date.now()}`,
        'APPROVAL',
        `APPROVAL_${decision}`,
        'RECOMMENDATION',
        approval.rec_id,
        userId,
        'manager',
        JSON.stringify({ requested_action: approval.requested_action, decision, notes })
      ]);
    });

    broadcastDomainEvent('APPROVAL_RESOLVED', {
      approvalId,
      recommendationId: approval.rec_id,
      decision,
      userId,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: `Recommendation successfully ${decision.toLowerCase()} by Warehouse Manager.`
    };
  }
}
