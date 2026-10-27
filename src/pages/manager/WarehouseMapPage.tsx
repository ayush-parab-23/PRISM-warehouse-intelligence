import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { usePrismWebSocket } from '../../context/WebSocketContext';
import { PageHeader } from '../../components/common/PageHeader';
import { WarehouseMap } from '../../components/warehouse/WarehouseMap';
import { ZoneDetailDrawer } from '../../components/warehouse/ZoneDetailDrawer';
import { IsometricWarehouseDiagram } from '../../components/warehouse/IsometricWarehouseDiagram';
import { AgentReportModal, type DetailedAgentReport } from '../../components/agents/AgentReportModal';
import { ReportGenerator } from '../../services/reportGenerator';
import { 
  Map, 
  Search, 
  Filter, 
  Layers, 
  Sparkles, 
  RefreshCw,
  Building2,
  Boxes,
  FileText,
  Eye,
  Grid
} from 'lucide-react';

export const WarehouseMapPage: React.FC = () => {
  const { dataVersion } = usePrismWebSocket();
  const [zones, setZones] = useState<any[]>([]);
  const [overlays, setOverlays] = useState<any>({});
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'ISOMETRIC' | 'TOP_DOWN'>('ISOMETRIC');
  const [activeReport, setActiveReport] = useState<DetailedAgentReport | null>(null);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [zonesRes, overlaysRes] = await Promise.all([
        api.getZones(),
        api.getOverlays()
      ]);
      setZones(zonesRes.zones || []);
      setOverlays(overlaysRes || {});
    } catch (err) {
      console.error('Failed to load warehouse map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [dataVersion]);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZoneId(zoneId);
  };

  const handleRunAgentAnalysis = async (zoneCode: string) => {
    try {
      await api.submitAgentCommand({
        agentId: 'agent-storage',
        commandType: 'ZONE_ANALYSIS',
        userPrompt: `Perform capacity and slotting optimization audit for Zone ${zoneCode} in Kharghar node.`,
        userId: 'usr-mgr-1'
      });
      setActiveReport(ReportGenerator.getReportForAgent('STR-03'));
    } catch (err: any) {
      alert(`Analysis failed: ${err.message}`);
    }
  };

  // Compute summary metrics for top strip
  const storageZones = zones.filter(z => z.type === 'STORAGE');
  const operationalZones = zones.filter(z => z.type === 'OPERATIONAL');
  const avgUtilization = storageZones.length > 0
    ? Math.round(storageZones.reduce((acc, z) => acc + (Number(z.utilization_pct) || 0), 0) / storageZones.length)
    : 0;
  const congestedZonesCount = storageZones.filter(z => Number(z.utilization_pct) > 75).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Interactive Warehouse Digital Twin"
        subtitle="High-density architectural model of Kharghar electronics distribution facility. Switch between 3D Isometric perspective and 2D CAD floor plan."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveReport(ReportGenerator.getReportForAgent('STR-03'))}
              className="px-3 py-1.5 bg-navy hover:bg-navy-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-teal" />
              <span>Executive Space Audit Report</span>
            </button>
            <button
              onClick={loadMapData}
              className="px-3 py-1.5 border border-border bg-surface hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal' : ''}`} />
              <span>Sync Map State</span>
            </button>
          </div>
        }
      />

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Storage Zones (A1 - H2)</span>
          <span className="text-xl font-bold text-navy font-mono tabular-nums">{storageZones.length} Zones</span>
          <span className="text-[10px] text-teal block mt-0.5">High-bay &amp; modular racks</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Operational &amp; Docks</span>
          <span className="text-xl font-bold text-navy font-mono tabular-nums">{operationalZones.length} Areas</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Inbound &amp; QC verification</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Average Capacity Used</span>
          <span className="text-xl font-bold text-navy font-mono tabular-nums">{avgUtilization}%</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Cubic volume metric</span>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg shadow-card">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">High Congestion</span>
          <span className={`text-xl font-bold font-mono tabular-nums ${congestedZonesCount > 0 ? 'text-amber' : 'text-teal'}`}>
            {congestedZonesCount} Zones
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">&gt; 75% utilized</span>
        </div>
      </div>

      {/* View Mode Toggle & Search Bar */}
      <div className="bg-surface p-3 rounded-lg border border-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-border w-full sm:w-auto">
          <button
            onClick={() => setViewMode('ISOMETRIC')}
            className={`px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all ${
              viewMode === 'ISOMETRIC'
                ? 'bg-navy text-white shadow-xs'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal" />
            <span>3D Isometric Overview</span>
          </button>
          <button
            onClick={() => setViewMode('TOP_DOWN')}
            className={`px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all ${
              viewMode === 'TOP_DOWN'
                ? 'bg-navy text-white shadow-xs'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-teal" />
            <span>2D Technical CAD Layout</span>
          </button>
        </div>

        {/* Filter and Search Input */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search zones, SKUs, or customer racks..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded bg-canvas focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal font-medium"
          />
        </div>
      </div>

      {/* Conditional Rendering of Map View: 3D Isometric or 2D Top-Down */}
      {viewMode === 'ISOMETRIC' ? (
        <IsometricWarehouseDiagram
          onOpenReport={(code) => setActiveReport(ReportGenerator.getReportForAgent(code))}
          onSelectZone={(zoneId) => handleZoneSelect(zoneId)}
        />
      ) : (
        <WarehouseMap
          zones={zones}
          overlays={overlays}
          selectedZoneId={selectedZoneId}
          onSelectZone={handleZoneSelect}
          searchFilter={searchFilter}
        />
      )}

      {/* Contextual Zone Detail Drawer */}
      <ZoneDetailDrawer
        zoneId={selectedZoneId}
        onClose={() => setSelectedZoneId(null)}
        onRunAgentAnalysis={handleRunAgentAnalysis}
      />

      {/* Executive Space Audit Report Modal */}
      {activeReport && (
        <AgentReportModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
          onApprovalResolved={() => loadMapData()}
        />
      )}
    </div>
  );
};
