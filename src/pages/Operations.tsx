import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { MOCK_OPERATIONAL_ALERTS } from '../data/mockData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from 'recharts';
import { Cpu, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const Operations: React.FC = () => {
  // Bar chart operations data
  const operationsData = [
    { name: 'Receiving', value: 18, color: '#3B82F6' },
    { name: 'Picking', value: 42, color: '#2563EB' },
    { name: 'Packing', value: 35, color: '#1D4ED8' },
    { name: 'Dispatch', value: 29, color: '#1E40AF' },
  ];

  const getAlertIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning shrink-0" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-success shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader 
          title="Operations Overview" 
          subtitle="Monitor active warehouse floors, packaging queues, and dispatcher cargo bay throughput." 
        />
        <div className="text-xs bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-primary font-medium flex items-center gap-2 max-w-xs md:max-w-md">
          <Cpu className="w-4 h-4 shrink-0 text-primary" />
          <span>Operations Agent active. Floor telemetry feeds online.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receiving"
          value={18}
          subtext="Pallets in inbound dock"
          iconName="ArrowDownLeft"
        />
        <StatCard
          title="Picking"
          value={42}
          subtext="Active line items queued"
          iconName="Package"
          trend={{ value: "High", type: 'neutral' }}
        />
        <StatCard
          title="Packing"
          value={35}
          subtext="Cartons in packing stations"
          iconName="Boxes"
        />
        <StatCard
          title="Dispatch"
          value={29}
          subtext="Consignments in outbound bays"
          iconName="Truck"
        />
      </div>

      {/* Daily Operations Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-text-primary">Daily Operations Distribution</h3>
          <p className="text-xs text-text-secondary">Current workload orders active across processing pipelines</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={operationsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '8px', 
                  border: '1px solid #E2E8F0', 
                  fontSize: '12px' 
                }}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar dataKey="value" name="Active Orders" radius={[4, 4, 0, 0]}>
                {operationsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operational Alerts */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="mb-4 border-b border-border pb-3">
          <h3 className="text-sm font-bold text-text-primary">Operations Agent Alerts</h3>
          <p className="text-xs text-text-secondary">Telemetry observations flagged by the Operations Agent</p>
        </div>
        <div className="space-y-3">
          {MOCK_OPERATIONAL_ALERTS.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-start justify-between gap-4 p-3.5 rounded-lg border text-xs ${
                alert.severity.toLowerCase() === 'warning'
                  ? 'bg-amber-50/30 border-amber-100'
                  : 'bg-slate-50/50 border-slate-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getAlertIcon(alert.severity)}</div>
                <div>
                  <p className="text-text-primary font-bold">{alert.message}</p>
                  <p className="text-[10px] text-text-secondary mt-0.5 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-text-secondary" />
                    Source: Operations Agent
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={alert.severity} />
                <span className="text-[10px] text-text-secondary flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {alert.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
