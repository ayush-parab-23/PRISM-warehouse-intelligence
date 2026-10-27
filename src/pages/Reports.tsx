import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { FileText, Eye, Download } from 'lucide-react';

export const Reports: React.FC = () => {
  const reportsList = [
    {
      id: 'rep-1',
      title: 'Inventory Health Report',
      description: 'Contains current stock buffers, safety threshold audits, and dead stock metrics.',
      format: 'PDF',
      size: '1.4 MB',
      compiled: 'Today, 10:00 AM'
    },
    {
      id: 'rep-2',
      title: 'Demand Forecasting Summary',
      description: 'Historical versus projected ordering trends, accuracy benchmarks, and category velocity.',
      format: 'PDF',
      size: '2.1 MB',
      compiled: 'Yesterday, 6:30 PM'
    },
    {
      id: 'rep-3',
      title: 'Procurement & Vendor Pricing Report',
      description: 'Supplier contract scorecards, optimized purchase volumes, and potential savings evaluations.',
      format: 'PDF',
      size: '1.1 MB',
      compiled: '2 days ago'
    },
    {
      id: 'rep-4',
      title: 'Operational Workflow Log',
      description: 'Receiving dock logs, picker queue velocities, pack rates, and outbound bay dispatch metrics.',
      format: 'PDF',
      size: '950 KB',
      compiled: 'Today, 8:15 AM'
    }
  ];

  const handleAction = (reportTitle: string, actionType: 'view' | 'download') => {
    alert(`DEMO ACTION: Standard ${actionType} triggered for ${reportTitle}. (Actual PDF files require a working backend server).`);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Warehouse Intelligence Reports" 
        subtitle="Access compiled intelligence summaries formatted as clean PDF reports." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((report) => (
          <div 
            key={report.id} 
            className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex items-start gap-4"
          >
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-primary shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-text-primary">{report.title}</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{report.description}</p>
              
              <div className="flex items-center gap-4 text-[10px] text-text-secondary mt-3.5 font-semibold bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span>Format: <strong>{report.format}</strong></span>
                <span>Size: <strong>{report.size}</strong></span>
                <span>Compiled: <strong>{report.compiled}</strong></span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleAction(report.title, 'view')}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-text-primary rounded-lg text-[11px] font-bold border border-border transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View PDF
                </button>
                <button
                  onClick={() => handleAction(report.title, 'download')}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-primary rounded-lg text-[11px] font-bold border border-border transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
