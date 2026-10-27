import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  Send, 
  Truck, 
  CheckCircle2, 
  Barcode, 
  Building,
  PackageCheck
} from 'lucide-react';

export const DispatchPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [packedOrders, setPackedOrders] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    orderId: '',
    carrier: 'Blue Dart Express',
    trackingNumber: 'BD-XP-881920-IN',
    dockId: 'zone-disp-1'
  });

  const loadPackedOrders = async () => {
    try {
      const res = await api.getOrders();
      const ready = (res.orders || []).filter((o: any) => o.status === 'PACKED_READY' || o.status === 'PICKING');
      setPackedOrders(ready);
      if (ready.length > 0) {
        setForm(prev => ({ ...prev, orderId: ready[0].id }));
      }
    } catch (err) {
      console.error('Failed to load packed orders:', err);
    }
  };

  useEffect(() => {
    loadPackedOrders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderId) return;
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await api.dispatchOrder({
        ...form,
        userId: currentUser.id
      });
      setSuccessMsg(`Dispatch confirmed: Order ${res.orderId} loaded at ${form.dockId}. Tracking: ${form.trackingNumber}`);
      await loadPackedOrders();
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Dispatch Outbound Cargo"
        subtitle="Verify carton seals, scan carrier waybill barcode, assign outbound dock gate, and confirm vehicle departure."
      />

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 text-xs font-medium">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-500 block mb-1">Select Packed Order Consignment *</label>
            <select
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-semibold"
            >
              {packedOrders.length === 0 ? (
                <option value="">No packed orders staged</option>
              ) : (
                packedOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.order_number} ({o.customer_name}) — {o.total_items} items
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Carrier Partner *</label>
            <select
              value={form.carrier}
              onChange={(e) => setForm({ ...form, carrier: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-semibold"
            >
              <option value="Blue Dart Express">Blue Dart Express (Priority Air / Surface)</option>
              <option value="Delhivery Enterprise">Delhivery Enterprise Cargo</option>
              <option value="Speed Post Business">India Post Business Express</option>
              <option value="Dedicated Fleet Delivery">Dedicated Intra-Mumbai Fleet</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Waybill / Airway Bill (AWB) Barcode *</label>
            <input
              type="text"
              required
              value={form.trackingNumber}
              onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-navy font-bold font-mono"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Outbound Departure Dock Gate *</label>
            <select
              value={form.dockId}
              onChange={(e) => setForm({ ...form, dockId: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-semibold"
            >
              <option value="zone-disp-1">Dispatch Dock 1 (Intra-City Express Cargo)</option>
              <option value="zone-disp-2">Dispatch Dock 2 (Interstate Container Gate)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={submitting || packedOrders.length === 0}
            className="px-4 py-2 bg-teal hover:bg-teal-600 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Confirm Outbound Loading & Departure</span>
          </button>
        </div>
      </form>
    </div>
  );
};
