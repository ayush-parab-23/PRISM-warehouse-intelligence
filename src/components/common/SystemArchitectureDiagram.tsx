import React, { useState } from 'react';
import { 
  Workflow, 
  Database, 
  Server, 
  Layout, 
  Brain, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Boxes, 
  Truck, 
  ShieldCheck, 
  Activity, 
  Users 
} from 'lucide-react';

export const SystemArchitectureDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    let step = 1;
    setActiveStep(1);

    const interval = setInterval(() => {
      step++;
      if (step <= 5) {
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setActiveStep(null);
          setIsSimulating(false);
        }, 1500);
      }
    }, 900);
  };

  const steps = [
    {
      step: 1,
      title: 'Employee Enters Data',
      subtitle: 'e.g., Inbound Receive / Wave Pick',
      color: 'bg-emerald-600',
      borderColor: 'border-emerald-500',
      lightBg: 'bg-emerald-50 text-emerald-900',
      icon: Users
    },
    {
      step: 2,
      title: 'Authoritative Relational DB',
      subtitle: 'SQLite WAL mode with CHECK constraints',
      color: 'bg-blue-600',
      borderColor: 'border-blue-500',
      lightBg: 'bg-blue-50 text-blue-900',
      icon: Database
    },
    {
      step: 3,
      title: 'Autonomous Multi-Agent Layer',
      subtitle: 'Orchestrator delegates to domain agent',
      color: 'bg-purple-600',
      borderColor: 'border-purple-500',
      lightBg: 'bg-purple-50 text-purple-900',
      icon: Brain
    },
    {
      step: 4,
      title: 'Intelligence & Insights Report',
      subtitle: 'Action roadmap & human approval gate',
      color: 'bg-amber-600',
      borderColor: 'border-amber-500',
      lightBg: 'bg-amber-50 text-amber-900',
      icon: Activity
    },
    {
      step: 5,
      title: 'Manager Dashboard Synced',
      subtitle: 'Real-time WebSocket event broadcast',
      color: 'bg-teal-600',
      borderColor: 'border-teal-500',
      lightBg: 'bg-teal-50 text-teal-900',
      icon: Zap
    }
  ];

  const agents = [
    { name: 'Main Orchestrator', code: 'ORCH-01', color: 'bg-purple-500' },
    { name: 'Inventory Intelligence', code: 'INV-02', color: 'bg-blue-500' },
    { name: 'Storage Optimization', code: 'STR-03', color: 'bg-amber-500' },
    { name: 'Inbound / Outbound', code: 'LOG-04', color: 'bg-cyan-500' },
    { name: 'Workforce Balancing', code: 'WKF-05', color: 'bg-indigo-500' },
    { name: 'Predictive Analytics', code: 'ANA-06', color: 'bg-emerald-500' },
    { name: 'Regulatory Compliance', code: 'CMP-07', color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl shadow-card p-5 space-y-6">
      {/* Top Banner: Title & Simulation trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <Workflow className="w-4 h-4 text-teal" />
              <span>System Flow & Architecture Visualizer</span>
            </h3>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
              Bi-directional Real-Time Loop
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates how physical operational data entered on the warehouse floor triggers autonomous multi-agent reasoning and instant manager telemetry.
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
            isSimulating 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-teal hover:bg-teal-700 text-white'
          }`}
        >
          <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Streaming Data...' : 'Simulate Live Transaction Flow'}</span>
        </button>
      </div>

      {/* Part 1: System Flow (How It Works) */}
      <div>
        <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
          1. Operational Data & Agent Execution Flow
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {steps.map((st) => {
            const isCurrent = activeStep === st.step;
            const isCompleted = activeStep !== null && activeStep > st.step;
            const Icon = st.icon;

            return (
              <div 
                key={st.step}
                className={`relative p-3 rounded-lg border text-xs transition-all duration-300 flex flex-col justify-between ${
                  isCurrent 
                    ? `ring-2 ring-teal ring-offset-2 ${st.lightBg} shadow-md border-teal` 
                    : isCompleted
                    ? 'bg-canvas border-teal/40 opacity-90'
                    : 'bg-canvas border-border/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-5 h-5 rounded-full bg-navy text-white text-[10px] font-mono font-bold flex items-center justify-center">
                      {st.step}
                    </span>
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-teal animate-bounce' : 'text-slate-400'}`} />
                  </div>
                  <h5 className="font-bold text-navy text-[11px] leading-tight mb-1">
                    {st.title}
                  </h5>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    {st.subtitle}
                  </p>
                </div>

                {isCurrent && (
                  <div className="mt-2 text-[9px] font-bold text-teal flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal animate-ping" />
                    <span>Processing live packet...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: System Architecture Diagram & Features Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-border">
        {/* Architecture Block Flow (8 Cols) */}
        <div className="lg:col-span-8 p-4 bg-slate-950 rounded-xl text-slate-200 border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              2. Distributed System Architecture & Multi-Agent Topography
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              WebSocket :3001 | REST API
            </span>
          </div>

          {/* Block Diagram Grid */}
          <div className="space-y-4 text-xs font-mono">
            {/* Top Row: Dual Portals */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-700 text-center">
                <span className="text-teal font-bold block text-[11px]">Employee Portal</span>
                <span className="text-[9px] text-slate-400">Receive, Inspect, Putaway, Pick, Pack, Dispatch</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-700 text-center">
                <span className="text-teal font-bold block text-[11px]">Manager Portal</span>
                <span className="text-[9px] text-slate-400">Digital Twin, AI Command Center, Telemetry, Approvals</span>
              </div>
            </div>

            {/* Connecting Arrows */}
            <div className="flex justify-around text-slate-500 text-xs py-0.5">
              <span>▼ React 19 Frontend (Vite) ▼</span>
              <span>▲ Real-time WebSocket Push ▲</span>
            </div>

            {/* Middle Row: Backend API & Authoritative Database */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded bg-slate-800 border border-teal-500/40 text-center shadow-xs">
                <span className="text-emerald-400 font-bold block text-[11px] flex items-center justify-center gap-1">
                  <Server className="w-3.5 h-3.5" />
                  <span>Node.js & Express API</span>
                </span>
                <span className="text-[9px] text-slate-300">Route Handlers, Domain Services & Task Dispatch</span>
              </div>

              <div className="p-2.5 rounded bg-slate-800 border border-blue-500/40 text-center shadow-xs">
                <span className="text-blue-400 font-bold block text-[11px] flex items-center justify-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>Authoritative SQLite (WAL)</span>
                </span>
                <span className="text-[9px] text-slate-300">CHECK (available &gt;= 0) &amp; Movement Audit Logs</span>
              </div>
            </div>

            {/* Connecting Arrows to Agent Layer */}
            <div className="text-center text-slate-500 text-[10px] py-0.5">
              ▲▼ Typed Database Tools &amp; Orchestration Engine (Agent Registry) ▲▼
            </div>

            {/* Bottom Row: 7 Specialized AI Agents Layer */}
            <div className="p-3 rounded-lg bg-slate-900 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span>Multi-Agent AI Intelligence Layer (7 Specialized Roles)</span>
                </span>
                <span className="text-[9px] text-slate-400">Autonomous Evaluation &amp; Human Approval</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {agents.map((ag) => (
                  <div key={ag.code} className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[9px]">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${ag.color}`} />
                      <span className="font-bold text-slate-200 truncate">{ag.code}</span>
                    </div>
                    <span className="text-slate-400 truncate block text-[8.5px] mt-0.5">{ag.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Matrix (4 Cols) */}
        <div className="lg:col-span-4 p-4 bg-canvas rounded-xl border border-border flex flex-col justify-between text-xs">
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
              3. Architectural Core Tenets
            </h4>

            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                <span><strong>Dual Connected Workspaces:</strong> Shared single authoritative relational database with role security.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                <span><strong>Agent-Centric Orchestration:</strong> Explicit tool calling, reasoning steps, and handoffs visible to managers.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                <span><strong>Zero-Latency Synchronization:</strong> Floor operations broadcast instantly over WebSockets.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                <span><strong>Transactional Integrity:</strong> Non-negative stock constraints and immutable movement audit trails.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                <span><strong>Human-in-the-Loop:</strong> Restricted inventory actions gated behind Manager Approval workflows.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 text-[11px] text-slate-500 font-mono">
            Facility: Kharghar Central DC, Navi Mumbai
          </div>
        </div>
      </div>
    </div>
  );
};
