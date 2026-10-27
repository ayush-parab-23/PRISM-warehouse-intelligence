import { Router } from 'express';
import { Database } from '../db/database.js';

export const complianceRouter = Router();

complianceRouter.get('/', (req, res) => {
  const records = Database.queryAll(`
    SELECT r.*, c.name as customer_name, c.code as customer_code
    FROM compliance_records r
    JOIN customers c ON r.customer_id = c.id
    ORDER BY r.expiry_date ASC
  `);

  const auditSummary = {
    totalRecords: records.length,
    validRecords: records.filter((r: any) => r.status === 'VALID').length,
    warningRecords: records.filter((r: any) => r.status === 'WARNING_EXPIRING_SOON').length,
    expiredRecords: records.filter((r: any) => r.status === 'EXPIRED').length,
    lastAuditDate: '2026-10-28 08:05:00',
    auditor: 'Compliance Agent (CMP-07)'
  };

  res.json({ records, auditSummary });
});

complianceRouter.get('/audit-logs', (req, res) => {
  const logs = Database.queryAll(`
    SELECT l.*, u.full_name as user_name
    FROM audit_logs l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT 50
  `);
  res.json({ logs });
});
