import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Play, 
  Wrench, 
  FileCheck, 
  Brain, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react';

interface ExecutionTimelineProps {
  run: any | null;
  events: any[];
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ run, events }) => {
  if (!run) {
    return (
      <div className="bg-surface border border-border rounded-lg shadow-card p-6 text-center text-xs text-slate-400">
        Select an agent run or submit a command above to view the step-by-step reasoning graph and tool execution timeline.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'STEP_START':
        return <Play className="w-3.5 h-3.5 text-navy" />;
      case 'TOOL_CALL':
        return <Wrench className="w-3.5 h-3.5 text-teal" />;
      case 'TOOL_RESULT':
        return <FileCheck className="w-3.5 h-3.5 text-teal-600" />;
      case 'REASONING_SUMMARY':
        return <Brain className="w-3.5 h-3.5 text-indigo-600" />;
      case 'HANDOFF':
        return <ArrowRight className="w-3.5 h-3.5 text-amber-600" />;
      case 'RECOMMENDATION':
        return <Sparkles className="w-3.5 h-3.5 text-teal" />;
      case 'APPROVAL_REQUIRED':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber" />;
      case 'ERROR':
        return <XCircle className="w-3.5 h-3.5 text-danger" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'TOOL_CALL': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'TOOL_RESULT': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'REASONING_SUMMARY': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'HANDOFF': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVAL_REQUIRED': return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'ERROR': return 'bg-danger-50 text-danger-700 border-danger-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card p-4 space-y-4">
      {/* Run Metadata Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-navy">{run.id}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {run.command_type}
            </span>
            <StatusBadge status={run.status} />
          </div>
          <p className="text-xs text-slate-700 font-medium">Prompt: "{run.user_prompt}"</p>
        </div>
        <div className="text-right text-[11px] text-slate-400 font-mono">
          <span>Started: {new Date(run.start_time).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Step by Step Timeline Events */}
      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.length === 0 ? (
          <div className="pl-8 text-xs text-slate-400 py-4">Waiting for execution events...</div>
        ) : (
          events.map((evt, idx) => (
            <div key={evt.id || idx} className="relative flex items-start gap-3 pl-8">
              {/* Event Dot */}
              <div className="absolute left-1.5 top-1 w-5 h-5 rounded-full bg-surface border border-slate-300 flex items-center justify-center shrink-0">
                {getEventIcon(evt.event_type)}
              </div>

              {/* Event Content */}
              <div className="flex-1 p-2.5 rounded bg-canvas border border-border text-xs space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded border uppercase font-bold text-[9px] ${getEventBadgeClass(evt.event_type)}`}>
                      {evt.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-slate-700">{evt.agent_name || evt.agent_id}</span>
                  </div>
                  <span className="text-slate-400 tabular-nums">
                    {new Date(evt.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-slate-800 text-xs leading-relaxed font-medium">
                  {evt.message}
                </p>

                {evt.data_json && (
                  <details className="mt-1">
                    <summary className="text-[10px] text-teal cursor-pointer font-bold hover:underline">
                      View Tool Telemetry Payload
                    </summary>
                    <pre className="mt-1 p-2 rounded bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-36">
                      {JSON.stringify(JSON.parse(evt.data_json), null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Final Outcome Summary */}
      {run.summary_result && (
        <div className={`p-3 rounded-lg border text-xs ${
          run.status === 'WAITING_APPROVAL' 
            ? 'border-amber/50 bg-amber-50/30 text-amber-900' 
            : 'border-teal/30 bg-teal-50/20 text-teal-900'
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {run.status === 'WAITING_APPROVAL' ? (
              <AlertTriangle className="w-4 h-4 text-amber" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-teal" />
            )}
            <span>Execution Summary & Synthesized Findings</span>
          </div>
          <p className="leading-relaxed">{run.summary_result}</p>
        </div>
      )}
    </div>
  );
};
