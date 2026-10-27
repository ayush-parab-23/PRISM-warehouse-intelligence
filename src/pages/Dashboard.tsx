import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  MOCK_STATS, 
  MOCK_CHART_DATA, 
  MOCK_INSIGHTS, 
  MOCK_ACTIVITY
} from '../data/mockData';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Brain, ArrowRight, Clock, Package, ShoppingCart, Cpu, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Get top 3 insights
  const topInsights = MOCK_INSIGHTS.slice(0, 3);

  // Helper to get agent icon
  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'inventory-agent':
        return <Package className="w-4 h-4 text-primary" />;
      case 'forecasting-agent':
        return <TrendingUp className="w-4 h-4 text-indigo-500" />;
      case 'procurement-agent':
        return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case 'operations-agent':
        return <Cpu className="w-4 h-4 text-amber-500" />;
      default:
        return <Brain className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader 
          title="Good Morning, Warehouse Manager" 
          subtitle="Here is today's warehouse intelligence overview." 
        />
        <div className="text-xs bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-primary font-medium flex items-center gap-2 max-w-xs md:max-w-md">
          <Brain className="w-4 h-4 shrink-0 text-primary" />
          <span>PRISM active. Agents have completed today's first analysis cycle.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Inventory Health"
          value={`${MOCK_STATS.inventoryHealth}%`}
          subtext="Healthy SKU buffer"
          iconName="Activity"
          trend={{ value: "+1.2%", type: 'up' }}
        />
        <StatCard
          title="Low Stock Items"
          value={MOCK_STATS.lowStockCount}
          subtext="Require urgent reorder"
          iconName="PackageOpen"
          trend={{ value: "+2", type: 'down' }}
        />
        <StatCard
          title="Predicted Demand"
          value={`+${MOCK_STATS.predictedDemandChange}%`}
          subtext="Expected over next week"
          iconName="TrendingUp"
          trend={{ value: "+3%", type: 'up' }}
        />
        <StatCard
          title="Open Recommendations"
          value={MOCK_STATS.openRecommendationsCount}
          subtext="Awaiting review"
          iconName="ClipboardList"
        />
      </div>

      {/* Main Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Overview Line Chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary">Inventory Overview</h3>
            <p className="text-xs text-text-secondary">Weekly stock levels versus customer ordering demand</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '8px', 
                    border: '1px solid #E2E8F0', 
                    fontSize: '12px' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  name="Stock Level" 
                  dataKey="stockLevel" 
                  stroke="#2563EB" 
                  strokeWidth={2} 
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  type="monotone" 
                  name="Demand" 
                  dataKey="demand" 
                  stroke="#64748B" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-text-primary">Recent Agent Activity</h3>
              <p className="text-xs text-text-secondary">AI logs from active background loops</p>
            </div>
            <div className="space-y-4">
              {MOCK_ACTIVITY.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-primary/40 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium">
                      <span className="font-bold text-primary">{act.agentName}</span> {act.message}
                    </p>
                    <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {act.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Link 
              to="/ai-insights" 
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5 justify-center w-full"
            >
              Configure Agent Parameters
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-primary" />
              Prioritized Agent Insights
            </h3>
            <p className="text-xs text-text-secondary">High-priority alerts compiled from multi-agent reports</p>
          </div>
          <Link 
            to="/ai-insights" 
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            All Insights
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topInsights.map((insight) => (
            <div 
              key={insight.id} 
              className="border border-border rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between h-40"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {getAgentIcon(insight.agentId)}
                    <span className="text-xs font-bold text-text-primary">{insight.agentName}</span>
                  </div>
                  <StatusBadge status={insight.severity} />
                </div>
                <p className="text-xs text-text-primary font-semibold truncate mb-1">{insight.title}</p>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{insight.message}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-text-secondary">{insight.timestamp}</span>
                {insight.relatedRecommendationId ? (
                  <button 
                    onClick={() => navigate(`/ai-insights/${insight.relatedRecommendationId}`)}
                    className="text-primary font-bold hover:underline flex items-center gap-0.5"
                  >
                    View Details
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[10px] text-text-secondary italic">Monitoring only</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
