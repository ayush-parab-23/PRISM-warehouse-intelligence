import React, { useState } from 'react';
import { Brain, Send, Sparkles, Loader2 } from 'lucide-react';

interface AgentCommandBarProps {
  onSubmit: (prompt: string) => Promise<void> | void;
  isLoading: boolean;
}

export const AgentCommandBar: React.FC<AgentCommandBarProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const prebuiltPrompts = [
    'Audit low-stock SKUs and generate purchase orders',
    'Evaluate storage capacity and find congested zones in Kharghar',
    'Inspect dock queue dwell time and outbound dispatch backlogs',
    'Forecast 4-week demand for enterprise laptops and smartphones',
    'Audit electronics compliance, lithium battery SOPs, and BIS certs'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt);
    setPrompt('');
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-teal/10 text-teal flex items-center justify-center">
          <Brain className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-navy">Main Orchestrator Agent (ORCH-01)</h2>
          <p className="text-[11px] text-slate-500">
            Submit cross-functional warehouse instructions. The orchestrator delegates tasks to specialized domain agents, coordinates tool execution, and requires approval for restricted operations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Instruct PRISM agents... e.g., 'Find all low-stock items in Zone C3 and propose replenishment'"
            className="w-full px-3.5 py-2 text-xs border border-border rounded bg-canvas focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="px-4 py-2 bg-teal hover:bg-teal-600 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Orchestrating...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Run Instructions</span>
            </>
          )}
        </button>
      </form>

      {/* Pre-built Prompt Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Suggested Prompts:
        </span>
        {prebuiltPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(p)}
            className="text-[11px] px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-border text-slate-600 hover:text-navy transition-colors font-medium text-left"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
