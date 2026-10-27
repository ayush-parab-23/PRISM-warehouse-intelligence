import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePrismWebSocket } from '../../context/WebSocketContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Radio, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  X,
  UserCheck,
  Building
} from 'lucide-react';

interface TopbarProps {
  pageTitle: string;
}

export const Topbar: React.FC<TopbarProps> = ({ pageTitle }) => {
  const { currentUser, availableUsers, switchUser, isManager } = useAuth();
  const { isConnected, eventsLog } = usePrismWebSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Today (28 Oct 2026)');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (isManager) {
      navigate(`/manager/inventory?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/employee/tasks?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const dates = [
    'Today (28 Oct 2026)',
    'Yesterday (27 Oct 2026)',
    'Last 7 Days',
    'Month-to-Date (October)'
  ];

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      {/* Left: Page Title & Facility Tag */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-navy tracking-tight">{pageTitle}</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Building className="w-3 h-3 text-slate-400" />
            <span>Kharghar Warehouse, Navi Mumbai</span>
          </div>
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, Product, Rack Bin, Order, or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded bg-canvas hover:bg-slate-100/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal transition-all text-slate-800 placeholder:text-slate-400 font-medium"
          />
        </div>
      </form>

      {/* Right Controls: Date Filter, Live Freshness, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Date Range Selector */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-border rounded bg-canvas hover:bg-slate-100 text-slate-600 font-medium transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>
          {dateDropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded shadow-elevated z-30 py-1 text-xs">
              {dates.map(d => (
                <button
                  key={d}
                  onClick={() => { setDateRange(d); setDateDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 font-medium ${
                    dateRange === d ? 'text-teal bg-teal-50/50' : 'text-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Freshness & WebSocket Connection Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600">
          <span className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-teal animate-pulse' : 'bg-amber'
          }`} />
          <span className="hidden sm:inline">{isConnected ? 'Live Telemetry' : 'Reconnecting...'}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-500 hover:text-navy hover:bg-slate-100 rounded relative transition-colors"
            title="Real-Time Event Feed"
          >
            <Bell className="w-4 h-4" />
            {eventsLog.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber rounded-full ring-2 ring-surface" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-elevated z-40 p-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
                <span className="font-bold text-navy">Live Domain Events</span>
                <span className="text-[10px] text-slate-400 tabular-nums font-mono">{eventsLog.length} events</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {eventsLog.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-3 text-center">No new domain events.</p>
                ) : (
                  eventsLog.slice(0, 8).map((evt, idx) => (
                    <div key={idx} className="p-2 rounded bg-canvas border border-border/60 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-slate-700 mb-0.5">
                        <span className="text-teal font-mono">{evt.type}</span>
                        <span className="text-[9px] text-slate-400 tabular-nums">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-600 truncate">{JSON.stringify(evt.payload)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-navy text-white text-[11px] font-bold flex items-center justify-center">
              {currentUser.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[120px] truncate">
              {currentUser.full_name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-elevated z-40 py-2 text-xs">
              <div className="px-3 pb-2 border-b border-border">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Logged In As</span>
                <p className="font-bold text-navy text-sm">{currentUser.full_name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-semibold text-teal capitalize">{currentUser.role}</span>
                  <span>•</span>
                  <span>Badge {currentUser.badge_number}</span>
                </div>
              </div>

              <div className="pt-2 px-1">
                <span className="px-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Switch Active Role Profile
                </span>
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowUserDropdown(false);
                      if (u.role === 'manager') navigate('/manager/overview');
                      else navigate('/employee/tasks');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-slate-50 text-left transition-colors ${
                      currentUser.id === u.id ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs">{u.full_name}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{u.role} ({u.shift})</span>
                    </div>
                    {currentUser.id === u.id && <UserCheck className="w-3.5 h-3.5 text-teal" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
