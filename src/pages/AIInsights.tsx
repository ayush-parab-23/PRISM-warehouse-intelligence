import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { MOCK_AGENTS, MOCK_INSIGHTS } from '../data/mockData';
import { Brain, Package, TrendingUp, ShoppingCart, Cpu, ShieldAlert, ArrowRight, Eye } from 'lucide-react';

export const AIInsights: React.FC = () => {
  const navigate = useNavigate();

  const getAgentIcon = (id: string, className: string = "w-5 h-5") => {
    switch (id) {
      case 'inventory-agent':
        return <Package className={`${className} text-primary`} />;
      case 'forecasting-agent':
        return <TrendingUp className={`${className} text-indigo-500`} />;
      case 'procurement-agent':
        return <ShoppingCart className={`${className} text-emerald-500`} />;
      case 'operations-agent':
        return <Cpu className={`${className} text-amber-500`} />;
      case 'supervisor-agent':
        return <ShieldAlert className={`${className} text-red-500`} />;
      default:
        return <Brain className={`${className} text-primary`} />;
    }
  };

  // Helper to map agent to a specific demo recommendation
  const getRecommendationIdForAgent = (agentId: string) => {
    switch (agentId) {
      case 'inventory-agent':
      case 'supervisor-agent':
        return 'rec-1'; // Logitech Mouse
      case 'forecasting-agent':
        return 'rec-2'; // Dell Inspiron
      case 'procurement-agent':
        return 'rec-3'; // Samsung SSD
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="AI Multi-Agent Intelligence" 
        subtitle="View specialized AI agents monitoring the warehouse, predicting demand spikes, and generating unified suggestions." 
      />

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {MOCK_AGENTS.map((agent) => {
          const recId = getRecommendationIdForAgent(agent.id);
          return (
            <div 
              key={agent.id} 
              className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all h-[340px]"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    {getAgentIcon(agent.id)}
                  </div>
                  <StatusBadge status={agent.status} />
                </div>
                
                <h3 className="text-sm font-bold text-text-primary mb-1">{agent.name}</h3>
                <p className="text-[11px] text-text-secondary line-clamp-3 leading-relaxed mb-3">{agent.description}</p>
                
                <div className="border-t border-slate-100 pt-3 mt-3">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Latest Insight</span>
                  <p className="text-xs text-text-primary font-semibold mt-1 leading-relaxed line-clamp-3">"{agent.latestInsight}"</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-secondary">
                <span>Updated {agent.lastAnalysis}</span>
                {recId ? (
                  <button
                    onClick={() => navigate(`/ai-insights/${recId}`)}
                    className="text-primary font-bold hover:underline flex items-center gap-0.5"
                  >
                    View Insight
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] text-text-secondary italic">Monitoring</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compiled Insights List */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-text-primary">System Insights Ledger</h3>
          <p className="text-xs text-text-secondary">All raw analytical alerts produced across running agent loops</p>
        </div>
        <div className="space-y-3">
          {MOCK_INSIGHTS.map((insight) => (
            <div 
              key={insight.id} 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
            >
              <div className="flex items-start gap-3 text-xs">
                <div className="p-1.5 bg-white border border-border rounded-md shrink-0">
                  {getAgentIcon(insight.agentId, "w-4 h-4")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">{insight.agentName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-text-secondary font-medium">{insight.timestamp}</span>
                  </div>
                  <p className="text-text-primary font-bold mt-1">{insight.title}</p>
                  <p className="text-text-secondary mt-0.5">{insight.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 self-end sm:self-auto flex-shrink-0">
                <StatusBadge status={insight.severity} />
                {insight.relatedRecommendationId ? (
                  <button
                    onClick={() => navigate(`/ai-insights/${insight.relatedRecommendationId}`)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-border rounded-lg text-xs font-bold text-text-primary transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review recommendation
                  </button>
                ) : (
                  <span className="text-[10px] text-text-secondary italic px-2">Telemetric only</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
