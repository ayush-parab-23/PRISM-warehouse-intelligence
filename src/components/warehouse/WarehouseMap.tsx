import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  AlertTriangle, 
  Sparkles, 
  Truck, 
  ShieldAlert, 
  Users,
  Search,
  Filter
} from 'lucide-react';

export type OverlayType = 'NONE' | 'CAPACITY' | 'LOW_STOCK' | 'STORAGE_OPTIMIZATION' | 'BOTTLENECK' | 'QUARANTINE' | 'EMPLOYEE_DENSITY';

interface WarehouseMapProps {
  zones: any[];
  overlays: any;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  searchFilter?: string;
  categoryFilter?: string;
}

export const WarehouseMap: React.FC<WarehouseMapProps> = ({
  zones,
  overlays,
  selectedZoneId,
  onSelectZone,
  searchFilter = '',
  categoryFilter = 'All'
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>('NONE');
  const [hoveredZone, setHoveredZone] = useState<any | null>(null);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.75), 2.0));
  };

  const handleReset = () => {
    setZoomLevel(1);
  };

  const getZoneFillColor = (zone: any) => {
    if (activeOverlay === 'CAPACITY') {
      const pct = Number(zone.utilization_pct || 0);
      if (pct > 80) return '#FCA5A5'; // Soft red
      if (pct > 60) return '#FDE68A'; // Soft amber
      return '#A7F3D0'; // Soft green
    }

    if (activeOverlay === 'QUARANTINE' && (zone.id === 'zone-quarantine' || zone.id === 'zone-h2')) {
      return '#FECACA';
    }

    // Default by zone type
    switch (zone.type) {
      case 'OPERATIONAL':
        return '#E6F6F4'; // Subtle teal
      case 'STORAGE':
        if (zone.restricted_access === 1) return '#FEF2F2'; // Subtle red vault
        return '#F1F5F9'; // Subtle slate
      case 'FULFILLMENT':
        return '#EEF2FF'; // Subtle indigo
      case 'SUPPORT':
      default:
        return '#F8FAFC'; // Neutral light slate
    }
  };

  const getZoneStrokeColor = (zone: any) => {
    if (selectedZoneId === zone.id || selectedZoneId === zone.zone_code) {
      return '#0F8276'; // Brand teal bold highlight
    }
    if (activeOverlay === 'BOTTLENECK' && overlays?.bottleneckZones?.includes(zone.id)) {
      return '#C44D4D';
    }
    if (activeOverlay === 'STORAGE_OPTIMIZATION' && overlays?.optimizationZones?.includes(zone.id)) {
      return '#0F8276';
    }
    return '#CBD5E1'; // Crisp border
  };

  const isMatchedByFilter = (zone: any) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      zone.name.toLowerCase().includes(q) ||
      zone.zone_code.toLowerCase().includes(q) ||
      zone.purpose.toLowerCase().includes(q)
    );
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card p-4 space-y-3">
      {/* Map Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border text-xs">
        {/* Overlays Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Overlays:
          </span>
          <button
            onClick={() => setActiveOverlay('NONE')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              activeOverlay === 'NONE' ? 'bg-navy text-white font-bold' : 'bg-canvas text-slate-600 hover:bg-slate-100'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setActiveOverlay('CAPACITY')}
            className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              activeOverlay === 'CAPACITY' ? 'bg-navy text-white font-bold' : 'bg-canvas text-slate-600 hover:bg-slate-100'
            }`}
          >
            Capacity Heatmap
          </button>
          <button
            onClick={() => setActiveOverlay('LOW_STOCK')}
            className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              activeOverlay === 'LOW_STOCK' ? 'bg-amber text-white font-bold' : 'bg-canvas text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" /> Low-Stock Risk
          </button>
          <button
            onClick={() => setActiveOverlay('STORAGE_OPTIMIZATION')}
            className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              activeOverlay === 'STORAGE_OPTIMIZATION' ? 'bg-teal text-white font-bold' : 'bg-canvas text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3 h-3 text-teal-500" /> AI Optimization
          </button>
          <button
            onClick={() => setActiveOverlay('BOTTLENECK')}
            className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              activeOverlay === 'BOTTLENECK' ? 'bg-danger text-white font-bold' : 'bg-canvas text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3 h-3 text-danger" /> Dock Queues
          </button>
        </div>

        {/* Zoom & Reset Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoom(0.15)}
            className="p-1.5 border border-border rounded bg-surface hover:bg-canvas text-slate-600"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-1.5 border border-border rounded bg-surface hover:bg-canvas text-slate-600"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 border border-border rounded bg-surface hover:bg-canvas text-slate-600 flex items-center gap-1 text-[11px]"
            title="Reset Map Scale"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono tabular-nums">{Math.round(zoomLevel * 100)}%</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative overflow-auto border border-border rounded-lg bg-canvas p-2 min-h-[580px] flex items-center justify-center select-none">
        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}>
          <svg
            viewBox="0 0 1040 730"
            className="w-[1020px] h-[715px] drop-shadow-sm font-sans"
          >
            {/* Background Grid & Facility Outer Wall */}
            <rect x="10" y="10" width="1020" height="710" rx="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />
            
            {/* Main Aisles / Pathways */}
            {/* Horizontal Cross Aisles */}
            <rect x="25" y="112" width="985" height="16" fill="#F8FAFC" />
            <text x="500" y="124" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="bold" letterSpacing="2">
              NORTH CROSS AISLE — HIGH-FREQUENCY TRANSIT
            </text>

            <rect x="25" y="254" width="985" height="14" fill="#F8FAFC" />
            <text x="500" y="265" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="bold" letterSpacing="2">
              CENTRAL MAIN AISLE — FORKLIFT ROUTE
            </text>

            <rect x="25" y="388" width="985" height="14" fill="#F8FAFC" />
            <text x="500" y="399" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="bold" letterSpacing="2">
              SOUTH CROSS AISLE — CONSOLIDATION WAY
            </text>

            <rect x="25" y="522" width="985" height="14" fill="#F8FAFC" />
            <text x="500" y="533" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="bold" letterSpacing="2">
              FULFILLMENT STAGING AISLE
            </text>

            <rect x="25" y="630" width="985" height="12" fill="#F8FAFC" />

            {/* Render Every Logical Warehouse Zone */}
            {zones.map((zone) => {
              if (!zone.coordinates_json) return null;
              let coords = { x: 0, y: 0, w: 100, h: 50 };
              try {
                coords = JSON.parse(zone.coordinates_json);
              } catch {
                return null;
              }

              const isSelected = selectedZoneId === zone.id || selectedZoneId === zone.zone_code;
              const matchesSearch = isMatchedByFilter(zone);
              const hasLowStockRisk = overlays?.lowStockRiskZones?.includes(zone.id);
              const hasOptimization = overlays?.optimizationZones?.includes(zone.id);
              const hasBottleneck = overlays?.bottleneckZones?.includes(zone.id);

              return (
                <g
                  key={zone.id}
                  onClick={() => onSelectZone(zone.id)}
                  onMouseEnter={() => setHoveredZone(zone)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className="cursor-pointer transition-all"
                  opacity={matchesSearch ? 1 : 0.25}
                >
                  {/* Zone Box */}
                  <rect
                    x={coords.x}
                    y={coords.y}
                    width={coords.w}
                    height={coords.h}
                    rx="4"
                    fill={getZoneFillColor(zone)}
                    stroke={getZoneStrokeColor(zone)}
                    strokeWidth={isSelected ? 3 : 1.2}
                    className="transition-colors hover:brightness-95"
                  />

                  {/* Zone Identifier Label */}
                  <text
                    x={coords.x + 8}
                    y={coords.y + 16}
                    fill="#203247"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {zone.zone_code}
                  </text>

                  {/* Utilization Percentage Badge */}
                  <text
                    x={coords.x + coords.w - 8}
                    y={coords.y + 16}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {zone.utilization_pct || 0}%
                  </text>

                  {/* Subtitle / Subcategory */}
                  <text
                    x={coords.x + 8}
                    y={coords.y + 30}
                    fill="#475569"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {zone.sub_category?.slice(0, 18)}
                  </text>

                  {/* Capacity Bar in Bottom of Zone */}
                  <rect
                    x={coords.x + 8}
                    y={coords.y + coords.h - 10}
                    width={coords.w - 16}
                    height="4"
                    rx="2"
                    fill="#E2E8F0"
                  />
                  <rect
                    x={coords.x + 8}
                    y={coords.y + coords.h - 10}
                    width={Math.min(((coords.w - 16) * (zone.utilization_pct || 0)) / 100, coords.w - 16)}
                    height="4"
                    rx="2"
                    fill={Number(zone.utilization_pct) > 80 ? '#C44D4D' : Number(zone.utilization_pct) > 60 ? '#D99A27' : '#0F8276'}
                  />

                  {/* Overlay Badges */}
                  {activeOverlay === 'LOW_STOCK' && hasLowStockRisk && (
                    <circle
                      cx={coords.x + coords.w - 14}
                      cy={coords.y + coords.h - 22}
                      r="6"
                      fill="#D99A27"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  )}

                  {activeOverlay === 'STORAGE_OPTIMIZATION' && hasOptimization && (
                    <circle
                      cx={coords.x + coords.w - 14}
                      cy={coords.y + coords.h - 22}
                      r="6"
                      fill="#0F8276"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  )}

                  {activeOverlay === 'BOTTLENECK' && hasBottleneck && (
                    <circle
                      cx={coords.x + coords.w - 14}
                      cy={coords.y + coords.h - 22}
                      r="6"
                      fill="#C44D4D"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip Float */}
        {hoveredZone && (
          <div className="absolute bottom-4 left-4 bg-navy text-white text-xs p-2.5 rounded-lg shadow-elevated border border-navy-700 pointer-events-none max-w-xs z-30">
            <div className="flex items-center justify-between gap-3 mb-1 font-mono">
              <span className="font-bold text-teal-400">{hoveredZone.zone_code}</span>
              <span className="text-slate-300 font-bold tabular-nums">{hoveredZone.utilization_pct || 0}% Utilized</span>
            </div>
            <p className="font-bold text-white text-xs">{hoveredZone.name}</p>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{hoveredZone.purpose}</p>
            <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-navy-700 text-[10px] text-slate-400">
              <span>Pallets: {hoveredZone.current_pallet_count || 0}/{hoveredZone.max_pallet_capacity}</span>
              <span>•</span>
              <span>Cubic: {Number(hoveredZone.current_cubic_meters || 0).toFixed(1)}/{hoveredZone.max_cubic_meters} m³</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-border">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-navy uppercase text-[10px]">Zone Type Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#E6F6F4] border border-[#CBD5E1]" />
            <span>Inbound & Receiving</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#F1F5F9] border border-[#CBD5E1]" />
            <span>Electronics Storage (A1 - H2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#EEF2FF] border border-[#CBD5E1]" />
            <span>Picking & Fulfillment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FEF2F2] border border-[#C44D4D]" />
            <span>High-Security Vault & Cages</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          Click any zone to open contextual rack and bin telemetry
        </div>
      </div>
    </div>
  );
};
