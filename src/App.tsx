import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

// Manager Portal Pages
import { OverviewPage } from './pages/manager/OverviewPage';
import { AgentsPage } from './pages/manager/AgentsPage';
import { WarehouseMapPage } from './pages/manager/WarehouseMapPage';
import { InventoryPage } from './pages/manager/InventoryPage';
import { LogisticsPage } from './pages/manager/LogisticsPage';
import { CustomersPage } from './pages/manager/CustomersPage';
import { WorkforcePage } from './pages/manager/WorkforcePage';
import { AnalyticsPage } from './pages/manager/AnalyticsPage';
import { CompliancePage } from './pages/manager/CompliancePage';
import { ReportsPage } from './pages/manager/ReportsPage';
import { SettingsPage } from './pages/manager/SettingsPage';

// Employee Portal Pages
import { MyTasksPage } from './pages/employee/MyTasksPage';
import { ReceiveGoodsPage } from './pages/employee/ReceiveGoodsPage';
import { InspectionPage } from './pages/employee/InspectionPage';
import { PutawayPage } from './pages/employee/PutawayPage';
import { PickPackPage } from './pages/employee/PickPackPage';
import { DispatchPage } from './pages/employee/DispatchPage';
import { StockCountPage } from './pages/employee/StockCountPage';
import { ActivityHistoryPage } from './pages/employee/ActivityHistoryPage';

import './App.css';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    // Manager
    if (pathname.includes('/manager/overview')) return 'Overview Dashboard';
    if (pathname.includes('/manager/agents')) return 'AI Multi-Agent Command Center';
    if (pathname.includes('/manager/map')) return 'Interactive Warehouse Digital Twin';
    if (pathname.includes('/manager/inventory')) return 'Inventory Explorer & Balances';
    if (pathname.includes('/manager/logistics')) return 'Inbound & Outbound Logistics';
    if (pathname.includes('/manager/customers')) return 'Customer Portfolios & SLAs';
    if (pathname.includes('/manager/workforce')) return 'Workforce & Task Allocation';
    if (pathname.includes('/manager/analytics')) return 'Analytics & Demand Forecasts';
    if (pathname.includes('/manager/compliance')) return 'Compliance & Certifications';
    if (pathname.includes('/manager/reports')) return 'Compiled Warehouse Reports';
    if (pathname.includes('/manager/settings')) return 'System Settings & Audit Logs';

    // Employee
    if (pathname.includes('/employee/tasks')) return 'My Operational Tasks';
    if (pathname.includes('/employee/receive')) return 'Receive Inbound Goods';
    if (pathname.includes('/employee/inspect')) return 'Quality Inspection & Verification';
    if (pathname.includes('/employee/putaway')) return 'Putaway Stock to Bins';
    if (pathname.includes('/employee/pick-pack')) return 'Pick & Pack Operations';
    if (pathname.includes('/employee/dispatch')) return 'Dispatch Cargo';
    if (pathname.includes('/employee/stock-count')) return 'Physical Stock Count';
    if (pathname.includes('/employee/history')) return 'Operational Activity History';

    return 'PRISM Intelligence Platform';
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Fixed Deep Navy Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar pageTitle={getPageTitle(location.pathname)} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

const RootRedirect: React.FC = () => {
  const { isManager } = useAuth();
  return <Navigate to={isManager ? '/manager/overview' : '/employee/tasks'} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <LayoutWrapper>
            <Routes>
              {/* Root Redirect based on active role */}
              <Route path="/" element={<RootRedirect />} />

              {/* Manager Portal Routes */}
              <Route path="/manager/overview" element={<OverviewPage />} />
              <Route path="/manager/agents" element={<AgentsPage />} />
              <Route path="/manager/map" element={<WarehouseMapPage />} />
              <Route path="/manager/inventory" element={<InventoryPage />} />
              <Route path="/manager/logistics" element={<LogisticsPage />} />
              <Route path="/manager/customers" element={<CustomersPage />} />
              <Route path="/manager/workforce" element={<WorkforcePage />} />
              <Route path="/manager/analytics" element={<AnalyticsPage />} />
              <Route path="/manager/compliance" element={<CompliancePage />} />
              <Route path="/manager/reports" element={<ReportsPage />} />
              <Route path="/manager/settings" element={<SettingsPage />} />

              {/* Employee Portal Routes */}
              <Route path="/employee/tasks" element={<MyTasksPage />} />
              <Route path="/employee/receive" element={<ReceiveGoodsPage />} />
              <Route path="/employee/inspect" element={<InspectionPage />} />
              <Route path="/employee/putaway" element={<PutawayPage />} />
              <Route path="/employee/pick-pack" element={<PickPackPage />} />
              <Route path="/employee/dispatch" element={<DispatchPage />} />
              <Route path="/employee/stock-count" element={<StockCountPage />} />
              <Route path="/employee/history" element={<ActivityHistoryPage />} />

              {/* Legacy Backward Compatibility Routes */}
              <Route path="/dashboard" element={<Navigate to="/manager/overview" replace />} />
              <Route path="/inventory" element={<Navigate to="/manager/inventory" replace />} />
              <Route path="/products" element={<Navigate to="/manager/inventory" replace />} />
              <Route path="/operations" element={<Navigate to="/manager/logistics" replace />} />
              <Route path="/ai-insights" element={<Navigate to="/manager/agents" replace />} />
              <Route path="/ai-insights/*" element={<Navigate to="/manager/agents" replace />} />
              <Route path="/forecasting" element={<Navigate to="/manager/analytics" replace />} />
              <Route path="/procurement" element={<Navigate to="/manager/agents" replace />} />
              <Route path="/reports" element={<Navigate to="/manager/reports" replace />} />
              <Route path="/settings" element={<Navigate to="/manager/settings" replace />} />

              {/* Wildcard Fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </LayoutWrapper>
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
}
