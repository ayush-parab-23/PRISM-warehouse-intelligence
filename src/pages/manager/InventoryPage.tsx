import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { usePrismWebSocket } from '../../context/WebSocketContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Boxes, 
  AlertTriangle, 
  ChevronRight, 
  X,
  FileSpreadsheet
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { dataVersion } = usePrismWebSocket();

  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [productDetail, setProductDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [prodRes, custRes] = await Promise.all([
        api.getProducts({
          category: selectedCategory,
          customerId: selectedCustomer,
          search: searchTerm
        }),
        api.getCustomers()
      ]);
      setProducts(prodRes.products || []);
      setCustomers(custRes.customers || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [selectedCategory, selectedCustomer, dataVersion]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory();
  };

  const handleOpenDetail = async (prod: any) => {
    setSelectedProduct(prod);
    try {
      const detail = await api.getProductDetail(prod.id);
      setProductDetail(detail);
    } catch (err) {
      console.error('Failed to load product detail:', err);
    }
  };

  const categories = [
    'All',
    'Laptops & Workstations',
    'Smartphones & Tablets',
    'Computer Peripherals',
    'Chargers & Accessories',
    'Networking Hardware',
    'Components & Sub-assemblies'
  ];

  const filteredProducts = products.filter(p => {
    if (selectedStatus === 'All') return true;
    return p.status === selectedStatus;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventory Explorer"
        subtitle="Authoritative product catalog, SKU balance tracking, customer ownership segregation, and storage bin assignments."
        actions={
          <button
            onClick={loadInventory}
            className="px-3 py-1.5 border border-border bg-surface hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal' : ''}`} />
            <span>Refresh Balances</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-lg border border-border shadow-card flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU code, product name, or specification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded bg-canvas focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal font-medium"
          />
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-border rounded bg-canvas text-slate-700 font-medium text-xs"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Customer Dropdown */}
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="px-2.5 py-1.5 border border-border rounded bg-canvas text-slate-700 font-medium text-xs"
          >
            <option value="All">All Customers</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-border rounded bg-canvas text-slate-700 font-medium text-xs"
          >
            <option value="All">All Health Statuses</option>
            <option value="Healthy">Healthy Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Authoritative Inventory Table */}
      <div className="bg-surface border border-border rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-border font-bold">
              <tr>
                <th className="px-4 py-3">SKU & Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Customer Owner</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">On-Hand</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-right">Reserved</th>
                <th className="px-4 py-3 text-right">Quarantined</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr 
                    key={prod.id} 
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(prod)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] font-bold text-navy block">{prod.sku}</span>
                      <span className="text-slate-800 font-semibold">{prod.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{prod.category}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{prod.customer_name}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-800">
                      ₹{prod.unit_price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-navy">
                      {prod.current_stock.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-teal">
                      {prod.available_stock.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                      {prod.reserved_stock.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-danger font-bold">
                      {prod.quarantined_stock > 0 ? prod.quarantined_stock : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={prod.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDetail(prod); }}
                        className="p-1 hover:bg-slate-200 text-slate-500 rounded"
                        title="View Bin Locations"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SKU Detail & Bin Breakdown Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg shadow-elevated max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-border bg-slate-50 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy text-white">
                    {selectedProduct.sku}
                  </span>
                  <StatusBadge status={selectedProduct.status} />
                </div>
                <h3 className="text-sm font-bold text-navy">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-500">Owner: {selectedProduct.customer_name} • Category: {selectedProduct.category}</p>
              </div>
              <button
                onClick={() => { setSelectedProduct(null); setProductDetail(null); }}
                className="p-1 text-slate-400 hover:text-navy rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              {/* Balances summary */}
              <div className="grid grid-cols-4 gap-2 bg-canvas p-3 rounded-lg border border-border text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">On Hand</span>
                  <span className="text-base font-bold text-navy">{selectedProduct.current_stock}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Available</span>
                  <span className="text-base font-bold text-teal">{selectedProduct.available_stock}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Reserved</span>
                  <span className="text-base font-bold text-slate-600">{selectedProduct.reserved_stock}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Safety Target</span>
                  <span className="text-base font-bold text-slate-600">{selectedProduct.target_stock}</span>
                </div>
              </div>

              {/* Physical Bins List */}
              <div>
                <span className="font-bold text-navy block text-xs mb-2 uppercase tracking-wider text-[10px]">
                  Physical Slotting Locations in Kharghar Warehouse
                </span>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-border">
                      <tr>
                        <th className="px-3 py-2">Zone</th>
                        <th className="px-3 py-2">Bin Location</th>
                        <th className="px-3 py-2 text-right">Available</th>
                        <th className="px-3 py-2 text-right">Reserved</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {productDetail?.balances?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                            No active balances recorded.
                          </td>
                        </tr>
                      ) : (
                        productDetail?.balances?.map((b: any) => (
                          <tr key={b.id} className="font-mono text-[11px]">
                            <td className="px-3 py-2 font-bold text-navy font-sans">{b.zone_name}</td>
                            <td className="px-3 py-2 font-bold text-teal">{b.full_location_code}</td>
                            <td className="px-3 py-2 text-right text-teal font-bold">{b.quantity_available}</td>
                            <td className="px-3 py-2 text-right text-slate-500">{b.quantity_reserved}</td>
                            <td className="px-3 py-2 text-right font-bold text-navy">{b.quantity_on_hand}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Movement History */}
              <div>
                <span className="font-bold text-navy block text-xs mb-2 uppercase tracking-wider text-[10px]">
                  Recent Transaction Movements
                </span>
                <div className="space-y-1.5">
                  {productDetail?.movements?.length === 0 ? (
                    <p className="text-slate-400 py-2">No historical movements recorded yet.</p>
                  ) : (
                    productDetail?.movements?.map((m: any) => (
                      <div key={m.id} className="p-2 rounded bg-slate-50 border border-border text-[11px] flex justify-between items-center">
                        <div>
                          <span className="font-mono font-bold text-teal mr-2">{m.movement_type}</span>
                          <span className="text-slate-700 font-medium">{m.quantity} units</span>
                          <span className="text-slate-400 ml-2">by {m.performed_by}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-border bg-slate-50 text-right">
              <button
                onClick={() => { setSelectedProduct(null); setProductDetail(null); }}
                className="px-4 py-1.5 bg-navy text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
