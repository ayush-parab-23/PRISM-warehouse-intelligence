import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { 
  X, 
  Layers, 
  Boxes, 
  Sparkles, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Thermometer, 
  Lock, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface ZoneDetailDrawerProps {
  zoneId: string | null;
  onClose: () => void;
  onRunAgentAnalysis?: (zoneCode: string) => void;
}

export const ZoneDetailDrawer: React.FC<ZoneDetailDrawerProps> = ({
  zoneId,
  onClose,
  onRunAgentAnalysis
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bins' | 'products' | 'activity'>('overview');

  useEffect(() => {
    if (!zoneId) {
      setData(null);
      return;
    }

    setLoading(true);
    api.getZoneDetail(zoneId)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load zone detail:', err))
      .finally(() => setLoading(false));
  }, [zoneId]);

  if (!zoneId) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-surface shadow-drawer border-l border-border z-40 flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-border bg-slate-50/50 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy text-white">
              {data?.zone?.zone_code || zoneId}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal">
              {data?.zone?.type || 'ZONE'}
            </span>
            {data?.zone?.temperature_controlled === 1 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                <Thermometer className="w-3 h-3" /> HVAC Controlled
              </span>
            )}
            {data?.zone?.restricted_access === 1 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-danger bg-danger-50 px-1.5 py-0.5 rounded border border-danger-200">
                <Lock className="w-3 h-3" /> Restricted Vault
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-navy">{data?.zone?.name || 'Loading Zone...'}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{data?.zone?.purpose}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-4 bg-surface text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-3 border-b-2 font-semibold transition-colors ${
            activeTab === 'overview' ? 'border-teal text-teal' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Capacity
        </button>
        <button
          onClick={() => setActiveTab('bins')}
          className={`py-2.5 px-3 border-b-2 font-semibold transition-colors ${
            activeTab === 'bins' ? 'border-teal text-teal' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Racks & Bins ({data?.bins?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2.5 px-3 border-b-2 font-semibold transition-colors ${
            activeTab === 'products' ? 'border-teal text-teal' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Stored SKUs ({data?.products?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`py-2.5 px-3 border-b-2 font-semibold transition-colors ${
            activeTab === 'activity' ? 'border-teal text-teal' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Movements & Tasks
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading zone telemetry...</div>
        ) : !data ? (
          <div className="py-16 text-center text-xs text-slate-400">No data found for this zone.</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Capacity Gauges */}
                <div className="p-3 bg-canvas border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-navy">Cubic Volume Utilization</span>
                    <span className="font-mono font-bold text-teal tabular-nums">
                      {data.zone.utilization_pct || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        Number(data.zone.utilization_pct) > 85 ? 'bg-danger' :
                        Number(data.zone.utilization_pct) > 65 ? 'bg-amber' : 'bg-teal'
                      }`}
                      style={{ width: `${Math.min(Number(data.zone.utilization_pct) || 0, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 block">Occupied Volume</span>
                      <span className="font-bold text-navy tabular-nums font-mono">
                        {Number(data.zone.current_cubic_meters || 0).toFixed(2)} m³
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Max Design Volume</span>
                      <span className="font-bold text-navy tabular-nums font-mono">
                        {data.zone.max_cubic_meters} m³
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pallet & Bin Positions */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 border border-border rounded-lg bg-surface">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Configured Bins</span>
                    <span className="text-xl font-bold text-navy font-mono tabular-nums">
                      {data.bins?.length || 0}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {data.bins?.filter((b: any) => b.total_units_stored > 0).length || 0} occupied
                    </span>
                  </div>
                  <div className="p-3 border border-border rounded-lg bg-surface">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total Units Stored</span>
                    <span className="text-xl font-bold text-navy font-mono tabular-nums">
                      {data.products?.reduce((acc: number, p: any) => acc + (p.units_on_hand || 0), 0).toLocaleString('en-IN') || 0}
                    </span>
                    <span className="text-[10px] text-teal block mt-0.5">Active Balances</span>
                  </div>
                </div>

                {/* Customer Ownership Distribution */}
                {data.customerBreakdown && data.customerBreakdown.length > 0 && (
                  <div className="p-3 border border-border rounded-lg bg-surface">
                    <span className="text-xs font-bold text-navy block mb-2">Customer Ownership in Zone</span>
                    <div className="space-y-2">
                      {data.customerBreakdown.map((cust: any) => (
                        <div key={cust.customer_id} className="text-xs">
                          <div className="flex justify-between font-medium text-slate-700 mb-0.5">
                            <span className="truncate">{cust.customer_name}</span>
                            <span className="font-mono tabular-nums font-bold">{cust.units} units</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-navy h-full rounded-full" style={{ width: '60%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Agent Recommendations */}
                {data.recommendations && data.recommendations.length > 0 && (
                  <div className="p-3 border border-amber/40 bg-amber-50/30 rounded-lg">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber" />
                      <span>Agent Recommendations for this Zone</span>
                    </div>
                    {data.recommendations.map((rec: any) => (
                      <div key={rec.id} className="text-xs mt-2 pt-2 border-t border-amber-200/60">
                        <p className="font-bold text-slate-800">{rec.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bins' && (
              <div className="space-y-2">
                <span className="text-xs text-slate-500 block mb-1">
                  Individual physical bin positions inside {data.zone.zone_code}:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {data.bins?.map((bin: any) => (
                    <div 
                      key={bin.id}
                      className={`p-2.5 rounded border text-xs ${
                        bin.total_units_stored > 0
                          ? 'border-teal/40 bg-teal-50/20'
                          : 'border-border bg-canvas/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-navy mb-1">
                        <span>{bin.full_location_code}</span>
                        {bin.total_units_stored > 0 && (
                          <span className="text-[10px] bg-teal text-white px-1.5 py-0.2 rounded font-sans">
                            Occupied
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Stored Units:</span>
                        <span className="font-bold tabular-nums text-slate-800">{bin.total_units_stored}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-2">
                {data.products?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No inventory currently slotted in this zone.</p>
                ) : (
                  data.products?.map((prod: any) => (
                    <div key={prod.product_id} className="p-3 border border-border rounded-lg bg-surface text-xs space-y-1">
                      <div className="flex justify-between items-start font-bold text-navy">
                        <span>{prod.product_name}</span>
                        <span className="font-mono tabular-nums text-teal">{prod.units_on_hand} units</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>SKU: {prod.sku}</span>
                        <span>{prod.customer_name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-navy block">Pending Operational Tasks</span>
                {data.pendingTasks?.length === 0 ? (
                  <p className="text-xs text-slate-400">No active tasks in this zone.</p>
                ) : (
                  data.pendingTasks?.map((task: any) => (
                    <div key={task.id} className="p-2.5 border border-border rounded-lg bg-surface text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-navy">
                        <span>{task.task_code} ({task.task_type})</span>
                        <StatusBadge status={task.priority} />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">{task.instructions}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Drawer Action Bar */}
      <div className="p-3 border-t border-border bg-slate-50 flex items-center justify-between gap-2">
        <button
          onClick={() => onRunAgentAnalysis && data?.zone && onRunAgentAnalysis(data.zone.zone_code)}
          className="flex-1 px-3 py-2 bg-navy text-white rounded text-xs font-semibold hover:bg-navy-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal" />
          <span>Analyze This Zone</span>
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border text-slate-700 rounded text-xs font-semibold hover:bg-slate-100 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
