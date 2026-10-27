import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Brain, 
  Boxes, 
  LayoutGrid, 
  Truck, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface AgentCardProps {
  agent: any;
  onTriggerCommand: (agentId: string, commandType: string, prompt: string) => void;
  onViewRuns?: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onTriggerCommand,
  onViewRuns
}) => {
  const getAgentIcon = (code: string) => {
    switch (code) {
      case 'ORCH-01': return <Brain className="w-5 h-5 text-teal" />;
      case 'INV-02': return <Boxes className="w-5 h-5 text-teal" />;
      case 'STR-03': return <LayoutGrid className="w-5 h-5 text-navy" />;
      case 'LOG-04': return <Truck className="w-5 h-5 text-amber" />;
      case 'WKF-05': return <Users className="w-5 h-5 text-slate-600" />;
      case 'ANL-06': return <TrendingUp className="w-5 h-5 text-teal" />;
      case 'CMP-07': return <ShieldCheck className="w-5 h-5 text-danger" />;
      default: return <Brain className="w-5 h-5 text-teal" />;
    }
  };

  const getQuickCommands = (code: string) => {
    switch (code) {
      case 'INV-02':
        return [
          { label: 'Find Low-Stock SKUs', cmd: 'ANALYZE_STOCK', prompt: 'Audit all electronics SKUs against configured safety reorder thresholds.' },
          { label: 'Generate Reorder Plan', cmd: 'GENERATE_REORDER', prompt: 'Compute replenishment order quantities and supplier lead times.' }
        ];
      case 'STR-03':
        return [
          { label: 'Audit Capacity', cmd: 'EVALUATE_CAPACITY', prompt: 'Evaluate cubic volume and pallet occupancy across storage zones.' },
          { label: 'Detect Congestion', cmd: 'DETECT_CONGESTION', prompt: 'Identify congested storage racks and propose slotting reallocation.' }
        ];
      case 'LOG-04':
        return [
          { label: 'Inspect Dock Queues', cmd: 'INSPECT_DOCKS', prompt: 'Audit inbound trailer dwell time and outbound dispatch staging.' },
          { label: 'Detect Bottlenecks', cmd: 'DETECT_BOTTLENECK', prompt: 'Identify dispatch packing queues and carrier transit delays.' }
        ];
      case 'WKF-05':
        return [
          { label: 'Shift Workload Load', cmd: 'AUDIT_WORKFORCE', prompt: 'Inspect task backlog distribution across warehouse shifts.' },
          { label: 'Balance Tasks', cmd: 'BALANCE_TASKS', prompt: 'Rebalance urgent wave pick tasks according to picker availability.' }
        ];
      case 'ANL-06':
        return [
          { label: 'Forecast 4-Week Demand', cmd: 'FORECAST_DEMAND', prompt: 'Project 4-week demand curves using exponential moving averages.' },
          { label: 'Stock Ageing Review', cmd: 'STOCK_AGEING', prompt: 'Analyze inventory velocity and stagnant electronics inventory.' }
        ];
      case 'CMP-07':
        return [
          { label: 'Audit BIS & SOPs', cmd: 'AUDIT_COMPLIANCE', prompt: 'Audit BIS registrations, lithium battery transport SOPs, and hazardous certificates.' },
          { label: 'Check SLA Health', cmd: 'AUDIT_SLA', prompt: 'Audit customer SLA fulfilment and quarantine clearance times.' }
        ];
      case 'ORCH-01':
      default:
        return [
          { label: 'Warehouse Full Scan', cmd: 'FULL_SCAN', prompt: 'Execute end-to-end multi-agent evaluation across stock, space, and docks.' },
          { label: 'Synthesize Operations', cmd: 'SYNTHESIZE', prompt: 'Consolidate operational status and pending manager approvals.' }
        ];
    }
  };

  const quickCommands = getQuickCommands(agent.code);

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
              {getAgentIcon(agent.code)}
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 block">{agent.code}</span>
              <h3 className="text-xs font-bold text-navy">{agent.name}</h3>
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        {/* Role & Description */}
        <p className="text-[11px] font-semibold text-teal mb-1">{agent.role}</p>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">
          {agent.description}
        </p>

        {/* Recent Result / Insight */}
        {agent.latest_result && (
          <div className="p-2 bg-canvas border border-border/80 rounded mb-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Latest Run Summary
            </span>
            <p className="text-slate-700 text-[11px] leading-snug line-clamp-2">
              "{agent.latest_result}"
            </p>
          </div>
        )}
      </div>

      {/* Action Footer & Commands */}
      <div className="pt-3 border-t border-border/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Success: <strong className="text-slate-700 tabular-nums">{agent.success_rate}%</strong></span>
          <span>Runs: <strong className="text-slate-700 tabular-nums">{agent.total_runs}</strong></span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 pt-1">
          {quickCommands.map((qc) => (
            <button
              key={qc.cmd}
              onClick={() => onTriggerCommand(agent.id, qc.cmd, qc.prompt)}
              className="w-full text-left px-2.5 py-1.5 rounded bg-slate-50 hover:bg-teal hover:text-white border border-border text-slate-700 text-[11px] font-semibold transition-colors flex items-center justify-between group"
            >
              <span>{qc.label}</span>
              <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
