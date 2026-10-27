import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  Barcode, 
  Search,
  Boxes
} from 'lucide-react';

export const StockCountPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    binId: 'bin-c3-1-1-1',
    productId: 'prod-12',
    countedQuantity: 28,
    notes: 'Physical count verified across shelf tier 1.'
  });

  useEffect(() => {
    api.getProducts().then(res => setProducts(res.products || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessResult(null);
    try {
      const res = await api.submitStockCount({
        ...form,
        countedQuantity: Number(form.countedQuantity),
        userId: currentUser.id
      });
      setSuccessResult(res);
    } catch (err: any) {
      alert(`Error submitting count: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Physical Cycle Stock Count"
        subtitle="Perform blind cycle counts for assigned storage racks and bin locations to maintain authoritative ledger accuracy."
      />

      {successResult && (
        <div className={`p-4 rounded-lg border text-xs ${
          successResult.reconciled 
            ? 'bg-teal-50 border-teal-200 text-teal-800' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            {successResult.reconciled ? <CheckCircle2 className="w-4 h-4 text-teal" /> : <AlertTriangle className="w-4 h-4 text-amber" />}
            <span>{successResult.reconciled ? 'Count Reconciled Perfectly' : 'Inventory Variance Recorded'}</span>
          </div>
          <p>
            Expected in Ledger: <strong className="font-mono">{successResult.expectedQuantity}</strong> | Physical Count: <strong className="font-mono">{successResult.countedQuantity}</strong> | Variance: <strong className="font-mono">{successResult.variance} units</strong>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 text-xs font-medium">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-500 block mb-1">Location Bin Code *</label>
            <input
              type="text"
              required
              value={form.binId}
              onChange={(e) => setForm({ ...form, binId: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-navy font-bold font-mono"
              placeholder="e.g. bin-c3-1-1-1"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Target Electronics SKU *</label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-semibold"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Physical Units Counted *</label>
            <input
              type="number"
              min="0"
              required
              value={form.countedQuantity}
              onChange={(e) => setForm({ ...form, countedQuantity: Number(e.target.value) })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-navy font-bold font-mono text-base tabular-nums"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Auditing Employee Badge</label>
            <input
              type="text"
              disabled
              value={`${currentUser.full_name} (${currentUser.badge_number})`}
              className="w-full p-2 border border-border rounded bg-slate-100 text-slate-600 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-500 block mb-1">Cycle Count Inspection Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800"
          />
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-teal hover:bg-teal-600 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors shadow-xs"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Submit Count for Reconciliation</span>
          </button>
        </div>
      </form>
    </div>
  );
};
