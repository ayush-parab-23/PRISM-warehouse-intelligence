import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  ArrowDownToLine, 
  CheckCircle2, 
  Truck, 
  Building, 
  Boxes, 
  AlertCircle 
} from 'lucide-react';

export const ReceiveGoodsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    poNumber: 'PO-APX-2026-102',
    supplier: 'Lenovo Global Supply (Shenzhen)',
    customerId: 'cust-apex',
    dockId: 'zone-recv-1',
    carrier: 'Blue Dart Surface',
    trackingNumber: 'BD-EXP-88912',
    expectedUnits: 150,
    receivedUnits: 150,
    notes: 'Outer cartons sealed in tamper tape. No visible pallet damage.'
  });

  useEffect(() => {
    api.getCustomers().then(res => setCustomers(res.customers || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await api.receiveGoods({
        ...form,
        expectedUnits: Number(form.expectedUnits),
        receivedUnits: Number(form.receivedUnits),
        userId: currentUser.id
      });
      setSuccessMsg(res.message || 'Goods received successfully. Inbound QC inspection task created.');
    } catch (err: any) {
      alert(`Error receiving shipment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Receive Inbound Goods"
        subtitle="Log trailer unloading at Receiving Docks 1 & 2. Tally manifest units and initialize QC verification."
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
            <label className="text-slate-500 block mb-1">Purchase Order (PO) Number *</label>
            <input
              type="text"
              required
              value={form.poNumber}
              onChange={(e) => setForm({ ...form, poNumber: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Supplier / Origin Facility *</label>
            <input
              type="text"
              required
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Customer Client Company *</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-semibold"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Inbound Receiving Dock *</label>
            <select
              value={form.dockId}
              onChange={(e) => setForm({ ...form, dockId: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-semibold"
            >
              <option value="zone-recv-1">Receiving Dock 1 (Heavy Trailer Bay)</option>
              <option value="zone-recv-2">Receiving Dock 2 (Express Courier Gate)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Freight Carrier *</label>
            <input
              type="text"
              required
              value={form.carrier}
              onChange={(e) => setForm({ ...form, carrier: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Waybill / Tracking Reference</label>
            <input
              type="text"
              value={form.trackingNumber}
              onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Expected Manifest Quantity *</label>
            <input
              type="number"
              required
              value={form.expectedUnits}
              onChange={(e) => setForm({ ...form, expectedUnits: Number(e.target.value) })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Actual Unloaded Quantity *</label>
            <input
              type="number"
              required
              value={form.receivedUnits}
              onChange={(e) => setForm({ ...form, receivedUnits: Number(e.target.value) })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-mono tabular-nums font-bold text-teal"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-500 block mb-1">Cargo Condition & Packaging Inspection Notes</label>
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
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Confirm Inbound Receipt</span>
          </button>
        </div>
      </form>
    </div>
  );
};
