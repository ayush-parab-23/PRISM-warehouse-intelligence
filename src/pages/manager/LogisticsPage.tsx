import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePrismWebSocket } from '../../context/WebSocketContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Truck, 
  ArrowDownToLine, 
  Send, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Building
} from 'lucide-react';

export const LogisticsPage: React.FC = () => {
  const { dataVersion } = usePrismWebSocket();
  const [shipments, setShipments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound'>('inbound');
  const [loading, setLoading] = useState(true);

  const loadLogistics = async () => {
    setLoading(true);
    try {
      const [shipRes, ordRes] = await Promise.all([
        api.getShipments(),
        api.getOrders()
      ]);
      setShipments(shipRes.shipments || []);
      setOrders(ordRes.orders || []);
    } catch (err) {
      console.error('Failed to load logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogistics();
  }, [dataVersion]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inbound & Outbound Logistics"
        subtitle="Dock scheduling, shipment intake, quality inspection dwell times, and outbound customer dispatch carrier manifests."
        actions={
          <button
            onClick={loadLogistics}
            className="px-3 py-1.5 border border-border bg-surface hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal' : ''}`} />
            <span>Refresh Docks</span>
          </button>
        }
      />

      {/* Dock Bay Status Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px] mb-1">
            <span>Receiving Dock 1</span>
            <span className="w-2 h-2 rounded-full bg-teal" />
          </div>
          <span className="font-bold text-navy text-xs block">Active Unloading</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Logitech Far East (PO-042)</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px] mb-1">
            <span>Receiving Dock 2</span>
            <span className="w-2 h-2 rounded-full bg-teal" />
          </div>
          <span className="font-bold text-navy text-xs block">QC Staging Clean</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Next ETA: 16:30 Anker Innovations</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px] mb-1">
            <span>Dispatch Dock 1</span>
            <span className="w-2 h-2 rounded-full bg-navy" />
          </div>
          <span className="font-bold text-navy text-xs block">Vehicle Boarding</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Blue Dart Express (SO-APX-9821)</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px] mb-1">
            <span>Dispatch Dock 2</span>
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
          <span className="font-bold text-navy text-xs block">Staging Reserve</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Bhiwandi Courier wave ready</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-surface rounded-t-lg px-4 pt-1 text-xs">
        <button
          onClick={() => setActiveTab('inbound')}
          className={`py-3 px-4 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'inbound' ? 'border-teal text-teal' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Inbound Shipments ({shipments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('outbound')}
          className={`py-3 px-4 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'outbound' ? 'border-teal text-teal' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Outbound Orders ({orders.length})</span>
        </button>
      </div>

      {/* Tables Content */}
      <div className="bg-surface border border-border border-t-0 rounded-b-lg shadow-card overflow-hidden">
        {activeTab === 'inbound' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-border font-bold">
                <tr>
                  <th className="px-4 py-3">PO & Tracking Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Customer Company</th>
                  <th className="px-4 py-3">Dock Assigned</th>
                  <th className="px-4 py-3">Carrier</th>
                  <th className="px-4 py-3 text-right">Units Expected</th>
                  <th className="px-4 py-3 text-right">Units Received</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Arrival Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-navy block">{s.po_number}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{s.tracking_number || 'Direct Truck'}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{s.supplier}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{s.customer_name}</td>
                    <td className="px-4 py-3 font-mono text-teal font-bold">{s.dock_name}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{s.carrier}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{s.expected_units}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-navy">{s.received_units}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {s.arrived_at ? new Date(s.arrived_at).toLocaleString() : s.eta || 'Scheduled'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-border font-bold">
                <tr>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Customer Company</th>
                  <th className="px-4 py-3">Destination Delivery Point</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assigned Dock</th>
                  <th className="px-4 py-3">Carrier Service</th>
                  <th className="px-4 py-3 text-right">Total Items</th>
                  <th className="px-4 py-3 text-center">Fulfillment Status</th>
                  <th className="px-4 py-3">Due Delivery Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-navy">{o.order_number}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{o.customer_name}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium max-w-xs truncate">{o.destination}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.priority} />
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">{o.dock_id ? 'Dock 1' : 'Staging Area'}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{o.carrier || 'Pending Carrier Assign'}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-navy">{o.total_items}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {new Date(o.due_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
