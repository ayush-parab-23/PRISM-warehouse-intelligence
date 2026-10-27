import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { MOCK_STATS, MOCK_FORECASTS } from '../data/mockData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, BrainCircuit } from 'lucide-react';

export const Forecasting: React.FC = () => {
  // Monthly aggregate historical & predicted demand data
  const chartData = [
    { name: 'Jan (Hist)', demand: 250, type: 'Historical' },
    { name: 'Feb (Hist)', demand: 280, type: 'Historical' },
    { name: 'Mar (Hist)', demand: 315, type: 'Historical' },
    { name: 'Apr (Hist)', demand: 290, type: 'Historical' },
    { name: 'May (Hist)', demand: 340, type: 'Historical' },
    { name: 'Jun (Hist)', stroke: 390, demand: 390, type: 'Historical' },
    { name: 'Jul (Pred)', demand: 420, type: 'Predicted' },
    { name: 'Aug (Pred)', demand: 445, type: 'Predicted' },
    { name: 'Sep (Pred)', demand: 470, type: 'Predicted' },
  ];

  const getTrendIcon = (trend: 'Increasing' | 'Stable' | 'Decreasing') => {
    switch (trend) {
      case 'Increasing':
        return (
          <span className="flex items-center gap-1 text-success font-semibold text-xs">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Increasing
          </span>
        );
      case 'Decreasing':
        return (
          <span className="flex items-center gap-1 text-danger font-semibold text-xs">
            <ArrowDownRight className="w-3.5 h-3.5" />
            Decreasing
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-text-secondary font-semibold text-xs">
            <Minus className="w-3.5 h-3.5" />
            Stable
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader 
          title="Demand Forecasting" 
          subtitle="Predicted product demand based on historical warehouse activity and external market vectors." 
        />
        <div className="text-xs bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 text-indigo-700 font-medium flex items-center gap-2 max-w-xs md:max-w-md">
          <BrainCircuit className="w-4 h-4 shrink-0 text-indigo-500" />
          <span>Forecasting Agent active. Confidence baseline is set to 80% minimum.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Forecast Accuracy"
          value="91%"
          subtext="Tested against back-data"
          iconName="Target"
          trend={{ value: "+0.4%", type: 'up' }}
        />
        <StatCard
          title="Overall Predicted Demand"
          value={`+${MOCK_STATS.predictedDemandChange}%`}
          subtext="Next 30 days workload"
          iconName="TrendingUp"
          trend={{ value: "Increasing", type: 'up' }}
        />
        <StatCard
          title="Products Forecasted"
          value="120 SKUs"
          subtext="High-frequency categories"
          iconName="Activity"
        />
      </div>

      {/* Historical vs Predicted Demand Chart */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-text-primary">Demand Forecast Trend</h3>
          <p className="text-xs text-text-secondary">Historical sales volume compared against 3-month predictive ML forecasts</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
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
              <Area 
                type="monotone" 
                name="Aggregate Demand (Units)" 
                dataKey="demand" 
                stroke="#2563EB" 
                strokeWidth={2} 
                fillOpacity={1}
                fill="url(#colorDemand)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Forecast Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary">SKU Demand Predictions</h3>
          <p className="text-xs text-text-secondary">Itemized forecast comparisons calculated by the ML Forecasting Agent</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Product</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5 text-right">Current Demand</th>
                <th className="py-3.5 px-5 text-right">Predicted Demand</th>
                <th className="py-3.5 px-5">Trend Direction</th>
                <th className="py-3.5 px-5 text-right">Confidence Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary font-medium">
              {MOCK_FORECASTS.map((forecast) => (
                <tr key={forecast.productId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold">{forecast.productName}</td>
                  <td className="py-4 px-5">{forecast.category}</td>
                  <td className="py-4 px-5 text-right">{forecast.currentDemand} units/day</td>
                  <td className="py-4 px-5 text-right font-bold text-primary">{forecast.predictedDemand} units/day</td>
                  <td className="py-4 px-5">
                    {getTrendIcon(forecast.trend)}
                  </td>
                  <td className="py-4 px-5 text-right font-bold">
                    <span className="inline-block w-12 text-right mr-2">{forecast.confidence}%</span>
                    <div className="inline-block w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden align-middle">
                      <div 
                        className={`h-full rounded-full ${
                          forecast.confidence >= 90 ? 'bg-success' : 'bg-primary'
                        }`} 
                        style={{ width: `${forecast.confidence}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-border text-[11px] text-text-secondary font-semibold">
          <span>* Predictions generated using a seasonal autoregressive time-series model (SARIMA).</span>
        </div>
      </div>
    </div>
  );
};
