import React from 'react';
import { Brain, Boxes, LayoutGrid, Truck, Users, Activity, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

interface AgentCollaborationGraphProps {
  activeAgentId?: string;
  onSelectAgent: (agentId: string) => void;
}

export const AgentCollaborationGraph: React.FC<AgentCollaborationGraphProps> = ({
  activeAgentId,
  onSelectAgent
}) => {
  const nodes = [
    {
      id: 'agent-inventory',
      code: 'INV-02',
      name: 'Inventory Intelligence',
      role: 'Stock Velocity & Reorder Alerts',
      color: '#3B82F6',
      bgLight: 'bg-blue-50 text-blue-900 border-blue-300',
      icon: Boxes,
      x: 120,
      y: 60
    },
    {
      id: 'agent-storage',
      code: 'STR-03',
      name: 'Storage Optimization',
      role: 'Cubic Volume & Slotting Rebalance',
      color: '#F59E0B',
      bgLight: 'bg-amber-50 text-amber-900 border-amber-300',
      icon: LayoutGrid,
      x: 340,
      y: 60
    },
    {
      id: 'agent-inbound-outbound',
      code: 'LOG-04',
      name: 'Inbound & Outbound',
      role: 'Dock Dwell & Wave Dispatch',
      color: '#06B6D4',
      bgLight: 'bg-cyan-50 text-cyan-900 border-cyan-300',
      icon: Truck,
      x: 560,
      y: 60
    },
    {
      id: 'agent-workforce',
      code: 'WKF-05',
      name: 'Workforce Capacity',
      role: 'Shift Balancing & Pick Rates',
      color: '#6366F1',
      bgLight: 'bg-indigo-50 text-indigo-900 border-indigo-300',
      icon: Users,
      x: 120,
      y: 200
    },
    {
      id: 'agent-analytics',
      code: 'ANA-06',
      name: 'Predictive Analytics',
      role: '4-Week Moving Average Forecasts',
      color: '#10B981',
      bgLight: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      icon: Activity,
      x: 340,
      y: 200
    },
    {
      id: 'agent-compliance',
      code: 'CMP-07',
      name: 'Regulatory Compliance',
      role: 'BIS Codes & Battery Standards',
      color: '#F43F5E',
      bgLight: 'bg-rose-50 text-rose-900 border-rose-300',
      icon: ShieldCheck,
      x: 560,
      y: 200
    }
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div>
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-teal" />
            <span>Multi-Agent Operational Mesh &amp; Handoff Topography</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Click any agent node to inspect its execution contract, assigned tools, and domain reports.
          </p>
        </div>
        <span className="text-[10px] font-mono text-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
          7 Connected Nodes
        </span>
      </div>

      {/* Interactive Topology Graph Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Center Orchestrator Hub */}
        <div 
          onClick={() => onSelectAgent('agent-orchestrator')}
          className={`lg:col-span-4 p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            activeAgentId === 'agent-orchestrator' 
              ? 'bg-purple-50/70 border-purple-500 shadow-md ring-2 ring-purple-300'
              : 'bg-canvas border-purple-200 hover:border-purple-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-700 text-white">
                ORCH-01 (NUCLEUS)
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-navy flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Main Orchestrator</span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Receives manager instructions, coordinates intent decomposition, routes sub-tasks, and gates critical actions behind manager approvals.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-200/80 flex items-center justify-between text-[11px] text-purple-900 font-semibold">
            <span>Delegates to 6 Domain Specialists</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 6 Specialized Satellite Nodes */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {nodes.map((node) => {
            const isSelected = activeAgentId === node.id;
            const Icon = node.icon;

            return (
              <div
                key={node.id}
                onClick={() => onSelectAgent(node.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer text-xs flex flex-col justify-between ${
                  isSelected
                    ? `border-teal bg-teal-50/70 shadow-sm ring-2 ring-teal-200`
                    : 'bg-surface hover:bg-canvas border-border'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {node.code}
                    </span>
                    <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                  </div>
                  <h5 className="font-bold text-navy text-[11px] leading-tight mb-1">
                    {node.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                    {node.role}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-border/60 flex items-center justify-between text-[9px] text-teal font-semibold">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
