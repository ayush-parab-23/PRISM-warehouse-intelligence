import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePrismWebSocket } from '../../context/WebSocketContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AgentCard } from '../../components/agents/AgentCard';
import { AgentCommandBar } from '../../components/agents/AgentCommandBar';
import { ExecutionTimeline } from '../../components/agents/ExecutionTimeline';
import { RecommendationModal } from '../../components/agents/RecommendationModal';
import { AgentCollaborationGraph } from '../../components/agents/AgentCollaborationGraph';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench,
  RefreshCw,
  Layers,
  FileText,
  Filter,
  Zap,
  Play
} from 'lucide-react';
import { AgentReportModal, type DetailedAgentReport } from '../../components/agents/AgentReportModal';
import { ReportGenerator } from '../../services/reportGenerator';

export const AgentsPage: React.FC = () => {
  const { dataVersion } = usePrismWebSocket();
  const [agents, setAgents] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [runEvents, setRunEvents] = useState<any[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
  const [executiveReport, setExecutiveReport] = useState<DetailedAgentReport | null>(null);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  const loadAgentData = async () => {
    try {
      const [agentsRes, recsRes, runsRes] = await Promise.all([
        api.getAgents(),
        api.getRecommendations(),
        api.getAgentRuns()
      ]);
      setAgents(agentsRes.agents || []);
      setRecommendations(recsRes.recommendations || []);
      setRuns(runsRes.runs || []);

      // If no run selected yet, pick top run
      if (runsRes.runs && runsRes.runs.length > 0 && !selectedRun) {
        loadRunDetail(runsRes.runs[0].id);
      }
    } catch (err) {
      console.error('Failed to load agents telemetry:', err);
    }
  };

  const loadRunDetail = async (runId: string) => {
    try {
      const res = await api.getRunDetail(runId);
      setSelectedRun(res.run);
      setRunEvents(res.events || []);
    } catch (err) {
      console.error('Failed to load run detail:', err);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, [dataVersion]);

  const handleCommandSubmit = async (prompt: string, agentId?: string, commandType?: string) => {
    setIsOrchestrating(true);
    try {
      const res = await api.submitAgentCommand({
        agentId: agentId || 'agent-orchestrator',
        commandType: commandType || 'NATURAL_LANGUAGE_INSTRUCTION',
        userPrompt: prompt,
        userId: 'usr-mgr-1'
      });

      // Load run detail
      if (res.runId) {
        await loadRunDetail(res.runId);
      }
      await loadAgentData();
    } catch (err: any) {
      alert(`Agent execution failed: ${err.message}`);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleResolveApproval = async (approvalId: string, decision: 'APPROVED' | 'REJECTED', notes?: string) => {
    await api.resolveApproval(approvalId, { decision, notes, userId: 'usr-mgr-1' });
    await loadAgentData();
    if (selectedRun) loadRunDetail(selectedRun.id);
  };

  // Quick Action Prompts
  const quickPrompts = [
    { label: 'Audit Low-Stock Deficits', prompt: 'Audit low-stock electronics lines and propose replenishment POs', agentId: 'agent-inventory', cmd: 'ANALYZE_STOCK' },
    { label: 'Evaluate Kharghar Storage Capacity', prompt: 'Audit usable cubic volume and identify congested zones', agentId: 'agent-storage', cmd: 'EVALUATE_CAPACITY' },
    { label: 'Inspect Receiving Docks Dwell Time', prompt: 'Audit dock queue and trailer dwell turnaround', agentId: 'agent-inbound-outbound', cmd: 'INSPECT_DOCKS' },
    { label: 'Balance Shift Task Workload', prompt: 'Audit active picking tasks across morning shift operators', agentId: 'agent-workforce', cmd: 'AUDIT_WORKFORCE' },
    { label: 'Verify BIS & Battery Compliance', prompt: 'Audit regulatory certificates and upcoming expiry dates', agentId: 'agent-compliance', cmd: 'AUDIT_COMPLIANCE' }
  ];

  const filteredAgents = selectedAgentFilter === 'ALL'
    ? agents
    : agents.filter(a => a.id === selectedAgentFilter);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="AI Multi-Agent Command Center"
        subtitle="Coordinate autonomous warehouse agents, execute automated floor audits, and review human-in-the-loop decision approval gates."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExecutiveReport(ReportGenerator.getReportForAgent('INV-02'))}
              className="px-3 py-1.5 bg-navy hover:bg-navy-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-teal" />
              <span>Executive Engineering Report</span>
            </button>
            <button
              onClick={loadAgentData}
              className="px-3 py-1.5 border border-border bg-surface hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal" />
              <span>Refresh Agents</span>
            </button>
          </div>
        }
      />

      {/* Preset Quick Diagnostic Action Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber" /> Quick Diagnostic Prompts:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleCommandSubmit(qp.prompt, qp.agentId, qp.cmd)}
            disabled={isOrchestrating}
            className="px-2.5 py-1 rounded-full bg-surface hover:bg-teal-50 hover:border-teal text-slate-700 hover:text-teal border border-border transition-all font-medium text-[11px] shrink-0 shadow-2xs flex items-center gap-1"
          >
            <Play className="w-2.5 h-2.5 text-teal fill-teal" />
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Main Orchestrator Natural Language Command Bar */}
      <AgentCommandBar
        onSubmit={(prompt) => handleCommandSubmit(prompt)}
        isLoading={isOrchestrating}
      />

      {/* Multi-Agent Collaboration Graph Topography */}
      <AgentCollaborationGraph
        activeAgentId={selectedAgentFilter}
        onSelectAgent={(agentId) => setSelectedAgentFilter(agentId === selectedAgentFilter ? 'ALL' : agentId)}
      />

      {/* Actionable Human-in-the-Loop Approval Queue */}
      {recommendations.some(r => r.status === 'PENDING_APPROVAL') && (
        <div className="bg-amber-50/50 border border-amber/50 rounded-lg p-4 space-y-3 shadow-card">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber" />
              <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Autonomous Recommendations Awaiting Manager Approval
              </h2>
            </div>
            <span className="text-[11px] font-bold text-amber-800 font-mono">
              {recommendations.filter(r => r.status === 'PENDING_APPROVAL').length} Action Gate(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.filter(r => r.status === 'PENDING_APPROVAL').map((rec) => (
              <div 
                key={rec.id} 
                className="bg-surface border border-amber-200 rounded p-3 text-xs flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-navy text-white">
                      {rec.category}
                    </span>
                    <StatusBadge status={rec.impact_level} />
                  </div>
                  <h4 className="font-bold text-navy text-xs mb-1">{rec.title}</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2 mb-2">
                    {rec.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Agent: {rec.agent_name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExecutiveReport(ReportGenerator.getReportForAgent(rec.category === 'STORAGE' ? 'STR-03' : 'INV-02'))}
                      className="px-2 py-1 text-slate-600 hover:text-navy text-[11px] font-semibold underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span>Audit Report</span>
                    </button>
                    <button
                      onClick={() => setSelectedRecommendation(rec)}
                      className="px-2.5 py-1 bg-amber text-navy font-bold rounded text-[11px] hover:bg-amber-400 transition-colors shadow-2xs"
                    >
                      Review &amp; Authorize
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7 Specialized Agents Registry Grid with Filter Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-xs font-bold text-navy uppercase tracking-wider">
            Active Multi-Agent Registry (7 Autonomous Roles)
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs bg-slate-100 p-1 rounded-lg border border-border">
            <button
              onClick={() => setSelectedAgentFilter('ALL')}
              className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-all ${
                selectedAgentFilter === 'ALL' ? 'bg-surface text-navy font-bold shadow-xs' : 'text-slate-600 hover:text-navy'
              }`}
            >
              All Agents (7)
            </button>
            <button
              onClick={() => setSelectedAgentFilter('agent-orchestrator')}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-all ${
                selectedAgentFilter === 'agent-orchestrator' ? 'bg-surface text-navy font-bold shadow-xs' : 'text-slate-600 hover:text-navy'
              }`}
            >
              Orchestrator
            </button>
            <button
              onClick={() => setSelectedAgentFilter('agent-inventory')}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-all ${
                selectedAgentFilter === 'agent-inventory' ? 'bg-surface text-navy font-bold shadow-xs' : 'text-slate-600 hover:text-navy'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setSelectedAgentFilter('agent-storage')}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-all ${
                selectedAgentFilter === 'agent-storage' ? 'bg-surface text-navy font-bold shadow-xs' : 'text-slate-600 hover:text-navy'
              }`}
            >
              Storage
            </button>
            <button
              onClick={() => setSelectedAgentFilter('agent-inbound-outbound')}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-all ${
                selectedAgentFilter === 'agent-inbound-outbound' ? 'bg-surface text-navy font-bold shadow-xs' : 'text-slate-600 hover:text-navy'
              }`}
            >
              Logistics
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="relative group">
              <AgentCard
                agent={agent}
                onTriggerCommand={(aId, cmd, prompt) => handleCommandSubmit(prompt, aId, cmd)}
              />
              <button
                onClick={() => setExecutiveReport(ReportGenerator.getReportForAgent(agent.code || 'INV-02'))}
                className="absolute top-3 right-3 text-[10px] text-teal hover:underline font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-xs"
              >
                <FileText className="w-3 h-3" />
                <span>Report</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Step by Step Execution Timeline and Run Selector */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold text-navy uppercase tracking-wider">
              Agent Reasoning &amp; Tool Execution Log
            </h2>
            {selectedRun && (
              <button
                onClick={() => setExecutiveReport(ReportGenerator.getReportForAgent(selectedRun.agent_code || 'INV-02'))}
                className="text-teal hover:underline text-xs font-bold flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Executive Report</span>
              </button>
            )}
          </div>

          {runs.length > 0 && (
            <select
              value={selectedRun?.id || ''}
              onChange={(e) => loadRunDetail(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-border rounded bg-surface font-mono font-medium text-slate-700 shadow-xs"
            >
              {runs.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.agent_code} ({r.command_type})
                </option>
              ))}
            </select>
          )}
        </div>

        <ExecutionTimeline run={selectedRun} events={runEvents} />
      </div>

      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <RecommendationModal
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
          onResolve={handleResolveApproval}
        />
      )}

      {/* Full Executive Engineering Report Modal */}
      {executiveReport && (
        <AgentReportModal
          report={executiveReport}
          onClose={() => setExecutiveReport(null)}
          onApprovalResolved={() => {
            loadAgentData();
          }}
        />
      )}
    </div>
  );
};
