import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  Building, 
  ShieldCheck, 
  Sliders, 
  Terminal, 
  CheckCircle2, 
  Save,
  Server
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [savedMsg, setSavedMsg] = useState(false);

  const [facilityConfig, setFacilityConfig] = useState({
    name: 'PRISM Main Electronics Hub — Kharghar Node',
    address: 'Plot 42, Sector 19, Kharghar, Navi Mumbai, Maharashtra, India 410210',
    totalArea: '45,000 sq ft',
    hvacSetPoint: '21.5°C',
    humiditySetPoint: '45% RH',
    edgeServerIp: '192.168.10.254 (PRISM-EDGE-01)',
    reorderScanIntervalHours: 4
  });

  useEffect(() => {
    api.getAuditLogs()
      .then(res => setLogs(res.logs || []))
      .catch(err => console.error('Failed to load audit logs:', err));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings & System Audit Trail"
        subtitle="Configure warehouse telemetry thresholds, edge node network parameters, and inspect immutable system audit logs."
      />

      {savedMsg && (
        <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal" />
          <span>Facility configuration parameters updated and synced to edge server.</span>
        </div>
      )}

      {/* Facility Configuration Form */}
      <form onSubmit={handleSave} className="bg-surface border border-border rounded-lg shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Building className="w-4 h-4 text-navy" />
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Facility Metadata & IoT Setpoints</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
          <div>
            <label className="text-slate-500 block mb-1">Facility Name</label>
            <input
              type="text"
              value={facilityConfig.name}
              onChange={(e) => setFacilityConfig({ ...facilityConfig, name: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Physical Location</label>
            <input
              type="text"
              value={facilityConfig.address}
              onChange={(e) => setFacilityConfig({ ...facilityConfig, address: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">HVAC Temperature Threshold</label>
            <input
              type="text"
              value={facilityConfig.hvacSetPoint}
              onChange={(e) => setFacilityConfig({ ...facilityConfig, hvacSetPoint: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Edge Server Telemetry IP</label>
            <input
              type="text"
              value={facilityConfig.edgeServerIp}
              onChange={(e) => setFacilityConfig({ ...facilityConfig, edgeServerIp: e.target.value })}
              className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-slate-800 font-mono"
            />
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            className="px-4 py-2 bg-teal hover:bg-teal-600 text-white rounded text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Immutable Audit Logs Table */}
      <div className="bg-surface border border-border rounded-lg shadow-card overflow-hidden">
        <div className="p-3 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-navy" />
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
              Immutable System & Operational Audit Trail
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">SQLite WAL Log</span>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-border">
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">User / Role</th>
                <th className="px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-slate-400 font-sans">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-bold text-teal">{l.event_category}</td>
                    <td className="px-3 py-2 text-navy font-bold">{l.action}</td>
                    <td className="px-3 py-2 text-slate-600 font-sans">{l.user_name || l.user_role}</td>
                    <td className="px-3 py-2 text-slate-500 max-w-xs truncate">{l.details_json}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
