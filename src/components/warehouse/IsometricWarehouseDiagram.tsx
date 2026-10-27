import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Boxes, 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye, 
  Info,
  CheckCircle2,
  Grid,
  Activity
} from 'lucide-react';

interface ZoneOverlayData {
  id: string;
  code: string;
  name: string;
  type: 'STORAGE' | 'OPERATION' | 'LOGISTICS';
  category: string;
  color: string;
  lightColor: string;
  borderStroke: string;
  utilizationPct: number;
  storedUnits: number;
  capacityUnits: number;
  customer: string;
  racksCount: number;
  status: 'OPTIMAL' | 'CONGESTED' | 'ATTENTION' | 'RESTRICTED';
  description: string;
  isoPoints: string;
  tagX: number;
  tagY: number;
}

// Maps directly to Kharghar authoritative database zone IDs
const ZONES_DATA: ZoneOverlayData[] = [
  {
    id: 'zone-a1',
    code: 'ZONE A1',
    name: 'Laptop & Hardware Storage',
    type: 'STORAGE',
    category: 'Laptops',
    color: '#1E40AF',
    lightColor: 'rgba(59, 130, 246, 0.35)',
    borderStroke: '#3B82F6',
    utilizationPct: 74,
    storedUnits: 348,
    capacityUnits: 470,
    customer: 'Apex Electronics Ltd',
    racksCount: 6,
    status: 'OPTIMAL',
    description: 'High-density pallet & shelf racking for ThinkPad X1, Dell Latitude & MacBook hardware.',
    isoPoints: '120,180 280,100 370,145 210,225',
    tagX: 245,
    tagY: 160
  },
  {
    id: 'zone-b2',
    code: 'ZONE B2',
    name: 'Smartphones & Tablets (High Security)',
    type: 'STORAGE',
    category: 'Smartphones',
    color: '#065F46',
    lightColor: 'rgba(16, 185, 129, 0.35)',
    borderStroke: '#10B981',
    utilizationPct: 88,
    storedUnits: 810,
    capacityUnits: 920,
    customer: 'Nexus Mobile Corp',
    racksCount: 8,
    status: 'CONGESTED',
    description: 'Secured anti-static shelving with IMEI scanning & high-security barrier fencing for Galaxy S24 & iPhone 15.',
    isoPoints: '290,95 450,15 540,60 380,140',
    tagX: 415,
    tagY: 75
  },
  {
    id: 'zone-c3',
    code: 'ZONE C3',
    name: 'Accessories & Peripherals',
    type: 'STORAGE',
    category: 'Accessories',
    color: '#92400E',
    lightColor: 'rgba(245, 158, 11, 0.35)',
    borderStroke: '#F59E0B',
    utilizationPct: 62,
    storedUnits: 620,
    capacityUnits: 1000,
    customer: 'Zenith Peripherals Inc',
    racksCount: 8,
    status: 'OPTIMAL',
    description: 'Medium-tier bin racking for MX Master 3S mice, 100W GaN chargers, and networking hardware.',
    isoPoints: '220,230 380,150 470,195 310,275',
    tagX: 345,
    tagY: 210
  },
  {
    id: 'zone-d2',
    code: 'ZONE D2',
    name: 'High-Value Vault & Components',
    type: 'STORAGE',
    category: 'High-Value Components',
    color: '#581C87',
    lightColor: 'rgba(168, 85, 247, 0.35)',
    borderStroke: '#A855F7',
    utilizationPct: 91,
    storedUnits: 512,
    capacityUnits: 560,
    customer: 'ElectraCore Components',
    racksCount: 4,
    status: 'ATTENTION',
    description: 'Biometrically restricted vault for discrete server GPUs, RTX 4090 accelerators, and lithium battery banks.',
    isoPoints: '390,145 550,65 640,110 480,190',
    tagX: 515,
    tagY: 125
  },
  {
    id: 'zone-recv-1',
    code: 'INBOUND',
    name: 'Receiving Dock 1 & Intake Staging',
    type: 'LOGISTICS',
    category: 'Dock Operations',
    color: '#1E293B',
    lightColor: 'rgba(100, 116, 139, 0.3)',
    borderStroke: '#64748B',
    utilizationPct: 65,
    storedUnits: 650,
    capacityUnits: 1000,
    customer: 'All Customers (Intake)',
    racksCount: 2,
    status: 'OPTIMAL',
    description: 'Hydraulic ramp docks with barcode manifest tally, pallet de-consolidation, and staging buffers.',
    isoPoints: '30,230 110,190 200,235 120,275',
    tagX: 115,
    tagY: 232
  },
  {
    id: 'zone-disp-1',
    code: 'OUTBOUND',
    name: 'Dispatch Dock 1 & Outbound Staging',
    type: 'LOGISTICS',
    category: 'Order Dispatch',
    color: '#0F766E',
    lightColor: 'rgba(15, 118, 110, 0.3)',
    borderStroke: '#0F8276',
    utilizationPct: 78,
    storedUnits: 298,
    capacityUnits: 400,
    customer: 'Domestic Carriers (Blue Dart, Delhivery)',
    racksCount: 2,
    status: 'OPTIMAL',
    description: 'Outbound consolidation line, automated stretch-wrapping, and express courier loading bays.',
    isoPoints: '320,280 480,200 570,245 410,325',
    tagX: 445,
    tagY: 260
  }
];

interface IsometricWarehouseDiagramProps {
  onSelectZone?: (zoneId: string) => void;
  onOpenReport?: (zoneCode: string) => void;
}

export const IsometricWarehouseDiagram: React.FC<IsometricWarehouseDiagramProps> = ({
  onSelectZone,
  onOpenReport
}) => {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState<ZoneOverlayData>(ZONES_DATA[0]);
  const [hoveredZone, setHoveredZone] = useState<ZoneOverlayData | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STORAGE' | 'LOGISTICS' | 'RISK'>('ALL');
  
  // Interactive Camera Controls
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [showRacks, setShowRacks] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.8));
  const handleResetZoom = () => setZoomLevel(1.0);

  const filteredZones = ZONES_DATA.filter(z => {
    if (activeFilter === 'STORAGE') return z.type === 'STORAGE';
    if (activeFilter === 'LOGISTICS') return z.type === 'LOGISTICS';
    if (activeFilter === 'RISK') return z.status === 'CONGESTED' || z.status === 'ATTENTION';
    return true;
  });

  const activeZone = hoveredZone || selectedZone;

  const handleZoneClick = (zone: ZoneOverlayData) => {
    setSelectedZone(zone);
    if (onSelectZone) {
      onSelectZone(zone.id);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
      {/* Header bar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas/40">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal" />
              <span>Interactive 3D Warehouse Digital Twin</span>
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Spatial Mesh
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kharghar DC, Sector 23 • Click any zone or operational area to inspect physical rack bins, stored client assets &amp; AI diagnostics.
          </p>
        </div>

        {/* Filter Pills & Interactive Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors border-l border-border"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                activeFilter === 'ALL' ? 'bg-surface text-navy shadow-xs font-bold' : 'text-slate-600 hover:text-navy'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('STORAGE')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                activeFilter === 'STORAGE' ? 'bg-surface text-navy shadow-xs font-bold' : 'text-slate-600 hover:text-navy'
              }`}
            >
              Storage
            </button>
            <button
              onClick={() => setActiveFilter('LOGISTICS')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                activeFilter === 'LOGISTICS' ? 'bg-surface text-navy shadow-xs font-bold' : 'text-slate-600 hover:text-navy'
              }`}
            >
              Docks
            </button>
            <button
              onClick={() => setActiveFilter('RISK')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                activeFilter === 'RISK' ? 'bg-amber-100 text-amber-900 shadow-xs font-bold' : 'text-slate-600 hover:text-navy'
              }`}
            >
              Attention
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Diagram Body: Left Isometric SVG, Right Contextual Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Isometric SVG Canvas Area (8 Cols) */}
        <div className="lg:col-span-8 p-4 sm:p-6 bg-slate-950 relative flex items-center justify-center overflow-hidden min-h-[360px]">
          {/* Subtle Ambient Grid Background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #94A3B8 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* SVG Isometric Warehouse Model with Zoom Scaling */}
          <div 
            className="w-full flex items-center justify-center transition-transform duration-300 ease-out origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              viewBox="0 0 680 360"
              className="w-full h-auto max-h-[380px] select-none filter drop-shadow-2xl"
            >
              <defs>
                {/* Warehouse Floor Gradient */}
                <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>

                {/* Glowing Filter for Hovered/Selected Zones */}
                <filter id="glow3d" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Warehouse Outer Concrete Foundation / Floor Slab */}
              <polygon
                points="20,220 280,90 660,100 400,345"
                fill="url(#floorGrad)"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Foundation Slab Bevel / 3D Extrusion */}
              <polygon
                points="20,220 400,345 400,355 20,230"
                fill="#0F172A"
                stroke="#1E293B"
              />
              <polygon
                points="400,345 660,100 660,110 400,355"
                fill="#090D16"
                stroke="#1E293B"
              />

              {/* Structural Columns & Aisles Grid */}
              <line x1="120,180" y1="380,310" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
              <line x1="280,100" y1="540,230" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />

              {/* Render Each Warehouse Zone as Clickable / Hoverable Polygon */}
              {filteredZones.map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                const isHovered = hoveredZone?.id === zone.id;
                const isAlert = zone.status === 'CONGESTED' || zone.status === 'ATTENTION';

                return (
                  <g 
                    key={zone.id} 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => handleZoneClick(zone)}
                    onMouseEnter={() => setHoveredZone(zone)}
                    onMouseLeave={() => setHoveredZone(null)}
                  >
                    {/* Zone Base Footprint with Ambient Glow */}
                    <polygon
                      points={zone.isoPoints}
                      fill={isSelected || isHovered ? zone.lightColor : 'rgba(30, 41, 59, 0.45)'}
                      stroke={isSelected ? '#2DD4BF' : isHovered ? zone.borderStroke : '#475569'}
                      strokeWidth={isSelected ? '3' : isHovered ? '2' : '1.5'}
                      filter={isSelected || isHovered ? 'url(#glow3d)' : undefined}
                      className="transition-colors duration-200"
                    />

                    {/* 3D Pallet Racks Visual Representation inside Zone */}
                    {showRacks && zone.type === 'STORAGE' && (
                      <g opacity={isSelected || isHovered ? '1.0' : '0.75'}>
                        {/* Rack Row 1 */}
                        <path
                          d={`M ${zone.tagX - 42},${zone.tagY - 5} l 15,-8 l 25,12 l -15,8 Z`}
                          fill="#38BDF8"
                          stroke="#0284C7"
                          strokeWidth="0.8"
                        />
                        <path
                          d={`M ${zone.tagX - 42},${zone.tagY - 5} l 0,10 l 25,12 l 0,-10 Z`}
                          fill="#0369A1"
                        />
                        {/* Rack Row 2 */}
                        <path
                          d={`M ${zone.tagX + 5},${zone.tagY - 20} l 15,-8 l 25,12 l -15,8 Z`}
                          fill="#F59E0B"
                          stroke="#D97706"
                          strokeWidth="0.8"
                        />
                        <path
                          d={`M ${zone.tagX + 5},${zone.tagY - 20} l 0,10 l 25,12 l 0,-10 Z`}
                          fill="#B45309"
                        />
                      </g>
                    )}

                    {/* Floating Zone Badge Pin */}
                    <g transform={`translate(${zone.tagX}, ${zone.tagY})`}>
                      {/* Badge Pill */}
                      <rect
                        x="-44"
                        y="-14"
                        width="88"
                        height="24"
                        rx="12"
                        fill={isSelected ? '#0F8276' : '#1E293B'}
                        stroke={isSelected ? '#2DD4BF' : zone.borderStroke}
                        strokeWidth="1.5"
                        className="shadow-lg"
                      />
                      {/* Pulsing indicator dot */}
                      <circle
                        cx="-30"
                        cy="-2"
                        r="3.5"
                        fill={isAlert ? '#EF4444' : '#10B981'}
                      />
                      {isAlert && (
                        <circle
                          cx="-30"
                          cy="-2"
                          r="6"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="1"
                          className="animate-ping"
                        />
                      )}
                      {/* Zone Code Label */}
                      <text
                        x="4"
                        y="2"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                        letterSpacing="0.5px"
                      >
                        {zone.code}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Animated Material Handling Equipment (Forklift / Pallet Mover Path) */}
              {showEquipment && (
                <g className="pointer-events-none">
                  {/* Path line */}
                  <path
                    d="M 170,240 Q 280,240 370,180"
                    fill="none"
                    stroke="#0F8276"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    opacity="0.5"
                  />
                  {/* Moving Forklift Marker */}
                  <circle cx="270" cy="225" r="5" fill="#F59E0B">
                    <animate
                      attributeName="cx"
                      values="170;360;170"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      values="240;185;240"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              )}

              {/* Docks Entrance Bay Labels */}
              <text x="50" y="275" fill="#94A3B8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                BAY 1 &amp; 2 (INBOUND)
              </text>
              <text x="470" y="340" fill="#94A3B8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                BAY 3 &amp; 4 (OUTBOUND)
              </text>
            </svg>
          </div>

          {/* Quick Legend at bottom of canvas */}
          <div className="absolute bottom-3 left-4 flex items-center gap-3 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700/60 text-[10px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span>Laptops</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Smartphones</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Accessories</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-500" />
              <span>High-Value Vault</span>
            </span>
          </div>
        </div>

        {/* Right Contextual Inspection Panel (4 Cols) */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-surface">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-teal">
                  Selected Operational Area
                </span>
                <h4 className="text-base font-bold text-navy flex items-center gap-1.5 mt-0.5">
                  <span>{activeZone.name}</span>
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                activeZone.status === 'OPTIMAL' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                activeZone.status === 'CONGESTED' ? 'bg-red-50 text-red-800 border-red-200' :
                'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {activeZone.status}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-canvas border border-border rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Cubic Utilization
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-xl font-bold font-mono tabular-nums ${
                    activeZone.utilizationPct > 80 ? 'text-danger' : 'text-navy'
                  }`}>
                    {activeZone.utilizationPct}%
                  </span>
                  <span className="text-xs text-slate-400 font-normal">of max</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className={`h-full rounded-full ${
                      activeZone.utilizationPct > 80 ? 'bg-danger' : 'bg-teal'
                    }`}
                    style={{ width: `${activeZone.utilizationPct}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-canvas border border-border rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Current Stock
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-navy font-mono tabular-nums">
                    {activeZone.storedUnits.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">units</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Cap: {activeZone.capacityUnits} units
                </span>
              </div>
            </div>

            {/* Operational Metadata */}
            <div className="space-y-2 text-xs border border-border rounded-lg p-3 bg-canvas/30 mb-4">
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-slate-500">Contracted Client:</span>
                <span className="font-bold text-navy">{activeZone.customer}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-slate-500">Product Line:</span>
                <span className="font-medium text-slate-800">{activeZone.category}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Physical Racks:</span>
                <span className="font-mono font-bold text-navy">{activeZone.racksCount} Industrial Racks</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-border/80">
              {activeZone.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border space-y-2">
            <button
              onClick={() => {
                if (onOpenReport) {
                  onOpenReport(activeZone.code);
                } else {
                  navigate(`/manager/agents?zone=${activeZone.id}`);
                }
              }}
              className="w-full py-2 bg-navy hover:bg-navy-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal" />
              <span>Run AI Agent Diagnostic Report</span>
            </button>

            <button
              onClick={() => {
                if (onSelectZone) {
                  onSelectZone(activeZone.id);
                } else {
                  navigate(`/manager/map?zone=${activeZone.id}`);
                }
              }}
              className="w-full py-1.5 bg-surface hover:bg-canvas text-slate-700 border border-border rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>View Rack &amp; Bin Allocation Drawer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
