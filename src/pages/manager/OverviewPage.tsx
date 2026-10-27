import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { usePrismWebSocket } from '../../context/WebSocketContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Brain, 
  ArrowRight, 
  Sparkles, 
  Boxes, 
  Truck, 
  AlertTriangle, 
  RefreshCw,
  Building,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { IsometricWarehouseDiagram } from '../../components/warehouse/IsometricWarehouseDiagram';
import { SystemArchitectureDiagram } from '../../components/common/SystemArchitectureDiagram';
import { AgentReportModal, type DetailedAgentReport } from '../../components/agents/AgentReportModal';
import { ReportGenerator } from '../../services/reportGenerator';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { dataVersion } = usePrismWebSocket();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<DetailedAgentReport | null>(null);

  const loadData = () => {
    setLoading(true);
    api.getDashboardOverview()
      .then(res => setData(res))
      .catch(err => console.error('Failed to load dashboard overview:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [dataVersion]);

  const kpis = data?.kpis || {
    totalInventoryUnits: 0,
    availableUnits: 0,
    reservedUnits: 0,
    quarantinedUnits: 0,
    inboundTodayUnits: 0,
    outboundTodayUnits: 0,
    storageUtilizationPct: 0,
    pendingFulfillmentOrders: 0,
    lowStockSkuCount: 0,
    openExceptionsCount: 0
  };

  const handleOpenReport = (codeOrRole: string) => {
    const report = ReportGenerator.getReportForAgent(codeOrRole);
    setActiveReport(report);
  };

  const agentPills = [
    { name: 'Main Orchestrator', code: 'ORCH-01', role: 'Global Coordinator', color: 'border-purple-300 bg-purple-50/50 text-purple-900' },
    { name: 'Inventory Intelligence', code: 'INV-02', role: 'Stock & Replenishment', color: 'border-blue-300 bg-blue-50/50 text-blue-900' },
    { name: 'Storage Optimization', code: 'STR-03', role: 'Space & Slotting', color: 'border-amber-300 bg-amber-50/50 text-amber-900' },
    { name: 'Inbound / Outbound', code: 'LOG-04', role: 'Dock Logistics', color: 'border-cyan-300 bg-cyan-50/50 text-cyan-900' },
    { name: 'Workforce Balancing', code: 'WKF-05', role: 'Labor Shift Capacity', color: 'border-indigo-300 bg-indigo-50/50 text-indigo-900' },
    { name: 'Predictive Analytics', code: 'ANA-06', role: 'Demand Forecasting', color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900' },
    { name: 'Regulatory Compliance', code: 'CMP-07', role: 'BIS & Safety Audits', color: 'border-rose-300 bg-rose-50/50 text-rose-900' }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader
          title="Warehouse Command Center"
          subtitle="Real-time operational monitoring, multi-agent AI telemetry, and facility analytics."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenReport('INV-02')}
                className="px-3 py-1.5 bg-navy hover:bg-navy-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-teal" />
                <span>Executive AI Report</span>
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="px-3 py-1.5 border border-border bg-surface hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>
            </div>
          }
        />
      </div>

      {/* AI Agents Horizontal Pill Bar (As shown in Reference Image 1) */}
      <div className="bg-surface border border-border rounded-xl p-3 shadow-card">
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/60">
          <span className="text-[11px] font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-teal" />
            <span>Autonomous Multi-Agent AI Subsystem (7 Specialized Roles)</span>
          </span>
          <button
            onClick={() => navigate('/manager/agents')}
            className="text-[11px] text-teal font-bold hover:underline flex items-center gap-1"
          >
            <span>Command Center</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {agentPills.map((ag) => (
            <div
              key={ag.code}
              onClick={() => handleOpenReport(ag.code)}
              className={`p-2 rounded-lg border cursor-pointer hover:shadow-xs transition-all flex flex-col justify-between ${ag.color}`}
              title="Click to view detailed executive intelligence report"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold">{ag.code}</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <span className="font-bold text-[11px] truncate mt-1">{ag.name}</span>
              <span className="text-[9px] text-slate-500 truncate">{ag.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Primary KPI Row (Most critical 4 operational metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Inventory"
          value={kpis.availableUnits}
          unit="Units"
          subtext={`Total on-hand: ${Number(kpis.totalInventoryUnits).toLocaleString('en-IN')}`}
          iconName="Boxes"
          highlight="teal"
          trend={{ value: "+2.4%", type: 'up' }}
          onClick={() => navigate('/manager/inventory')}
        />
        <StatCard
          title="Storage Utilization"
          value={`${kpis.storageUtilizationPct}%`}
          subtext="Usable Kharghar storage bays"
          iconName="Layers"
          highlight={kpis.storageUtilizationPct > 75 ? 'amber' : 'normal'}
          trend={{ value: "Stable", type: 'neutral' }}
          onClick={() => navigate('/manager/map')}
        />
        <StatCard
          title="Inbound Receipts Today"
          value={kpis.inboundTodayUnits}
          unit="Units"
          subtext="Docks 1 & 2 intake"
          iconName="ArrowDownLeft"
          trend={{ value: "+250", type: 'up' }}
          onClick={() => navigate('/manager/logistics')}
        />
        <StatCard
          title="Low-Stock SKUs"
          value={kpis.lowStockSkuCount}
          unit="Deficits"
          subtext="Require replenishment order"
          iconName="AlertTriangle"
          highlight={kpis.lowStockSkuCount > 0 ? 'danger' : 'normal'}
          trend={{ value: kpis.lowStockSkuCount > 0 ? 'Action Required' : 'Optimal', type: kpis.lowStockSkuCount > 0 ? 'down' : 'up' }}
          onClick={() => handleOpenReport('INV-02')}
        />
      </div>

      {/* Secondary KPI Compact Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card text-xs flex justify-between items-center">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Reserved Stock</span>
            <span className="text-base font-bold text-navy tabular-nums font-mono">
              {Number(kpis.reservedUnits).toLocaleString('en-IN')} units
            </span>
          </div>
          <span className="text-[10px] text-teal font-semibold">Allocated to waves</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card text-xs flex justify-between items-center">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Outbound Shipments</span>
            <span className="text-base font-bold text-navy tabular-nums font-mono">
              {Number(kpis.outboundTodayUnits).toLocaleString('en-IN')} units
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Packed & ready</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card text-xs flex justify-between items-center">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Quarantine / RMA</span>
            <span className="text-base font-bold text-navy tabular-nums font-mono">
              {Number(kpis.quarantinedUnits).toLocaleString('en-IN')} units
            </span>
          </div>
          <span className="text-[10px] text-danger font-semibold">Hold status</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card text-xs flex justify-between items-center">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Exceptions Log</span>
            <span className="text-base font-bold text-navy tabular-nums font-mono">
              {kpis.openExceptionsCount} open
            </span>
          </div>
          <span className="text-[10px] text-amber font-semibold">Quality & certs</span>
        </div>
      </div>

      {/* Prominent Interactive Isometric Warehouse Overview Diagram */}
      <IsometricWarehouseDiagram
        onOpenReport={(code) => handleOpenReport(code)}
        onSelectZone={(zoneId) => console.log('Selected zone:', zoneId)}
      />

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Inbound vs Outbound Volumes */}
        <div className="bg-surface border border-border rounded-lg p-4 shadow-card lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <div>
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                Inbound vs Outbound Throughput
              </h3>
              <p className="text-[11px] text-slate-500">7-day warehouse physical cargo movements</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Units Handled
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.movementTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '6px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="inbound" name="Inbound Receipts" fill="#0F8276" radius={[2, 2, 0, 0]} />
                <Bar dataKey="outbound" name="Outbound Dispatches" fill="#203247" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock by Category Chart */}
        <div className="bg-surface border border-border rounded-lg p-4 shadow-card flex flex-col justify-between">
          <div className="mb-3 pb-2 border-b border-border">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
              Stock by Electronics Category
            </h3>
            <p className="text-[11px] text-slate-500">Unit breakdown across product lines</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
            {data?.charts?.stockByCategory?.map((cat: any) => (
              <div key={cat.name} className="text-xs">
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className="font-mono font-bold tabular-nums text-navy">
                    {cat.units.toLocaleString('en-IN')} units
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal h-full rounded-full"
                    style={{ width: `${Math.min((cat.units / 800) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Est. Value: ₹{cat.value_lakhs} Lakhs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Analytics Row: Capacity by Zone & Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Capacity by Zone */}
        <div className="bg-surface border border-border rounded-lg p-4 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <div>
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                Storage Capacity Utilization by Zone
              </h3>
              <p className="text-[11px] text-slate-500">Occupied cubic volume vs designed limits</p>
            </div>
            <button
              onClick={() => navigate('/manager/map')}
              className="text-teal text-xs font-bold hover:underline flex items-center gap-1"
            >
              Open 2D Digital Twin <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data?.charts?.zoneCapacityList?.slice(0, 6).map((z: any) => (
              <div key={z.zone_code} className="p-2.5 rounded bg-canvas border border-border text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-navy">{z.zone_code}</span>
                  <span className={`font-mono font-bold text-xs ${
                    Number(z.utilization_pct) > 80 ? 'text-danger' : 'text-teal'
                  }`}>
                    {z.utilization_pct}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate mb-1.5">{z.name}</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      Number(z.utilization_pct) > 80 ? 'bg-danger' : 'bg-teal'
                    }`}
                    style={{ width: `${Math.min(Number(z.utilization_pct), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Agents Monitoring Quick Card */}
        <div className="bg-surface border border-border rounded-lg p-4 shadow-card flex flex-col justify-between">
          <div className="mb-3 pb-2 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                Multi-Agent System Telemetry
              </h3>
              <p className="text-[11px] text-slate-500">7 Autonomous warehouse agents</p>
            </div>
            <Brain className="w-4 h-4 text-teal" />
          </div>

          <div className="space-y-2 mb-4 overflow-y-auto max-h-[220px]">
            {data?.agents?.map((a: any) => (
              <div 
                key={a.id} 
                onClick={() => handleOpenReport(a.code)}
                className="p-2 rounded bg-canvas hover:bg-slate-100 border border-border/80 flex items-center justify-between text-xs cursor-pointer transition-colors"
                title="Click to view detailed agent report"
              >
                <div>
                  <span className="font-bold text-navy text-[11px] flex items-center gap-1">
                    <span>{a.name}</span>
                    <FileText className="w-3 h-3 text-slate-400" />
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Runs: {a.total_runs} • Success: {a.success_rate || 99}%</span>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/manager/agents')}
            className="w-full py-2 bg-navy text-white rounded text-xs font-bold hover:bg-navy-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal" />
            <span>Launch AI Command Center</span>
          </button>
        </div>
      </div>

      {/* Prominent System Flow (How It Works) & System Architecture Diagram */}
      <SystemArchitectureDiagram />

      {/* Executive Agent Detailed Report Modal */}
      {activeReport && (
        <AgentReportModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
          onApprovalResolved={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
