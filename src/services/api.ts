/**
 * PRISM Platform - Authoritative API Client
 */

const API_BASE = '/api';

export async function fetchJson<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth & Profiles
  getUsers: () => fetchJson<{ users: any[] }>('/auth/users'),
  login: (username: string) => fetchJson<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username }),
  }),

  // Dashboard & Analytics
  getDashboardOverview: () => fetchJson<any>('/dashboard/overview'),
  getRecentActivity: () => fetchJson<{ activities: any[] }>('/dashboard/recent-activity'),

  // Inventory & Products
  getProducts: (params?: { category?: string; customerId?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.customerId) searchParams.set('customerId', params.customerId);
    if (params?.search) searchParams.set('search', params.search);
    return fetchJson<{ products: any[] }>(`/inventory/products?${searchParams.toString()}`);
  },
  getProductDetail: (id: string) => fetchJson<any>(`/inventory/products/${id}`),
  getMovements: () => fetchJson<{ movements: any[] }>('/inventory/movements'),

  // Warehouse Map & Zones
  getZones: () => fetchJson<{ zones: any[] }>('/warehouse/zones'),
  getZoneDetail: (id: string) => fetchJson<any>(`/warehouse/zones/${id}`),
  getOverlays: () => fetchJson<any>('/warehouse/overlays'),

  // Employee Operations
  getTasks: (params?: { userId?: string; status?: string; taskType?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.taskType) searchParams.set('taskType', params.taskType);
    return fetchJson<{ tasks: any[] }>(`/operations/tasks?${searchParams.toString()}`);
  },
  updateTaskStatus: (id: string, status: string, userId?: string) => 
    fetchJson<any>(`/operations/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, userId }),
    }),
  getShipments: () => fetchJson<{ shipments: any[] }>('/operations/shipments'),
  getOrders: () => fetchJson<{ orders: any[]; lines: any[] }>('/operations/orders'),

  receiveGoods: (data: any) => fetchJson<any>('/operations/receive', { method: 'POST', body: JSON.stringify(data) }),
  submitInspection: (data: any) => fetchJson<any>('/operations/inspect', { method: 'POST', body: JSON.stringify(data) }),
  putawayStock: (data: any) => fetchJson<any>('/operations/putaway', { method: 'POST', body: JSON.stringify(data) }),
  pickStock: (data: any) => fetchJson<any>('/operations/pick', { method: 'POST', body: JSON.stringify(data) }),
  packOrder: (data: any) => fetchJson<any>('/operations/pack', { method: 'POST', body: JSON.stringify(data) }),
  dispatchOrder: (data: any) => fetchJson<any>('/operations/dispatch', { method: 'POST', body: JSON.stringify(data) }),
  submitStockCount: (data: any) => fetchJson<any>('/operations/count', { method: 'POST', body: JSON.stringify(data) }),

  // Multi-Agent System
  getAgents: () => fetchJson<{ agents: any[] }>('/agents/agents'),
  getAgentRuns: () => fetchJson<{ runs: any[] }>('/agents/runs'),
  getRunDetail: (id: string) => fetchJson<any>(`/agents/runs/${id}`),
  submitAgentCommand: (data: { agentId?: string; commandType: string; userPrompt: string; userId?: string }) =>
    fetchJson<any>('/agents/command', { method: 'POST', body: JSON.stringify(data) }),
  getRecommendations: (params?: { status?: string; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.category) searchParams.set('category', params.category);
    return fetchJson<{ recommendations: any[] }>(`/agents/recommendations?${searchParams.toString()}`);
  },
  resolveApproval: (approvalId: string, data: { decision: 'APPROVED' | 'REJECTED'; notes?: string; userId?: string }) =>
    fetchJson<any>(`/agents/approvals/${approvalId}/resolve`, { method: 'POST', body: JSON.stringify(data) }),

  // Customers & Contracts
  getCustomers: () => fetchJson<{ customers: any[] }>('/customers'),
  getCustomerDetail: (id: string) => fetchJson<any>(`/customers/${id}`),

  // Workforce
  getWorkforce: () => fetchJson<{ staff: any[]; taskStats: any[] }>('/workforce'),

  // Compliance & Audit
  getCompliance: () => fetchJson<{ records: any[]; auditSummary: any }>('/compliance'),
  getAuditLogs: () => fetchJson<{ logs: any[] }>('/compliance/audit-logs'),
};
