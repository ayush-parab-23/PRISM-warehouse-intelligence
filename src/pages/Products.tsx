import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { MOCK_PRODUCTS } from '../data/mockData';
import { Search, Filter, Plus, ArrowRight } from 'lucide-react';

export const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))];

  // Filter products
  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Warehouse Product Catalog" 
          subtitle="View and manage standard pricing, SKU codes, and default suppliers." 
        />
        <button 
          onClick={() => alert('Demo Mode: Creating new product is not supported in the frontend demonstration.')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product SKU
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by catalog name, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-text-primary placeholder:text-text-secondary font-medium"
          />
        </div>

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
      </div>

      {/* Catalog Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">SKU Code</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Standard Supplier</th>
                  <th className="py-3.5 px-5 text-right">Standard Unit Price</th>
                  <th className="py-3.5 px-5 text-right">Reorder Point</th>
                  <th className="py-3.5 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary font-medium">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-bold text-text-primary">{product.name}</td>
                    <td className="py-4 px-5 text-text-secondary font-mono">{product.sku}</td>
                    <td className="py-4 px-5">{product.category}</td>
                    <td className="py-4 px-5 text-text-secondary">{product.supplier}</td>
                    <td className="py-4 px-5 text-right font-bold">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 text-right text-text-secondary">{product.reorderLevel} units</td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => alert(`Catalog Item: ${product.name}\nSKU: ${product.sku}\nSupplier: ${product.supplier}\nPrice: ₹${product.price.toLocaleString('en-IN')}`)}
                        className="text-primary font-bold hover:underline flex items-center gap-0.5"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState 
              title="No products in catalog matching filters" 
              description="Review your active keyword searches and categories, or click Add Product SKU to create a new record." 
            />
          </div>
        )}
      </div>
    </div>
  );
};
