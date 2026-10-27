import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { MOCK_RECOMMENDATIONS } from '../data/mockData';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  ShieldAlert,
  Info
} from 'lucide-react';

export const RecommendationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the specific recommendation
  const recommendation = MOCK_RECOMMENDATIONS.find(rec => rec.id === id);

  if (!recommendation) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => navigate('/ai-insights')} 
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-all font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to AI Insights
        </button>
        <EmptyState 
          title="Recommendation Not Found" 
          description="The recommendation ID specified does not exist or has been archived." 
        />
      </div>
    );
  }

  // Interactive status state
  const [currentStatus, setCurrentStatus] = useState<'Pending' | 'Approved' | 'Ignored'>(recommendation.status);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleApprove = () => {
    setCurrentStatus('Approved');
    setFeedbackMsg('DEMO ACTION: Recommendation approved. Purchasing order created and queued for ERP synchronization.');
  };

  const handleIgnore = () => {
    setCurrentStatus('Ignored');
    setFeedbackMsg('DEMO ACTION: Recommendation ignored. Insight archived and feedback logged for agent fine-tuning.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <button 
        onClick={() => navigate('/ai-insights')} 
        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-all font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to AI Insights
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <PageHeader 
          title={`Recommendation Logic: ${recommendation.productName}`}
          subtitle={`Review recommendation detail generated for SKU product query.`}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary font-medium">Status:</span>
          <StatusBadge status={currentStatus} />
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${
          currentStatus === 'Approved' 
            ? 'bg-green-50 text-success border-green-100' 
            : 'bg-slate-50 text-text-secondary border-slate-200'
        }`}>
          <Info className="w-4.5 h-4.5 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Supervisor Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-50 border border-red-100 text-danger rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Supervisor Agent Decision</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-text-secondary font-semibold">Confidence: {recommendation.confidence}%</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mt-1">REORDER RECOMMENDED</h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Based on synthesized reports from active warehouse agents, a purchase order should be dispatched immediately to prevent stock depletion under forecasted customer workloads.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Agent Reasoning Block (Why?) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Multi-Agent Supporting Logic</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Inventory Agent */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-slate-50 border border-slate-100 rounded-md">
                  <Package className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-bold text-text-primary">Inventory Agent</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {recommendation.whyInventory}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-text-secondary italic">
              Safety stock alert
            </div>
          </div>

          {/* Forecasting Agent */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-slate-50 border border-slate-100 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <span className="text-[11px] font-bold text-text-primary">Forecasting Agent</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {recommendation.whyForecasting}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-text-secondary italic">
              ML trend spike detected
            </div>
          </div>

          {/* Procurement Agent */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-slate-50 border border-slate-100 rounded-md">
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-[11px] font-bold text-text-primary">Procurement Agent</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {recommendation.whyProcurement}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-text-secondary italic">
              Optimal supplier matched
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Action Cards */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-text-primary mb-4 pb-2 border-b border-border">Suggested Purchase Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Recommended Quantity</span>
            <strong className="text-base font-bold text-text-primary mt-1 block">{recommendation.recommendedQuantity} units</strong>
          </div>
          
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Suggested Supplier</span>
            <strong className="text-base font-bold text-text-primary mt-1 block">{recommendation.suggestedSupplier}</strong>
          </div>
          
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Estimated Total Cost</span>
            <strong className="text-base font-bold text-text-primary mt-1 block">₹{recommendation.estimatedCost.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleApprove}
            disabled={currentStatus !== 'Pending'}
            className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              currentStatus !== 'Pending'
                ? 'bg-slate-100 text-text-secondary cursor-not-allowed border border-border shadow-none'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            <CheckCircle className="w-4.5 h-4.5" />
            Approve Purchase Order
          </button>
          
          <button
            onClick={handleIgnore}
            disabled={currentStatus !== 'Pending'}
            className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
              currentStatus !== 'Pending'
                ? 'bg-slate-50 text-text-secondary border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 border-border text-text-primary'
            }`}
          >
            <XCircle className="w-4.5 h-4.5" />
            Ignore Recommendation
          </button>
        </div>
      </div>
    </div>
  );
};
