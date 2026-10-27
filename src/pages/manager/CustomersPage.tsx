import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Building2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Layers, 
  Boxes, 
  Truck,
  CheckCircle2
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCustomers()
      .then(res => setCustomers(res.customers || []))
      .catch(err => console.error('Failed to load customers:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Electronics Customer Portfolios"
        subtitle="Manage the 4 contracted electronics customer enterprises, dedicated storage quotas, SLA tiers, and fulfillment commitments."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-lg shadow-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-400 block">{c.code}</span>
                  <h3 className="text-base font-bold text-navy">{c.name}</h3>
                  <p className="text-xs text-teal font-semibold mt-0.5">{c.industry}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-navy-50 text-navy font-bold text-[10px] uppercase tracking-wider border border-navy-100">
                  {c.sla_tier}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed bg-canvas p-2.5 rounded border border-border mb-3">
                {c.notes}
              </p>

              {/* Storage Capacity Gauge */}
              <div className="space-y-1.5 p-3 rounded bg-slate-50 border border-border text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Contracted Storage Quota:</span>
                  <span className="font-mono font-bold text-navy tabular-nums">
                    {c.used_storage_m3} / {c.allocated_storage_m3} m³ ({c.storage_utilization_pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      Number(c.storage_utilization_pct) > 85 ? 'bg-danger' : 'bg-teal'
                    }`}
                    style={{ width: `${Math.min(Number(c.storage_utilization_pct) || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metrics & Contacts Strip */}
            <div className="pt-3 border-t border-border space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Boxes className="w-3.5 h-3.5 text-teal shrink-0" />
                  <span><strong>{c.total_products}</strong> Active SKUs</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Truck className="w-3.5 h-3.5 text-navy shrink-0" />
                  <span><strong>{c.active_orders_count}</strong> Active Orders</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{c.contact_email}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{c.contact_phone}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
