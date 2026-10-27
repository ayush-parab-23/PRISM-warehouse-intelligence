import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BrainCircuit,
  Map,
  Boxes,
  Truck,
  Building2,
  Users,
  LineChart,
  ShieldCheck,
  FileText,
  Settings as SettingsIcon,
  CheckSquare,
  ArrowDownToLine,
  SearchCheck,
  MoveRight,
  PackageCheck,
  Send,
  ClipboardList,
  History,
  ArrowLeftRight
} from 'lucide-react';

interface MenuItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { currentUser, isManager, availableUsers, switchUser } = useAuth();
  const navigate = useNavigate();

  const managerMenuItems: MenuItem[] = [
    { name: 'Overview', path: '/manager/overview', icon: LayoutDashboard },
    { name: 'AI Command Center', path: '/manager/agents', icon: BrainCircuit, badge: '7 Agents' },
    { name: 'Interactive Map', path: '/manager/map', icon: Map, badge: 'Digital Twin' },
    { name: 'Inventory Explorer', path: '/manager/inventory', icon: Boxes },
    { name: 'Inbound & Outbound', path: '/manager/logistics', icon: Truck },
    { name: 'Customers & SLA', path: '/manager/customers', icon: Building2 },
    { name: 'Workforce & Tasks', path: '/manager/workforce', icon: Users },
    { name: 'Analytics & Forecasts', path: '/manager/analytics', icon: LineChart },
    { name: 'Compliance & Safety', path: '/manager/compliance', icon: ShieldCheck },
    { name: 'Reports & Audits', path: '/manager/reports', icon: FileText },
    { name: 'Settings & Logs', path: '/manager/settings', icon: SettingsIcon },
  ];

  const employeeMenuItems: MenuItem[] = [
    { name: 'My Tasks', path: '/employee/tasks', icon: CheckSquare },
    { name: 'Receive Goods', path: '/employee/receive', icon: ArrowDownToLine },
    { name: 'Inspection & QC', path: '/employee/inspect', icon: SearchCheck },
    { name: 'Putaway Stock', path: '/employee/putaway', icon: MoveRight },
    { name: 'Pick & Pack', path: '/employee/pick-pack', icon: PackageCheck },
    { name: 'Dispatch Cargo', path: '/employee/dispatch', icon: Send },
    { name: 'Stock Count', path: '/employee/stock-count', icon: ClipboardList },
    { name: 'Activity History', path: '/employee/history', icon: History },
  ];

  const menuItems = isManager ? managerMenuItems : employeeMenuItems;

  const handlePortalSwitch = () => {
    if (isManager) {
      // Switch to employee user
      const emp = availableUsers.find(u => u.role === 'employee');
      if (emp) {
        switchUser(emp.id);
        navigate('/employee/tasks');
      }
    } else {
      // Switch to manager user
      const mgr = availableUsers.find(u => u.role === 'manager');
      if (mgr) {
        switchUser(mgr.id);
        navigate('/manager/overview');
      }
    }
  };

  return (
    <aside className="w-64 bg-navy text-slate-300 h-screen flex flex-col fixed left-0 top-0 z-30 select-none border-r border-navy-700/50">
      {/* Brand Header */}
      <div className="p-4 border-b border-navy-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-teal rounded flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">PRISM</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal/20 text-teal-400 rounded border border-teal-500/30 uppercase">
                v2.4
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5 tracking-tight">
              Kharghar Electronics Node
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Role Switcher Banner */}
      <div className="px-3 pt-3">
        <div className="bg-navy-900/80 border border-navy-700 rounded-lg p-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              Active Workspace
            </span>
            <span className="text-xs font-semibold text-white">
              {isManager ? 'Manager Portal' : 'Employee Portal'}
            </span>
          </div>
          <button
            onClick={handlePortalSwitch}
            title={`Switch to ${isManager ? 'Employee Portal' : 'Manager Portal'}`}
            className="p-1.5 bg-navy-700 hover:bg-teal text-slate-300 hover:text-white rounded transition-colors text-xs flex items-center gap-1"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {isManager ? 'Management & Intelligence' : 'Warehouse Operations'}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-700/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-navy-950/60 text-teal-300 border border-teal-500/20">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-3 border-t border-navy-700 bg-navy-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded bg-teal/20 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser.full_name}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="capitalize">{currentUser.role}</span>
                <span>•</span>
                <span>{currentUser.shift}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
