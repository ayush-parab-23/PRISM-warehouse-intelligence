/**
 * PRISM AI Warehouse Platform - Storage Optimization Agent (STR-03)
 * Location: server/agents/roles/storageAgent.ts
 * 
 * Role & Responsibilities:
 * - Evaluates usable cubic capacity and pallet bin occupancy across zones.
 * - Detects slotting congestion, aisle impediments, and storage bottlenecks.
 * - Enforces customer asset segregation rules (Apex, Nexus, Zenith, ElectraCore).
 * - Proposes inter-zone pallet relocations with human-in-the-loop approval.
 */

import { AgentStatus, AgentEvent } from '../types.js';
import { warehouseTools } from '../tools.js';

export const STORAGE_AGENT_META = {
  id: 'agent-storage',
  code: 'STR-03',
  name: 'Storage Optimization Agent',
  role: 'Warehouse Space & Slotting Architect',
  facility: 'Kharghar Central DC, Sector 23, Navi Mumbai',
  capabilities: [
    'slotting_optimization',
    'zone_capacity_audit',
    'congestion_detection',
    'customer_segregation_check',
    'pallet_reallocation'
  ]
};

export async function runStorageWorkflow(
  runId: string,
  commandType: string,
  logEvent: (runId: string, agentId: string, type: AgentEvent['event_type'], message: string, data?: any) => void
): Promise<{ finalStatus: AgentStatus; summary: string }> {
  logEvent(
    runId,
    STORAGE_AGENT_META.id,
    'TOOL_CALL',
    'Executing tool: evaluateStorageCapacity(highUtilizationThreshold: 75)'
  );

  const congested = warehouseTools.evaluateStorageCapacity.execute(
    { highUtilizationThreshold: 75 },
    { runId, agentId: STORAGE_AGENT_META.id }
  );

  logEvent(
    runId,
    STORAGE_AGENT_META.id,
    'TOOL_RESULT',
    `Audit identified ${congested.length} storage zone(s) exceeding 75% cubic volume saturation.`,
    congested
  );

  if (congested.length > 0) {
    const zone = congested[0];
    logEvent(
      runId,
      STORAGE_AGENT_META.id,
      'REASONING_SUMMARY',
      `Zone ${zone.zone_code} (${zone.zone_name}) has reached ${zone.cubic_utilization_pct}% cubic capacity (${zone.occupied_bins}/${zone.total_configured_bins} pallet bins occupied). Risk of forklift corridor obstruction in Aisle ${zone.zone_code.slice(-2)}. Formulating overflow relocation plan.`
    );

    const plan = warehouseTools.createStorageReallocationPlan.execute(
      {
        sourceZoneId: zone.zone_id,
        destZoneId: 'zone-g1',
        productId: 'prod-1',
        quantity: 25,
        reason: `Alleviate congestion in ${zone.zone_code} by transferring 25 reserve units to Zone G1 (Overflow Staging).`
      },
      { runId, agentId: STORAGE_AGENT_META.id }
    );

    logEvent(
      runId,
      STORAGE_AGENT_META.id,
      'RECOMMENDATION',
      `Staged pallet reallocation proposal: 25 units from ${zone.zone_code} -> Zone G1.`,
      plan
    );

    logEvent(
      runId,
      STORAGE_AGENT_META.id,
      'APPROVAL_REQUIRED',
      `Physical inventory relocation requires authorized Manager approval prior to generating employee putaway task.`
    );

    return {
      finalStatus: 'WAITING_APPROVAL',
      summary: `Zone ${zone.zone_code} capacity at ${zone.cubic_utilization_pct}%. Proposed overflow transfer to Zone G1 awaiting manager approval.`
    };
  }

  logEvent(
    runId,
    STORAGE_AGENT_META.id,
    'REASONING_SUMMARY',
    'Cubic volume and bin occupancy across all 19 Kharghar electronics storage zones are balanced and within normal thresholds.'
  );

  return {
    finalStatus: 'COMPLETED',
    summary: 'Cubic volume and bin occupancy across all Kharghar storage zones are balanced and within normal thresholds.'
  };
}
