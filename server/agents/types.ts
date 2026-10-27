export type AgentStatus = 'IDLE' | 'QUEUED' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED';

export type AgentEventType =
  | 'STEP_START'
  | 'TOOL_CALL'
  | 'TOOL_RESULT'
  | 'REASONING_SUMMARY'
  | 'HANDOFF'
  | 'RECOMMENDATION'
  | 'APPROVAL_REQUIRED'
  | 'ERROR';

export interface AgentDefinition {
  id: string;
  code: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  icon_name: string;
  capabilities: string[];
  last_run_at: string | null;
  total_runs: number;
  success_rate: number;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  command_type: string;
  user_prompt: string;
  status: AgentStatus;
  progress_pct: number;
  start_time: string;
  end_time: string | null;
  duration_ms: number | null;
  summary_result: string | null;
  error_message: string | null;
  events?: AgentEvent[];
}

export interface AgentEvent {
  id: string;
  run_id: string;
  agent_id: string;
  event_type: AgentEventType;
  message: string;
  data_json?: string;
  created_at: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  execute: (args: Record<string, any>, context: { runId: string; agentId: string }) => Promise<any> | any;
}

export interface Recommendation {
  id: string;
  run_id?: string;
  agent_id: string;
  product_id?: string;
  zone_id?: string;
  customer_id?: string;
  category: 'REORDER' | 'STORAGE_OPTIMIZATION' | 'INBOUND_CONGESTION' | 'DISPATCH_BOTTLENECK' | 'WORKFORCE_LOAD' | 'COMPLIANCE_FIX';
  title: string;
  description: string;
  impact_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  evidence_json: string;
  suggested_action_json: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'DISMISSED';
  requires_approval: boolean;
  decided_at?: string;
  decided_by_user_id?: string;
  created_at: string;
}
