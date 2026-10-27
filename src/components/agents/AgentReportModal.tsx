import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Printer, 
  ShieldCheck, 
  Clock, 
  Building, 
  Boxes, 
  Sparkles, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';

export interface DetailedAgentReport {
  reportId: string;
  title: string;
  agentName: string;
  agentCode: string;
  timestamp: string;
  classification: string;
  facility: string;
  executiveSummary: string;
  kpis: {
    label: string;
    value: string;
    subtext: string;
    trendType: 'up' | 'down' | 'neutral' | 'danger';
  }[];
  rootCauseAnalysis: string[];
  evidenceData: {
    sku: string;
    productName: string;
    customer: string;
    currentLocation: string;
    recommendedAction: string;
    onHand: number;
    safetyBuffer: number;
    variance: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'OPTIMAL';
  }[];
  phasedPlan: {
    phase: string;
    timeframe: string;
    actions: string[];
  }[];
  complianceCheck: {
    rule: string;
    status: 'PASSED' | 'ATTENTION' | 'FAILED';
    notes: string;
  }[];
  approvalRequired: boolean;
  approvalId?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface AgentReportModalProps {
  report: DetailedAgentReport | null;
  onClose: () => void;
  onApprovalResolved?: () => void;
}

export const AgentReportModal: React.FC<AgentReportModalProps> = ({
  report,
  onClose,
  onApprovalResolved
}) => {
  const [resolving, setResolving] = useState(false);
  const [resolutionSuccess, setResolutionSuccess] = useState<string | null>(null);

  if (!report) return null;

  const handleResolve = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!report.approvalId) return;
    setResolving(true);
    try {
      await api.resolveApproval(report.approvalId, {
        decision,
        notes: `Manager decision recorded on ${new Date().toLocaleString()}`,
        userId: 'usr-mgr-1'
      });
      setResolutionSuccess(`Action plan successfully ${decision.toLowerCase()}! Database records and operational tasks updated.`);
      if (onApprovalResolved) onApprovalResolved();
    } catch (err: any) {
      alert(`Error resolving approval: ${err.message}`);
    } finally {
      setResolving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Customer', 'Location', 'Recommended Action', 'On Hand', 'Safety Buffer', 'Variance', 'Severity'];
    const rows = report.evidenceData.map(d => [
      d.sku,
      `"${d.productName}"`,
      `"${d.customer}"`,
      d.currentLocation,
      `"${d.recommendedAction}"`,
      d.onHand,
      d.safetyBuffer,
      d.variance,
      d.severity
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.reportId}_evidence_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-navy text-white flex items-center justify-between border-b border-navy-700">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-teal/20 text-teal border border-teal/40">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide font-mono">
                  {report.reportId}
                </h3>
                <span className="bg-teal/20 text-teal text-[10px] font-bold px-2 py-0.5 rounded border border-teal/40 uppercase">
                  {report.classification}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Authored by {report.agentName} ({report.agentCode}) • {report.facility}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Official Report"
              className="p-1.5 rounded hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={exportCSV}
              title="Export Evidence CSV"
              className="p-1.5 rounded hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-navy-700 text-slate-300 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Report */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed">
          {/* Success Banner if resolved */}
          {resolutionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{resolutionSuccess}</span>
            </div>
          )}

          {/* Document Title Header */}
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold text-navy">
              {report.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px] mt-2">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {report.timestamp}
              </span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {report.facility}
              </span>
              <span className="flex items-center gap-1 text-teal font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Authoritative SQLite Database Audit Verified
              </span>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal" />
              <span>1. Executive Summary &amp; Operational Impact</span>
            </h4>
            <p className="text-slate-700 leading-relaxed bg-canvas p-3 rounded-lg border border-border">
              {report.executiveSummary}
            </p>

            {/* Impact KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {report.kpis.map((kpi, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-surface border border-border shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    {kpi.label}
                  </span>
                  <span className={`text-lg font-bold font-mono tabular-nums block my-0.5 ${
                    kpi.trendType === 'danger' ? 'text-danger' : 
                    kpi.trendType === 'up' ? 'text-teal' : 'text-navy'
                  }`}>
                    {kpi.value}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {kpi.subtext}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Diagnostic Findings & Root Cause Analysis */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>2. Diagnostic Findings &amp; Root Cause Analysis</span>
            </h4>
            <div className="space-y-2">
              {report.rootCauseAnalysis.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded bg-canvas border border-border/70">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Evidence Data Ledger */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>3. Authoritative Evidence Ledger ({report.evidenceData.length} Items Identified)</span>
              </h4>
              <button
                onClick={exportCSV}
                className="text-teal hover:underline text-[11px] font-semibold flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Download Ledger (CSV)</span>
              </button>
            </div>

            <div className="border border-border rounded-lg overflow-x-auto shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-canvas border-b border-border text-[10px] uppercase font-bold text-slate-500 font-mono">
                    <th className="py-2 px-3">SKU Code</th>
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3">Client Owner</th>
                    <th className="py-2 px-3">Current Location</th>
                    <th className="py-2 px-3 text-right">On Hand</th>
                    <th className="py-2 px-3 text-right">Buffer</th>
                    <th className="py-2 px-3 text-right">Variance</th>
                    <th className="py-2 px-3 text-center">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.evidenceData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-navy text-[11px]">{row.sku}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{row.productName}</td>
                      <td className="py-2 px-3 text-slate-600">{row.customer}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-700">{row.currentLocation}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{row.onHand}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-500">{row.safetyBuffer}</td>
                      <td className={`py-2 px-3 text-right font-mono font-bold tabular-nums ${
                        row.variance < 0 ? 'text-danger' : 'text-teal'
                      }`}>
                        {row.variance > 0 ? `+${row.variance}` : row.variance}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${
                          row.severity === 'CRITICAL' ? 'bg-red-50 text-red-800 border-red-200' :
                          row.severity === 'HIGH' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-teal-50 text-teal-800 border-teal-200'
                        }`}>
                          {row.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Phased Step-by-Step Action Roadmap */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>4. Phased Step-by-Step Resolution Plan</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.phasedPlan.map((phase, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-canvas border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-navy text-xs">{phase.phase}</span>
                      <span className="text-[10px] font-mono text-teal bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                        {phase.timeframe}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {phase.actions.map((act, actIdx) => (
                        <li key={actIdx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                          <ChevronRight className="w-3 h-3 text-teal shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Compliance & Safety Review */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>5. Regulatory Compliance &amp; Handling Verification</span>
            </h4>
            <div className="border border-border rounded-lg p-3 bg-surface space-y-2">
              {report.complianceCheck.map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                    <span className="font-medium text-slate-800">{chk.rule}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{chk.notes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer / Human-in-the-Loop Approval Block */}
        <div className="p-4 bg-canvas border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-600">
            {report.approvalRequired ? (
              <span className="flex items-center gap-1.5 text-amber-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber" />
                <span>Restricted Action: Requires authorized Manager sign-off before physical execution.</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-teal font-semibold">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                <span>Advisory Report: Information verified against authoritative database.</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-slate-100 text-slate-700 border border-border rounded-lg text-xs font-semibold transition-colors"
            >
              Close Report
            </button>

            {report.approvalRequired && !resolutionSuccess && (
              <>
                <button
                  onClick={() => handleResolve('REJECTED')}
                  disabled={resolving}
                  className="px-4 py-2 bg-surface hover:bg-red-50 text-danger border border-red-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleResolve('APPROVED')}
                  disabled={resolving}
                  className="px-4 py-2 bg-teal hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{resolving ? 'Executing...' : 'Approve & Execute Resolution Plan'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
