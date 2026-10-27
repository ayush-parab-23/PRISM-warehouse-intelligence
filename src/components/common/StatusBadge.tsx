import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      // Healthy / Approved / Completed
      case 'HEALTHY':
      case 'COMPLETED':
      case 'APPROVED':
      case 'VALID':
      case 'ARRIVED_DOCK':
      case 'PACKED_READY':
        return 'bg-teal-50 text-teal-700 border-teal-200';

      // Warning / Low Stock / Waiting Approval
      case 'LOW STOCK':
      case 'LOW_STOCK':
      case 'WAITING_APPROVAL':
      case 'WAITING FOR APPROVAL':
      case 'WARNING_EXPIRING_SOON':
      case 'PENDING_APPROVAL':
      case 'INSPECTING':
      case 'PUTAWAY_PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      // Critical / Damaged / Failed / Rejected
      case 'CRITICAL':
      case 'DEAD STOCK':
      case 'FAILED':
      case 'REJECTED':
      case 'EXPIRED':
      case 'URGENT':
      case 'DAMAGED':
        return 'bg-danger-50 text-danger-700 border-danger-200';

      // In Progress / Running / Normal
      case 'RUNNING':
      case 'IN_PROGRESS':
      case 'PICKING':
      case 'PACKING':
      case 'HIGH':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      // Idle / Queued / Pending
      case 'IDLE':
      case 'QUEUED':
      case 'PENDING':
      case 'PENDING_PICK':
      case 'NORMAL':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getLabel = () => {
    return status.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded border uppercase tracking-wider ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${getStyle()}`}
    >
      {getLabel()}
    </span>
  );
};
