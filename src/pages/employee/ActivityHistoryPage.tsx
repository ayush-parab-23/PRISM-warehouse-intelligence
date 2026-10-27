import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePrismWebSocket } from '../../context/WebSocketContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { History, RefreshCw, Boxes, ArrowRight } from 'lucide-react';

export const ActivityHistoryPage: React.FC = () => {
  const { dataVersion } = usePrismWebSocket();
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMovements = async () => {
    setLoading(true);
    try {
      const res = await api.getMovements();
      setMovements(res.movements || []);
    } catch (err) {
      console.error('Failed to load movements history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [dataVersion]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operational Activity History"
        subtitle="Complete chronological audit trail of physical receiving, putaway, picking, and dispatch transactions committed to the authoritative ledger."
        actions={
          <button
            onClick={loadMovements}
            className="px-3 py-1.5 border border-border bg-surface hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        }
      />

      <div className="bg-surface border border-border rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-border font-bold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Movement Type</th>
                <th className="px-4 py-3">SKU & Product</th>
                <th className="px-4 py-3 text-right">Units</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[11px]">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No operational movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200">
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="font-mono text-[10px] text-slate-400 block">{m.sku}</span>
                      <span className="font-bold text-navy">{m.product_name}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-navy tabular-nums">
                      {m.quantity}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-bold">{m.reference_id}</td>
                    <td className="px-4 py-3 text-slate-600 font-sans">{m.performed_by}</td>
                    <td className="px-4 py-3 text-slate-500 font-sans max-w-xs truncate">{m.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
