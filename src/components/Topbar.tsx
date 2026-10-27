import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown } from 'lucide-react';

interface TopbarProps {
  pageTitle: string;
}

export const Topbar: React.FC<TopbarProps> = ({ pageTitle }) => {
  const [warehouse, setWarehouse] = useState('Main Electronics WH - Zone A');
  const warehouses = [
    'Main Electronics WH - Zone A',
    'Bulk Storage Bay - Zone B',
    'Accessories Locker - Zone C'
  ];
  
  const [showWHMenu, setShowWHMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const whRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (whRef.current && !whRef.current.contains(event.target as Node)) {
        setShowWHMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-6">
        <h2 className="text-base font-bold text-text-primary">{pageTitle}</h2>
        
        {/* Warehouse Selector */}
        <div className="relative" ref={whRef}>
          <button
            onClick={() => setShowWHMenu(!showWHMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-border rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary transition-all"
          >
            <span>{warehouse}</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
          </button>
          
          {showWHMenu && (
            <div className="absolute left-0 mt-1.5 w-56 bg-card border border-border rounded-lg shadow-lg z-30 py-1 text-xs">
              {warehouses.map((wh) => (
                <button
                  key={wh}
                  onClick={() => {
                    setWarehouse(wh);
                    setShowWHMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 font-medium ${
                    warehouse === wh ? 'text-primary bg-blue-50/50' : 'text-text-primary'
                  }`}
                >
                  {wh}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-slate-50 rounded-lg relative transition-all">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-card animate-pulse"></span>
        </button>

        {/* Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center font-bold text-xs text-primary">
              AP
            </div>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-1.5 w-48 bg-card border border-border rounded-lg shadow-lg z-30 py-1 text-xs">
              <div className="px-3.5 py-2 border-b border-border">
                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Logged in as</span>
                <strong className="text-text-primary font-bold">Ayush Parab</strong>
              </div>
              <button 
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-text-primary font-medium"
              >
                My Profile
              </button>
              <button 
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-text-primary font-medium"
              >
                Warehouse Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
