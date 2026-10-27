import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  MoveRight, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Boxes, 
  ShieldCheck,
  Building
} from 'lucide-react';

export const PutawayPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [suggestedBin, setSuggestedBin] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    productId: '',
    customerId: 'cust-apex',
    sourceBinId: 'bin-a1-1-1-1',
    destBinId: 'bin-a2-1-1-1',
    quantity: 15
  });

  useEffect(() => {
    Promise.all([api.getProducts(), api.getZones()]).then(([prodRes, zonesRes]) => {
      const prods = prodRes.products || [];
      setProducts(prods);
      setZones(zonesRes.zones || []);
      if (prods.length > 0) {
        setSelectedProduct(prods[0]);
        setForm(prev => ({
          ...prev,
          productId: prods[0].id,
          customerId: prods[0].customer_id
        }));
      }
    });
  }, []);

  const handleProductChange = (prodId: string) => {
    const p = products.find(item => item.id === prodId);
    if (p) {
      setSelectedProduct(p);
      setForm(prev => ({
        ...prev,
        productId: p.id,
        customerId: p.customer_id
      }));

      // Simulate Storage Agent recommendation logic
      if (p.preferred_zone_id === 'zone-f1') {
        setSuggestedBin({ code: 'F1-R01-S01-B01', reason: 'High-Value Vault storage required for Flagship SKU' });
      } else if (p.category.includes('Smartphone')) {
        setSuggestedBin({ code: 'B2-R01-S01-B01', reason: 'Modular padded rack with 24/7 CCTV surveillance' });
      } else {
        setSuggestedBin({ code: 'A2-R01-S01-B01', reason: 'Optimal fast-pick face closest to Packing Area 1' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await api.putawayStock({
        productId: form.productId,
        customerId: form.customerId,
        sourceBinId: form.sourceBinId,
        destBinId: form.destBinId,
        quantity: Number(form.quantity),
        userId: currentUser.id
      });
      setSuccessMsg(`Putaway complete: ${form.quantity} units successfully transferred to ${form.destBinId}. Transaction logged.`);
    } catch (err: any) {
      alert(`Putaway failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Putaway Stock"
        subtitle="Transfer inspected electronics from Inbound Verification to designated high-density racks and secure storage bins."
      />

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Storage Optimization Agent Banner */}
      {suggestedBin && (
        <div className="p-3.5 rounded-lg border border-teal/40 bg-teal-50/20 text-xs flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-teal shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-navy text-xs block">
              Storage Optimization Agent Slotting Recommendation
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Recommended Target Bin: <strong className="font-mono text-teal font-bold">{suggestedBin.code}</strong> — {suggestedBin.reason}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 text-xs font-medium">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-500 block mb-1">Select Inspected Product SKU *</label>
            <select
              value={form.productId}
              onChange={(e) => handleProductChange(e.target.value)}
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
            <label className="text-slate-500 block mb-1">Quantity to Putaway *</label>
            <input
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-teal font-bold font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Source Staging Location *</label>
            <input
              type="text"
              required
              value={form.sourceBinId}
              onChange={(e) => setForm({ ...form, sourceBinId: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Target Storage Bin Location *</label>
            <input
              type="text"
              required
              value={form.destBinId}
              onChange={(e) => setForm({ ...form, destBinId: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-navy font-bold font-mono"
            />
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-teal hover:bg-teal-600 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors shadow-xs"
          >
            <MoveRight className="w-3.5 h-3.5" />
            <span>Confirm Bin Putaway</span>
          </button>
        </div>
      </form>
    </div>
  );
};
