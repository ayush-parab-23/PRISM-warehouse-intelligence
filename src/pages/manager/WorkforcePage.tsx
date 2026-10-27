import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePrismWebSocket } from '../../context/WebSocketContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Users, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Shield, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const WorkforcePage: React.FC = () => {
  const { dataVersion } = usePrismWebSocket();
  const [staff, setStaff] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkforce = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkforce();
      setStaff(res.staff || []);
      setTaskStats(res.taskStats || []);
    } catch (err) {
      console.error('Failed to load workforce:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkforce();
  }, [dataVersion]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Workforce & Task Allocation"
        subtitle="Manage floor staff, monitor live task backlogs, shift schedules, and operational labor throughput."
        actions={
          <button
            onClick={loadWorkforce}
            className="px-3 py-1.5 border border-border bg-surface hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        }
      />

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div key={s.id} className="bg-surface border border-border rounded-lg shadow-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 block">{s.badge_number}</span>
                <h3 className="text-sm font-bold text-navy">{s.full_name}</h3>
                <span className="text-[11px] text-teal font-semibold capitalize block mt-0.5">
                  {s.role} • {s.shift} Shift
                </span>
              </div>
              <div className="w-8 h-8 rounded bg-navy text-white text-xs font-bold flex items-center justify-center">
                {s.full_name.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-canvas p-2.5 rounded border border-border text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Active</span>
                <span className="font-bold text-navy font-mono tabular-nums">{s.active_tasks_count}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Running</span>
                <span className="font-bold text-teal font-mono tabular-nums">{s.in_progress_count}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Urgent</span>
                <span className={`font-bold font-mono tabular-nums ${s.urgent_count > 0 ? 'text-danger' : 'text-slate-400'}`}>
                  {s.urgent_count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Queue Breakdown Table */}
      <div className="bg-surface border border-border rounded-lg shadow-card overflow-hidden">
        <div className="p-3 border-b border-border bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-navy uppercase tracking-wider">
            Operational Task Load Breakdown
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {taskStats.reduce((acc, t) => acc + (t.count || 0), 0)} Total Tasks Recorded
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-border">
              <tr>
                <th className="px-4 py-2.5">Task Category</th>
                <th className="px-4 py-2.5">Task Status</th>
                <th className="px-4 py-2.5 text-right">Volume Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {taskStats.map((ts, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-bold text-navy font-mono">{ts.task_type}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={ts.status} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800">{ts.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
