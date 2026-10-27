import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  SearchCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Boxes, 
  Barcode,
  ShieldAlert
} from 'lucide-react';

export const InspectionPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    shipmentId: '',
    productId: '',
    customerId: 'cust-apex',
    quantityReceived: 100,
    quantityAccepted: 98,
    quantityRejected: 0,
    quantityQuarantined: 2,
    conditionGrade: 'GRADE_A_NEW' as any,
    discrepancyReason: '2 units have crushed outer tamper stickers; quarantined for vendor survey.',
    serialNumbersSample: 'SN-X1C-2026-0091, SN-X1C-2026-0092, SN-X1C-2026-0093, SN-X1C-2026-0094'
  });

  useEffect(() => {
    Promise.all([api.getShipments(), api.getProducts()]).then(([shipRes, prodRes]) => {
      setShipments(shipRes.shipments || []);
      setProducts(prodRes.products || []);
      if (shipRes.shipments?.length > 0) {
        setForm(prev => ({
          ...prev,
          shipmentId: shipRes.shipments[0].id,
          customerId: shipRes.shipments[0].customer_id
        }));
      }
      if (prodRes.products?.length > 0) {
        setForm(prev => ({ ...prev, productId: prodRes.products[0].id }));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await api.submitInspection({
        ...form,
        quantityReceived: Number(form.quantityReceived),
        quantityAccepted: Number(form.quantityAccepted),
        quantityRejected: Number(form.quantityRejected),
        quantityQuarantined: Number(form.quantityQuarantined),
        userId: currentUser.id
      });
      setSuccessMsg(`Inspection confirmed: ${res.acceptedUnits} units accepted and staged for putaway. ${res.quarantinedUnits} units routed to Quarantine.`);
    } catch (err: any) {
      alert(`Error submitting inspection: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Quality Inspection & Verification"
        subtitle="Perform physical condition audits, tamper seal tests, IMEI/serial verification, and separate accepted versus quarantined stock."
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
            <label className="text-slate-500 block mb-1">Select Inbound Shipment *</label>
            <select
              value={form.shipmentId}
              onChange={(e) => {
                const s = shipments.find(item => item.id === e.target.value);
                setForm({
                  ...form,
                  shipmentId: e.target.value,
                  customerId: s ? s.customer_id : form.customerId,
                  quantityReceived: s ? s.received_units : form.quantityReceived
                });
              }}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-semibold"
            >
              {shipments.map(s => (
                <option key={s.id} value={s.id}>
                  {s.po_number} ({s.supplier}) — {s.received_units} units
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Product SKU *</label>
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
            <label className="text-slate-500 block mb-1">Condition Grade *</label>
            <select
              value={form.conditionGrade}
              onChange={(e) => setForm({ ...form, conditionGrade: e.target.value as any })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-semibold"
            >
              <option value="GRADE_A_NEW">Grade A: Factory New & Pristine Sealed</option>
              <option value="GRADE_B_MINOR_BOX_WEAR">Grade B: Minor Box Scuff (Contents Pristine)</option>
              <option value="GRADE_C_DAMAGED">Grade C: Transit Impact / Crushed Outer</option>
              <option value="FAIL_UNSEALED">Fail: Broken Tamper Seal / Void Detected</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Total Inspected Units *</label>
            <input
              type="number"
              value={form.quantityReceived}
              onChange={(e) => setForm({ ...form, quantityReceived: Number(e.target.value) })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Quantity Accepted (Passed QC) *</label>
            <input
              type="number"
              value={form.quantityAccepted}
              onChange={(e) => setForm({ ...form, quantityAccepted: Number(e.target.value) })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-teal font-bold font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Quantity Quarantined / Rejected</label>
            <input
              type="number"
              value={form.quantityQuarantined}
              onChange={(e) => setForm({ ...form, quantityQuarantined: Number(e.target.value) })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-danger font-bold font-mono tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-500 block mb-1">Sample Serial / IMEI Numbers Captured</label>
          <textarea
            rows={2}
            value={form.serialNumbersSample}
            onChange={(e) => setForm({ ...form, serialNumbersSample: e.target.value })}
            className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-mono text-[11px]"
            placeholder="Scan or enter sample serial barcodes..."
          />
        </div>

        <div>
          <label className="text-slate-500 block mb-1">Discrepancy / Damage Notes</label>
          <textarea
            rows={2}
            value={form.discrepancyReason}
            onChange={(e) => setForm({ ...form, discrepancyReason: e.target.value })}
            className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800"
          />
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-teal hover:bg-teal-600 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors shadow-xs"
          >
            <SearchCheck className="w-3.5 h-3.5" />
            <span>Submit QC Verification</span>
          </button>
        </div>
      </form>
    </div>
  );
};
