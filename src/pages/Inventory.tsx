import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { MOCK_PRODUCTS, MOCK_STATS } from '../data/mockData';
import { Search, Filter, RefreshCw } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))];
  
  // Extract unique statuses
  const statuses = ['All', 'Healthy', 'Low Stock', 'Critical', 'Dead Stock'];

  // Filter products
  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory Intelligence" 
        subtitle="Monitor stock health and identify products that require attention." 
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Products"
          value={MOCK_STATS.totalProducts}
          subtext="Tracked in current warehouse"
          iconName="Boxes"
        />
        <StatCard
          title="Low Stock SKUs"
          value={MOCK_STATS.lowStockCount}
          subtext="Approaching threshold levels"
          iconName="AlertTriangle"
          trend={{ value: "Warning", type: 'down' }}
        />
        <StatCard
          title="Dead Stock Items"
          value={MOCK_STATS.deadStockCount}
          subtext="No sales activity in 90 days"
          iconName="Archive"
        />
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-text-primary placeholder:text-text-secondary font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-text-secondary shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none text-text-primary font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none text-text-primary font-medium"
            >
              <option value="All">All Statuses</option>
              {statuses.slice(1).map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') && (
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-text-primary rounded-lg border border-border transition-all"
          >
            <RefreshCw className="h-3 w-3" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Product Table Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">SKU</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5 text-right">Current Stock</th>
                  <th className="py-3.5 px-5 text-right">Reorder Threshold</th>
                  <th className="py-3.5 px-5 text-right">Daily Demand</th>
                  <th className="py-3.5 px-5">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary font-medium">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-bold">{product.name}</td>
                    <td className="py-4 px-5 text-text-secondary font-mono">{product.sku}</td>
                    <td className="py-4 px-5">{product.category}</td>
                    <td className={`py-4 px-5 text-right font-bold ${
                      product.currentStock <= product.reorderLevel ? 'text-danger' : 'text-text-primary'
                    }`}>
                      {product.currentStock} units
                    </td>
                    <td className="py-4 px-5 text-right text-text-secondary">{product.reorderLevel} units</td>
                    <td className="py-4 px-5 text-right">{product.dailyDemand}/day</td>
                    <td className="py-4 px-5">
                      <StatusBadge status={product.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState 
              title="No products match filter" 
              description="Try adjusting your keyword search, category selector, or status filter to locate active products." 
            />
          </div>
        )}
        <div className="px-5 py-3 bg-slate-50 border-t border-border flex items-center justify-between text-[11px] text-text-secondary font-semibold">
          <span>Showing {filteredProducts.length} of {MOCK_PRODUCTS.length} electronics products</span>
          <span>Last inventory sync: 5 minutes ago</span>
        </div>
      </div>
    </div>
  );
};
