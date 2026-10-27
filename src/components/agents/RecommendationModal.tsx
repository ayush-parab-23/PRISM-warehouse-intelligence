import React, { useState } from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Sparkles,
  Building,
  DollarSign
} from 'lucide-react';

interface RecommendationModalProps {
  recommendation: any | null;
  onClose: () => void;
  onResolve: (approvalId: string, decision: 'APPROVED' | 'REJECTED', notes?: string) => Promise<void>;
}

export const RecommendationModal: React.FC<RecommendationModalProps> = ({
  recommendation,
  onClose,
  onResolve
}) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!recommendation) return null;

  let evidence: any = {};
  let suggestedAction: any = {};
  try {
    if (recommendation.evidence_json) evidence = JSON.parse(recommendation.evidence_json);
    if (recommendation.suggested_action_json) suggestedAction = JSON.parse(recommendation.suggested_action_json);
  } catch {}

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!recommendation.approval_id) return;
    setSubmitting(true);
    try {
      await onResolve(recommendation.approval_id, decision, notes);
      onClose();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-lg shadow-elevated max-w-xl w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-border bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-navy text-white">
                {recommendation.category}
              </span>
              <StatusBadge status={recommendation.impact_level} />
              <StatusBadge status={recommendation.status} />
            </div>
            <h2 className="text-sm font-bold text-navy">{recommendation.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-navy rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Description */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Analytical Rationale & Agent Justification
            </span>
            <p className="text-slate-700 leading-relaxed bg-canvas p-2.5 rounded border border-border">
              {recommendation.description}
            </p>
          </div>

          {/* Evidence Grid */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Authoritative Data & Evidence
            </span>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-border font-mono text-[11px]">
              {Object.entries(evidence).map(([key, val]) => (
                <div key={key}>
                  <span className="text-slate-400 text-[10px] uppercase block">{key.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {typeof val === 'number' && key.includes('cost') ? `₹${val.toLocaleString('en-IN')}` : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Action Preview */}
          <div className="p-3 rounded border border-teal/40 bg-teal-50/20">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
              Proposed Autonomous Action
            </span>
            <div className="font-mono text-[11px] text-slate-700">
              <p>Action Type: <strong className="text-teal">{suggestedAction.action || 'EXECUTE_PLAN'}</strong></p>
              {suggestedAction.quantity && <p>Units Affected: <strong className="tabular-nums">{suggestedAction.quantity}</strong></p>}
              {suggestedAction.estimated_cost_inr && (
                <p>Estimated Budget: <strong className="tabular-nums">₹{Number(suggestedAction.estimated_cost_inr).toLocaleString('en-IN')}</strong></p>
              )}
            </div>
          </div>

          {/* Decision Notes Input */}
          {recommendation.status === 'PENDING_APPROVAL' && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Warehouse Manager Notes / Approval Comments (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter audit approval remarks or instructions..."
                rows={2}
                className="w-full p-2 border border-border rounded bg-canvas focus:bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 border-t border-border bg-slate-50 flex items-center justify-between gap-2">
          {recommendation.status === 'PENDING_APPROVAL' ? (
            <>
              <button
                type="button"
                onClick={() => handleDecision('REJECTED')}
                disabled={submitting}
                className="px-3.5 py-1.5 border border-danger/40 text-danger hover:bg-danger-50 rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-border text-slate-600 hover:bg-slate-100 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('APPROVED')}
                  disabled={submitting}
                  className="px-4 py-1.5 bg-teal hover:bg-teal-600 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve & Execute</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-1.5 bg-navy text-white rounded text-xs font-semibold"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
