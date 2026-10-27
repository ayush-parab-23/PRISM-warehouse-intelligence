import type { DetailedAgentReport } from '../components/agents/AgentReportModal';

export class ReportGenerator {
  /**
   * Generates a comprehensive executive report based on agent role or recommendation
   */
  public static getReportForAgent(agentCode: string, context?: any): DetailedAgentReport {
    switch (agentCode) {
      case 'STR-03':
      case 'zone-b':
      case 'zone-c':
      case 'zone-d':
        return {
          reportId: `PRISM-REP-2026-STR-${Date.now().toString().slice(-4)}`,
          title: 'Warehouse Space & Dynamic Slotting Rebalancing Audit',
          agentName: 'Storage Optimization Agent',
          agentCode: 'STR-03',
          timestamp: '2026-10-28 08:30:00 IST',
          classification: 'OPERATIONAL RESTRICTED • LEVEL-2 CLEARANCE',
          facility: 'Kharghar Central DC, Sector 23, Navi Mumbai',
          executiveSummary:
            'A telemetry scan across 19 active storage zones identified acute cubic volume saturation in Zone B (Smartphones & Mobile, 88% utilized) and Zone D (High-Value Vault, 91% utilized). Current inbound receipts for Nexus Mobile Corp will exhaust remaining rack slots within 18 operational hours. A phased inter-zone pallet rebalancing to Zone G1 (Overflow Staging) is recommended to protect picking velocity and maintain 1.8m safety clearance corridors.',
          kpis: [
            { label: 'Congested Zones', value: '2 Zones', subtext: 'Zones B & D > 85%', trendType: 'danger' },
            { label: 'Recoverable Volume', value: '142.5 m³', subtext: 'Usable cubic capacity', trendType: 'up' },
            { label: 'Pallet Relocations', value: '48 Pallets', subtext: 'Target bins designated', trendType: 'neutral' },
            { label: 'Labor Estimate', value: '3.5 Hours', subtext: '2 MHE forklift operators', trendType: 'neutral' }
          ],
          rootCauseAnalysis: [
            'Nexus Mobile smartphone arrivals exceeded forecasted 14-day velocity by 28% following regional festive demand in Mumbai MMR.',
            'High-Value Vault (Zone D) is holding slow-moving discrete server GPUs that should be transferred to contracted reserve racks in Zone E2.',
            'Aisle B-03 staging buffer is currently impeded by 8 unpacked buffer totes, reducing forklift turning radius below safety thresholds.'
          ],
          evidenceData: [
            {
              sku: 'ELC-NEX-006',
              productName: 'Samsung Galaxy S24 Ultra 256GB',
              customer: 'Nexus Mobile Corp',
              currentLocation: 'bin-b2-1-1-1',
              recommendedAction: 'Rebalance 30 cartons to Overflow Bay G1-R02',
              onHand: 140,
              safetyBuffer: 100,
              variance: 40,
              severity: 'HIGH'
            },
            {
              sku: 'ELC-NEX-007',
              productName: 'Apple iPhone 15 Pro Max 256GB',
              customer: 'Nexus Mobile Corp',
              currentLocation: 'bin-b2-1-2-1',
              recommendedAction: 'Consolidate partial pallets into bin-b2-1-2-2',
              onHand: 185,
              safetyBuffer: 120,
              variance: 65,
              severity: 'CRITICAL'
            },
            {
              sku: 'ELC-ELE-023',
              productName: 'ElectraCore 4090 GPU Accelerator',
              customer: 'ElectraCore Components',
              currentLocation: 'bin-d2-1-2-1',
              recommendedAction: 'Move 20 units to Reserved Storage Zone E1',
              onHand: 130,
              safetyBuffer: 50,
              variance: 80,
              severity: 'HIGH'
            }
          ],
          phasedPlan: [
            {
              phase: 'Phase 1: Immediate Safety Staging',
              timeframe: '0 - 2 Hours',
              actions: [
                'Halt ad-hoc pallet drops in Aisle B-03 to restore 1.8m forklift passage.',
                'Generate automated putaway task for Operator Rajesh Nair to clear 8 staging buffer totes into Bin B2-R01-S02.'
              ]
            },
            {
              phase: 'Phase 2: High-Density Relocation',
              timeframe: '2 - 6 Hours',
              actions: [
                'Transfer 48 pallets of Galaxy S24 Ultra to Overflow Zone G1-R02-B01 using Reach Truck RT-02.',
                'Scan and record each serialized movement via Employee Putaway console to update database balances in WAL mode.'
              ]
            },
            {
              phase: 'Phase 3: Space Recovery Audit',
              timeframe: 'Within 24 Hours',
              actions: [
                'Recalculate Kharghar facility cubic utilization metrics via Storage Agent telemetry.',
                'Restore Zone B utilization baseline to 72% optimal operating capacity.'
              ]
            }
          ],
          complianceCheck: [
            { rule: 'OSHA / Kharghar Industrial Safety Corridor Clearance', status: 'ATTENTION', notes: 'Restore 1.8m minimum aisle clearance' },
            { rule: 'Anti-Static ESD Floor Grounding Verification', status: 'PASSED', notes: 'Zone B & G1 ESD pads certified' },
            { rule: 'Customer Asset Segregation (Nexus vs ElectraCore)', status: 'PASSED', notes: 'Zero cross-mingling detected' }
          ],
          approvalRequired: true,
          approvalId: 'app-str-001',
          approvalStatus: 'PENDING'
        };

      case 'INV-02':
      default:
        return {
          reportId: `PRISM-REP-2026-INV-${Date.now().toString().slice(-4)}`,
          title: 'Autonomous Stockout Prevention & Replenishment Intelligence Report',
          agentName: 'Inventory Intelligence Agent',
          agentCode: 'INV-02',
          timestamp: '2026-10-28 08:35:00 IST',
          classification: 'OPERATIONAL CRITICAL • EXECUTIVE DISTRIBUTION',
          facility: 'Kharghar Central DC, Sector 23, Navi Mumbai',
          executiveSummary:
            'A systematic audit of all 24 contracted electronics SKUs against historical 30-day consumption velocity revealed critical low-stock conditions on 2 high-velocity SKUs (Logitech MX Master 3S and Anker MagGo Power Banks). Available stock levels have dropped below reorder thresholds due to sustained corporate workstation demand. Stockout is projected within 48 to 72 operational hours unless expedited purchase orders are issued.',
          kpis: [
            { label: 'Deficit SKUs', value: '2 Lines', subtext: 'Below minimum safety buffer', trendType: 'danger' },
            { label: 'Capital at Risk', value: '₹14.8 Lakhs', subtext: 'Potential unfulfilled SLA revenue', trendType: 'danger' },
            { label: 'Runout Projection', value: '48 Hours', subtext: 'At current pick velocity', trendType: 'danger' },
            { label: 'Recommended Intake', value: '250 Units', subtext: 'Expedited PO replenishment', trendType: 'up' }
          ],
          rootCauseAnalysis: [
            'Logitech MX Master 3S experienced unexpected 300-unit bulk draw for Tata Consultancy Services enterprise deployment at Olympus Thane.',
            'Supplier lead time from Logitech Far East increased from 4 to 9 days due to customs clearance hold at Nhava Sheva (JNPT) Port.',
            'Anker 10000mAh Power Banks depleted rapidly due to bundled festival promotions by ElectraCore Components.'
          ],
          evidenceData: [
            {
              sku: 'ELC-ZEN-012',
              productName: 'Logitech MX Master 3S Performance Mouse',
              customer: 'Zenith Peripherals Inc',
              currentLocation: 'bin-c3-1-1-1',
              recommendedAction: 'Issue expedited PO for 150 units to Logitech India',
              onHand: 28,
              safetyBuffer: 50,
              variance: -22,
              severity: 'CRITICAL'
            },
            {
              sku: 'ELC-ELE-024',
              productName: 'Anker MagGo 10000mAh Qi2 Power Bank',
              customer: 'ElectraCore Components',
              currentLocation: 'bin-c2-2-2-1',
              recommendedAction: 'Issue urgent replenishment PO for 100 units',
              onHand: 32,
              safetyBuffer: 60,
              variance: -28,
              severity: 'CRITICAL'
            },
            {
              sku: 'ELC-APX-001',
              productName: 'Lenovo ThinkPad X1 Carbon Gen 12',
              customer: 'Apex Electronics Ltd',
              currentLocation: 'bin-a2-1-1-1',
              recommendedAction: 'Healthy stock buffer; maintain normal monitoring',
              onHand: 155,
              safetyBuffer: 80,
              variance: 75,
              severity: 'OPTIMAL'
            }
          ],
          phasedPlan: [
            {
              phase: 'Phase 1: Immediate Allocation Rationing',
              timeframe: 'Immediate',
              actions: [
                'Flag SKU ELC-ZEN-012 in WMS to prioritize contracted enterprise SLAs over non-contractual orders.',
                'Lock remaining 28 units exclusively for pending Tata Consultancy Services outbound wave SO-ZEN-1102.'
              ]
            },
            {
              phase: 'Phase 2: Expedited Replenishment PO',
              timeframe: '0 - 4 Hours',
              actions: [
                'Submit electronic Purchase Order PO-ZEN-2026-EXP-01 for 150 units to Logitech regional supply hub in Bhiwandi.',
                'Request dedicated surface transport with guaranteed 24-hour dock arrival at Kharghar Receiving Bay 1.'
              ]
            },
            {
              phase: 'Phase 3: Threshold Recalibration',
              timeframe: 'Next 7 Days',
              actions: [
                'Increase dynamic reorder threshold from 50 to 80 units during Q4 peak demand period.',
                'Integrate supplier JNPT customs clearance feed into Inbound & Outbound Agent tracking.'
              ]
            }
          ],
          complianceCheck: [
            { rule: 'BIS CRS Registration (R-41001234)', status: 'PASSED', notes: 'Valid through Dec 2027' },
            { rule: 'UN38.3 Lithium Battery Air/Surface Transport Certificate', status: 'PASSED', notes: 'Verified on Anker MagGo packs' },
            { rule: 'Zenith Contractual SLA Minimum Buffer (95% fulfillment)', status: 'ATTENTION', notes: 'Buffer compromised without expedited intake' }
          ],
          approvalRequired: true,
          approvalId: 'app-inv-001',
          approvalStatus: 'PENDING'
        };
    }
  }
}
