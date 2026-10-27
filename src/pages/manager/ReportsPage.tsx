import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Building, 
  Calendar,
  Layers,
  Boxes
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [generating, setGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Compiled Executive Warehouse Report"
        subtitle="Formal synthesized operational audit statement for Kharghar facility stakeholders."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-navy text-white rounded text-xs font-bold flex items-center gap-1.5 hover:bg-navy-700 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        }
      />

      {/* Formal Printable Document Card */}
      <div className="bg-surface border border-border rounded-lg shadow-card p-8 space-y-6 print:border-none print:shadow-none text-slate-800">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-navy pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-teal rounded flex items-center justify-center text-white font-bold text-xs">P</div>
              <span className="font-extrabold text-navy text-lg tracking-tight">PRISM INTELLIGENCE PLATFORM</span>
            </div>
            <p className="text-xs text-slate-500">
              Facility Node: Plot 42, Sector 19, Kharghar, Navi Mumbai, Maharashtra 410210
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <span className="font-bold text-navy block">AUDIT REPORT #PRISM-2026-10-28</span>
            <span className="text-slate-400">Generated: 28 Oct 2026, 08:30 IST</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wider">1. Executive Summary</h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            The Kharghar electronics distribution hub is currently operating at <strong>64% storage utilization</strong> across 19 physical storage zones (A1 through H2). Available balance integrity is verified at 100% with no unrecorded physical shrinkages reported over the current weekly cycle. The 7 autonomous AI agents are fully operational with 0 unhandled failures.
          </p>
        </div>

        {/* Key Metrics Table */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-navy uppercase tracking-wider">2. Warehouse State & Inventory Balance</h2>
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold border-b border-border">
                <tr>
                  <th className="px-3 py-2">Operational Dimension</th>
                  <th className="px-3 py-2">Authoritative Metric</th>
                  <th className="px-3 py-2">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                <tr>
                  <td className="px-3 py-2 font-sans font-medium">Total On-Hand Inventory Units</td>
                  <td className="px-3 py-2 font-bold text-navy">2,485 units</td>
                  <td className="px-3 py-2 text-teal font-sans font-bold">Within Target Buffer</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-sans font-medium">Usable Storage Volume Utilized</td>
                  <td className="px-3 py-2 font-bold text-navy">2,140 / 4,320 m³ (64%)</td>
                  <td className="px-3 py-2 text-teal font-sans font-bold">Balanced Capacity</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-sans font-medium">Contracted Electronics Clients</td>
                  <td className="px-3 py-2 font-bold text-navy">4 Enterprise Accounts</td>
                  <td className="px-3 py-2 text-slate-700 font-sans font-semibold">Apex, Nexus, Zenith, ElectraCore</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-sans font-medium">Regulatory Certifications Health</td>
                  <td className="px-3 py-2 font-bold text-navy">4 Verified Filings</td>
                  <td className="px-3 py-2 text-amber font-sans font-bold">1 Renewal within 18 Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Manager Sign-off */}
        <div className="pt-8 border-t border-border flex justify-between items-end text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Auditor Verification</span>
            <span className="font-bold text-navy">PRISM Compliance & Analytics Mesh</span>
          </div>
          <div className="text-right">
            <div className="w-40 border-b border-navy mb-1" />
            <span className="font-bold text-navy block">Ayush Parab</span>
            <span className="text-[11px] text-slate-500">Warehouse General Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
};
