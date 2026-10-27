import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck, 
  Clock, 
  Calendar,
  Building,
  RefreshCw
} from 'lucide-react';

export const CompliancePage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [auditSummary, setAuditSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const res = await api.getCompliance();
      setRecords(res.records || []);
      setAuditSummary(res.auditSummary || null);
    } catch (err) {
      console.error('Failed to load compliance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompliance();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Regulatory Compliance & Certifications"
        subtitle="Mandatory Bureau of Indian Standards (BIS) filings, UN 38.3 lithium battery transport safety SOPs, and MPCB e-waste authorizations."
        actions={
          <button
            onClick={loadCompliance}
            className="px-3 py-1.5 border border-border bg-surface hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal' : ''}`} />
            <span>Audit Check</span>
          </button>
        }
      />

      {/* Summary Audit Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total Certifications</span>
          <span className="text-xl font-bold text-navy font-mono tabular-nums">{auditSummary?.totalRecords || 0}</span>
          <span className="text-[10px] text-teal block mt-0.5">Under active monitoring</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Valid Documents</span>
          <span className="text-xl font-bold text-teal font-mono tabular-nums">{auditSummary?.validRecords || 0}</span>
          <span className="text-[10px] text-teal block mt-0.5">Compliant SLA status</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Expiring Within 30d</span>
          <span className="text-xl font-bold text-amber font-mono tabular-nums">{auditSummary?.warningRecords || 0}</span>
          <span className="text-[10px] text-amber block mt-0.5">Renewal action flagged</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Expired Violations</span>
          <span className="text-xl font-bold text-slate-400 font-mono tabular-nums">{auditSummary?.expiredRecords || 0}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Zero tolerance threshold</span>
        </div>
      </div>

      {/* Compliance Records Table */}
      <div className="bg-surface border border-border rounded-lg shadow-card overflow-hidden">
        <div className="p-3 border-b border-border bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
            Mandatory Electronics Regulatory Registry
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Auditor: {auditSummary?.auditor || 'Compliance Agent (CMP-07)'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-border font-bold">
              <tr>
                <th className="px-4 py-3">Document Title & Number</th>
                <th className="px-4 py-3">Customer Entity</th>
                <th className="px-4 py-3">Regulatory Body</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Audit Verification Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-navy block text-xs">{r.title}</span>
                    <span className="font-mono text-[10px] text-teal font-bold">{r.document_number}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.customer_name}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{r.issuing_authority}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-700">{r.expiry_date}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-[11px] max-w-xs">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
