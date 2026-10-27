import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { MOCK_RECOMMENDATIONS, MOCK_SUPPLIERS } from '../data/mockData';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export const Procurement: React.FC = () => {
  const navigate = useNavigate();

  const getPriceColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'competitive':
        return 'text-success bg-green-50 px-2 py-0.5 rounded-full border border-green-100';
      case 'average':
        return 'text-text-secondary bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200';
      default:
        return 'text-warning bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader 
          title="Procurement Intelligence" 
          subtitle="Support purchasing decisions by evaluating supplier terms, demand velocity, and pricing rates." 
        />
        <div className="text-xs bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-emerald-700 font-medium flex items-center gap-2 max-w-xs md:max-w-md">
          <ShoppingCart className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>Procurement Agent active. Current market evaluation complete.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Products to Reorder"
          value="9 SKUs"
          subtext="Below safety stock levels"
          iconName="Package"
        />
        <StatCard
          title="Potential Savings"
          value="₹42,000"
          subtext="By optimizing bulk vendors"
          iconName="TrendingUp"
          trend={{ value: "Save", type: 'up' }}
        />
        <StatCard
          title="Suppliers Evaluated"
          value="12 Vendors"
          subtext="Active contracts tracked"
          iconName="Users"
        />
      </div>

      {/* Recommended Purchases */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary">Recommended Purchases</h3>
          <p className="text-xs text-text-secondary">AI-generated replenishment orders optimized for predicted Q3 demands</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Product Name</th>
                <th className="py-3.5 px-5 text-right">Current Stock</th>
                <th className="py-3.5 px-5 text-right">Predicted Demand</th>
                <th className="py-3.5 px-5 text-right">Recommended Quantity</th>
                <th className="py-3.5 px-5">Suggested Supplier</th>
                <th className="py-3.5 px-5 text-right">Est. Cost</th>
                <th className="py-3.5 px-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary font-medium">
              {MOCK_RECOMMENDATIONS.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold">{rec.productName}</td>
                  <td className="py-4 px-5 text-right text-text-secondary">{rec.currentStock} units</td>
                  <td className="py-4 px-5 text-right">{rec.predictedDemand} units</td>
                  <td className="py-4 px-5 text-right font-bold text-primary">{rec.recommendedQuantity} units</td>
                  <td className="py-4 px-5 text-text-secondary">{rec.suggestedSupplier}</td>
                  <td className="py-4 px-5 text-right font-bold">₹{rec.estimatedCost.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => navigate(`/ai-insights/${rec.id}`)}
                      className="text-primary font-bold hover:underline flex items-center gap-0.5"
                    >
                      View Logic
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Comparison */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary">Supplier Comparison Scorecard</h3>
          <p className="text-xs text-text-secondary">Vendor performance ratings based on historical delivery time, pricing, and error rates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Supplier Name</th>
                <th className="py-3.5 px-5">Pricing Class</th>
                <th className="py-3.5 px-5 text-right">Avg. Lead Time</th>
                <th className="py-3.5 px-5 text-right">Delivery Reliability</th>
                <th className="py-3.5 px-5 text-right">Vendor Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary font-medium">
              {MOCK_SUPPLIERS.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold">{supplier.name}</td>
                  <td className="py-4 px-5">
                    <span className={getPriceColor(supplier.priceRating)}>{supplier.priceRating}</span>
                  </td>
                  <td className="py-4 px-5 text-right">{supplier.leadTime} days</td>
                  <td className="py-4 px-5 text-right font-bold">{supplier.reliability}%</td>
                  <td className="py-4 px-5 text-right">
                    <span className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] ${
                      supplier.score >= 90 
                        ? 'bg-green-50 text-success border border-green-100' 
                        : 'bg-blue-50 text-primary border border-blue-100'
                    }`}>
                      {supplier.score} / 100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
