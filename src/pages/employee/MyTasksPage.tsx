import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { usePrismWebSocket } from '../../context/WebSocketContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  CheckSquare, 
  Clock, 
  Play, 
  CheckCircle2, 
  MapPin, 
  Boxes, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const MyTasksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { dataVersion } = usePrismWebSocket();
  const [tasks, setTasks] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.getTasks({
        userId: currentUser.id,
        status: statusFilter !== 'All' ? statusFilter : undefined
      });
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load employee tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, dataVersion]);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.updateTaskStatus(taskId, newStatus, currentUser.id);
      await loadTasks();
    } catch (err: any) {
      alert(`Could not update task: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Operational Tasks"
        subtitle={`Active warehouse tasks assigned to ${currentUser.full_name} (${currentUser.shift} Shift).`}
        actions={
          <button
            onClick={loadTasks}
            className="px-3 py-1.5 border border-border bg-surface hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        }
      />

      {/* Task Filter Strip */}
      <div className="bg-surface p-3 rounded-lg border border-border shadow-card flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Filter Status:</span>
          {['All', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded font-semibold text-xs transition-colors ${
                statusFilter === st ? 'bg-navy text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'All' ? 'All Assigned' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
        <span className="text-slate-400 font-mono text-[11px]">
          {tasks.length} task(s) in queue
        </span>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-lg p-12 text-center text-xs text-slate-400">
            No active operational tasks pending in your queue.
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              className="bg-surface border border-border rounded-lg shadow-card p-4 space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-navy bg-slate-100 px-2 py-0.5 rounded">
                    {task.task_code}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-teal uppercase tracking-wider">
                    {task.task_type}
                  </span>
                  <StatusBadge status={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: {task.due_at ? new Date(task.due_at).toLocaleTimeString() : 'End of Shift'}</span>
                </div>
              </div>

              {/* Task Details */}
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-slate-800 text-sm leading-snug">
                  {task.instructions}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 pt-1">
                  {task.zone_name && (
                    <div className="flex items-center gap-1 font-semibold text-navy">
                      <MapPin className="w-3.5 h-3.5 text-teal" />
                      <span>{task.zone_name} ({task.zone_code})</span>
                    </div>
                  )}
                  {task.product_name && (
                    <div className="flex items-center gap-1 text-slate-700">
                      <Boxes className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.product_name} • <strong>{task.quantity} units</strong></span>
                    </div>
                  )}
                  {task.customer_name && (
                    <span className="text-slate-500 font-medium">Client: {task.customer_name}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                {task.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                    className="px-3.5 py-1.5 bg-navy hover:bg-navy-700 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Task</span>
                  </button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                    className="px-3.5 py-1.5 bg-teal hover:bg-teal-600 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}
                {task.status === 'COMPLETED' && (
                  <span className="text-teal text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Finished
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
