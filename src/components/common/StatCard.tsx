import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Package, 
  Boxes, 
  AlertTriangle, 
  Archive, 
  Truck, 
  Clock, 
  CheckCircle2,
  Cpu,
  Layers,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  period?: string;
  iconName?: string;
  trend?: {
    value: string;
    type: 'up' | 'down' | 'neutral';
    label?: string;
  };
  highlight?: 'normal' | 'amber' | 'danger' | 'teal';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtext,
  period = 'Today',
  iconName,
  trend,
  highlight = 'normal',
  onClick
}) => {
  const getIcon = () => {
    switch (iconName) {
      case 'Activity': return <Activity className="w-4 h-4 text-teal" />;
      case 'Package': return <Package className="w-4 h-4 text-slate-500" />;
      case 'Boxes': return <Boxes className="w-4 h-4 text-teal" />;
      case 'AlertTriangle': return <AlertTriangle className="w-4 h-4 text-amber" />;
      case 'Archive': return <Archive className="w-4 h-4 text-slate-500" />;
      case 'Truck': return <Truck className="w-4 h-4 text-slate-500" />;
      case 'Clock': return <Clock className="w-4 h-4 text-slate-500" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-4 h-4 text-teal" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-amber" />;
      case 'Layers': return <Layers className="w-4 h-4 text-slate-500" />;
      case 'ArrowDownLeft': return <ArrowDownLeft className="w-4 h-4 text-teal" />;
      case 'ArrowUpRight': return <ArrowUpRight className="w-4 h-4 text-slate-500" />;
      default: return null;
    }
  };

  const getBorderColor = () => {
    if (highlight === 'amber') return 'border-amber/40 bg-amber-50/20';
    if (highlight === 'danger') return 'border-danger/40 bg-danger-50/20';
    if (highlight === 'teal') return 'border-teal/40 bg-teal-50/20';
    return 'border-border bg-surface';
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-lg border shadow-card transition-all ${getBorderColor()} ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-elevated' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 tracking-tight uppercase">{title}</span>
        {iconName && (
          <div className="p-1.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-bold text-navy tabular-nums tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
        <span className="text-slate-500 truncate">{subtext || period}</span>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 font-semibold tabular-nums ${
            trend.type === 'up' ? 'text-teal' : trend.type === 'down' ? 'text-danger' : 'text-slate-500'
          }`}>
            {trend.type === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend.type === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend.type === 'neutral' && <Minus className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
