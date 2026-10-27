import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  PackageCheck, 
  CheckCircle2, 
  Boxes, 
  Barcode, 
  Truck,
  Layers
} from 'lucide-react';

export const PickPackPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [orderLines, setOrderLines] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [cartonCount, setCartonCount] = useState(2);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      setOrders(res.orders || []);
      setOrderLines(res.lines || []);
      if (res.orders?.length > 0 && !selectedOrder) {
        setSelectedOrder(res.orders[0]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handlePickLine = async (lineId: string, prodId: string, qty: number) => {
    if (!selectedOrder) return;
    try {
      await api.pickStock({
        orderId: selectedOrder.id,
        orderLineId: lineId,
        productId: prodId,
        binId: 'bin-a2-1-1-1',
        quantityPicked: qty,
        userId: currentUser.id
      });
      setSuccessMsg(`Picked ${qty} units successfully into tote T-12.`);
      await loadOrders();
    } catch (err: any) {
      alert(`Pick error: ${err.message}`);
    }
  };

  const handlePackOrder = async () => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      await api.packOrder({
        orderId: selectedOrder.id,
        userId: currentUser.id,
        cartonCount: Number(cartonCount),
        notes: 'Tamper tape and ESD bubble wrap secured.'
      });
      setSuccessMsg(`Order ${selectedOrder.order_number} successfully packed and consolidated. Ready for Dispatch.`);
      await loadOrders();
    } catch (err: any) {
      alert(`Packing error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const activeLines = orderLines.filter(l => l.order_id === selectedOrder?.id);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pick & Pack Operations"
        subtitle="Execute wave pick tote lists, verify item barcodes, and consolidate orders into shipping cartons."
      />

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Orders Queue List */}
        <div className="bg-surface border border-border rounded-lg shadow-card p-4 space-y-3">
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
            Active Wave Orders ({orders.length})
          </h3>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedOrder?.id === o.id
                    ? 'border-teal bg-teal-50/20 shadow-xs'
                    : 'border-border bg-canvas hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-navy">{o.order_number}</span>
                  <StatusBadge status={o.priority} />
                </div>
                <p className="font-bold text-slate-800 truncate">{o.customer_name}</p>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Status: <strong className="text-teal capitalize">{o.status.replace('_', ' ')}</strong></span>
                  <span className="font-mono tabular-nums">{o.total_items} items</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Order Lines & Picking Action */}
        <div className="bg-surface border border-border rounded-lg shadow-card p-4 lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-teal block">{selectedOrder?.order_number}</span>
                <h3 className="text-sm font-bold text-navy">{selectedOrder?.customer_name}</h3>
                <p className="text-[11px] text-slate-500">{selectedOrder?.destination}</p>
              </div>
              <StatusBadge status={selectedOrder?.status || 'PENDING'} />
            </div>

            {/* Line items list */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-navy block uppercase tracking-wider text-[10px]">
                Order Line Items to Pick:
              </span>

              {activeLines.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded">
                  No line items found for this order.
                </div>
              ) : (
                activeLines.map((line) => (
                  <div 
                    key={line.id} 
                    className="p-3 rounded-lg border border-border bg-canvas text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-navy text-[11px]">{line.sku}</span>
                        <StatusBadge status={line.status} />
                      </div>
                      <p className="font-bold text-slate-800 mt-0.5">{line.product_name}</p>
                      <span className="text-[11px] text-slate-500">Pick Face: Zone A2, Rack 1</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-[11px]">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Qty</span>
                        <span className="font-mono font-bold text-navy tabular-nums">{line.quantity_requested} units</span>
                      </div>
                      {line.status === 'PENDING' && (
                        <button
                          onClick={() => handlePickLine(line.id, line.product_id, line.quantity_requested)}
                          className="px-3 py-1.5 bg-navy hover:bg-navy-700 text-white rounded text-xs font-bold transition-colors shadow-xs"
                        >
                          Confirm Pick
                        </button>
                      )}
                      {line.status === 'PICKED' && (
                        <span className="text-teal text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Picked
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Packing Action Strip */}
          <div className="pt-4 border-t border-border bg-slate-50/50 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-600 font-bold">Shipping Cartons:</label>
              <input
                type="number"
                min="1"
                value={cartonCount}
                onChange={(e) => setCartonCount(Number(e.target.value))}
                className="w-16 p-1 border border-border rounded bg-white text-center font-mono font-bold text-navy"
              />
            </div>
            <button
              onClick={handlePackOrder}
              disabled={submitting || selectedOrder?.status === 'PACKED_READY' || selectedOrder?.status === 'DISPATCHED'}
              className="w-full sm:w-auto px-4 py-2 bg-teal hover:bg-teal-600 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{selectedOrder?.status === 'PACKED_READY' ? 'Order Packed' : 'Consolidate & Complete Pack'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
