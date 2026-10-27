import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { User, Warehouse, Bell, Info, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const [profile, setProfile] = useState({
    name: 'Ayush Parab',
    email: 'ayush.parab@prism.ai',
    role: 'Warehouse Manager'
  });

  const [warehouse, setWarehouse] = useState({
    name: 'Main Electronics WH - Zone A',
    location: 'New Delhi, India',
    size: '25,000 sq ft'
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    criticalStock: true,
    dailyDigest: false,
    supplierUpdates: true
  });

  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="System Settings" 
          subtitle="Configure profile parameters, notifications, and review system configuration details." 
        />
        {showSavedMsg && (
          <div className="px-3.5 py-1.5 bg-green-50 text-success border border-green-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
            Settings updated locally
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Profile Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="text-text-secondary block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all text-text-primary"
              />
            </div>
            <div>
              <label className="text-text-secondary block mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all text-text-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-text-secondary block mb-1">System Access Level</label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full px-3 py-2 border border-border rounded-lg bg-slate-100 text-text-secondary cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Warehouse Information */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Warehouse className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Warehouse Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="text-text-secondary block mb-1">Warehouse Name</label>
              <input
                type="text"
                value={warehouse.name}
                onChange={(e) => setWarehouse({ ...warehouse, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all text-text-primary"
              />
            </div>
            <div>
              <label className="text-text-secondary block mb-1">Location Coordinates</label>
              <input
                type="text"
                value={warehouse.location}
                onChange={(e) => setWarehouse({ ...warehouse, location: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all text-text-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-text-secondary block mb-1">Floor Operations Area</label>
              <input
                type="text"
                value={warehouse.size}
                onChange={(e) => setWarehouse({ ...warehouse, size: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Notification Preferences</h3>
          </div>
          <div className="space-y-3 text-xs font-medium text-text-primary">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.lowStock}
                onChange={(e) => setNotifications({ ...notifications, lowStock: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:outline-none"
              />
              <span>Inbound low stock thresholds (Inventory Agent alerts)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.criticalStock}
                onChange={(e) => setNotifications({ ...notifications, criticalStock: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:outline-none"
              />
              <span>Critical depletion warnings (out-of-stock risk)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.dailyDigest}
                onChange={(e) => setNotifications({ ...notifications, dailyDigest: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:outline-none"
              />
              <span>End-of-day operations aggregate summary email</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.supplierUpdates}
                onChange={(e) => setNotifications({ ...notifications, supplierUpdates: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:outline-none"
              />
              <span>Supplier price changes and reliability score re-evaluations</span>
            </label>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Info className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">System Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">App Version</span>
              <span className="text-text-primary mt-1 block">1.0.0 (MVP)</span>
            </div>
            
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Intelligence Pipeline</span>
              <span className="text-success mt-1 block">Multi-Agent Core Enabled</span>
            </div>
            
            <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Backend Endpoint (FastAPI)</span>
              <span className="text-text-secondary font-mono mt-1 block break-all">
                http://localhost:8000/api/v1 <span className="text-danger font-semibold bg-red-50 border border-red-100 rounded px-1.5 py-0.5 ml-2 font-sans">Offline (Demo Data Active)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Save className="w-4.5 h-4.5" />
          Save System Preferences
        </button>
      </form>
    </div>
  );
};
