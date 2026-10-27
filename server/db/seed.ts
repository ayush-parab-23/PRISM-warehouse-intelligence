import { Database } from './database.js';

export function seedDatabase(force = false) {
  Database.init();

  const userCount = Database.queryOne<{ count: number }>('SELECT count(*) as count FROM users');
  if (userCount && userCount.count > 0 && !force) {
    // Check if order_lines need seeding
    const linesCount = Database.queryOne<{ count: number }>('SELECT count(*) as count FROM order_lines');
    if (!linesCount || linesCount.count === 0) {
      Database.execute(`
        INSERT OR IGNORE INTO order_lines (id, order_id, product_id, quantity_requested, quantity_picked, quantity_packed, status)
        VALUES 
          ('line-out-1', 'ord-out-202', 'prod-7', 25, 0, 0, 'PENDING'),
          ('line-out-2', 'ord-out-203', 'prod-12', 25, 0, 0, 'PENDING'),
          ('line-out-3', 'ord-out-201', 'prod-1', 45, 45, 45, 'PACKED')
      `);
    }
    console.log('[PRISM DB] Database already contains records. Skipping full seed.');
    return;
  }

  console.log('[PRISM DB] Seeding authoritative database for Kharghar facility...');

  Database.transaction(() => {
    // 1. Users
    const insertUser = Database.get().prepare(`
      INSERT INTO users (id, username, password_hash, full_name, email, role, badge_number, shift)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('usr-mgr-1', 'ayush.parab', 'hash_demo_123', 'Ayush Parab', 'ayush.parab@prism.ai', 'manager', 'PRISM-M01', 'General');
    insertUser.run('usr-emp-1', 'priya.sharma', 'hash_demo_123', 'Priya Sharma', 'priya.sharma@prism.ai', 'employee', 'PRISM-E14', 'Morning');
    insertUser.run('usr-emp-2', 'rajesh.nair', 'hash_demo_123', 'Rajesh Nair', 'rajesh.nair@prism.ai', 'employee', 'PRISM-E22', 'Morning');
    insertUser.run('usr-emp-3', 'amit.shinde', 'hash_demo_123', 'Amit Shinde', 'amit.shinde@prism.ai', 'employee', 'PRISM-E35', 'Evening');

    // 2. Customers (4 Electronics Clients)
    const insertCustomer = Database.get().prepare(`
      INSERT INTO customers (id, code, name, industry, contact_person, contact_email, contact_phone, sla_tier, allocated_storage_m3, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCustomer.run(
      'cust-apex', 'APEX-IND', 'Apex Electronics India Pvt Ltd', 'Laptops & Workstation Computing',
      'Vikram Malhotra', 'supplychain@apexelectronics.in', '+91 22 2781 4001', 'Tier 1 Platinum', 1200.0,
      'High-throughput distributor of enterprise laptops and servers across western India.'
    );
    insertCustomer.run(
      'cust-nexus', 'NEXUS-MOB', 'Nexus Mobile Technologies', 'Smartphones & Smart Devices',
      'Ananya Deshmukh', 'logistics@nexusmobiles.com', '+91 22 4192 8800', 'Tier 1 Platinum', 950.0,
      'Direct importer of flagship 5G mobile devices, tablets, and OEM displays.'
    );
    insertCustomer.run(
      'cust-zenith', 'ZENITH-NET', 'Zenith Peripherals & Networking', 'Enterprise Hardware & Accessories',
      'Farhan Shaikh', 'operations@zenithnetworks.in', '+91 22 6755 1200', 'Tier 2 Gold', 750.0,
      'Distributor of corporate switches, structured cabling, Wi-Fi 7 access points, and mice/keyboards.'
    );
    insertCustomer.run(
      'cust-electra', 'ELECTRA-COR', 'ElectraCore Components', 'Chargers, Batteries & Power Subsystems',
      'Meera Iyer', 'procurement@electracore.co.in', '+91 22 2844 9310', 'Tier 3 Enterprise', 600.0,
      'Supplies GaN charging solutions, high-capacity power banks, and high-value internal PCBs.'
    );

    // 3. Warehouse Zones (Operational, Storage A1-H2, Fulfillment, Support)
    const insertZone = Database.get().prepare(`
      INSERT INTO warehouse_zones (id, zone_code, name, type, sub_category, purpose, temperature_controlled, restricted_access, max_pallet_capacity, max_cubic_meters, coordinates_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const zonesData = [
      // Operational
      ['zone-recv-1', 'RECV-1', 'Receiving Dock 1', 'OPERATIONAL', 'Inbound Dock', 'Heavy vehicle container unloading and initial ASN scan', 0, 0, 40, 150.0, '{"x":30,"y":30,"w":110,"h":75}'],
      ['zone-recv-2', 'RECV-2', 'Receiving Dock 2', 'OPERATIONAL', 'Inbound Dock', 'Express courier & domestic distributor cargo intake', 0, 0, 40, 150.0, '{"x":150,"y":30,"w":110,"h":75}'],
      ['zone-unload', 'UNLOAD-STG', 'Unloading and Staging', 'OPERATIONAL', 'Staging', 'Pallet breakdown, barcode tagging, and receipt verification buffer', 0, 0, 60, 200.0, '{"x":270,"y":30,"w":160,"h":75}'],
      ['zone-inbound-vfy', 'INBOUND-VFY', 'Inbound Verification', 'OPERATIONAL', 'Verification', 'Discrepancy inspection and serial number reconciliation', 0, 0, 30, 100.0, '{"x":440,"y":30,"w":140,"h":75}'],
      ['zone-qc', 'INSP-QC', 'Inspection and Quality Check', 'OPERATIONAL', 'Quality Control', 'Testing seal integrity, IMEI/serial batch audit, packaging grade inspection', 1, 0, 35, 120.0, '{"x":590,"y":30,"w":150,"h":75}'],
      ['zone-quarantine', 'QUARANTINE', 'Damaged Goods / Quarantine', 'OPERATIONAL', 'Quarantine', 'Defective seals, transit damage, and unverified serials held for survey', 1, 1, 30, 90.0, '{"x":750,"y":30,"w":120,"h":75}'],
      ['zone-rma', 'RETURNS-RMA', 'Returns & RMA Processing', 'OPERATIONAL', 'Returns', 'Customer returns intake, reverse logistics testing, and vendor return prep', 1, 0, 30, 90.0, '{"x":880,"y":30,"w":110,"h":75}'],

      // Storage Zones A1-H2
      ['zone-a1', 'ZONE-A1', 'Zone A1: Laptop Storage', 'STORAGE', 'Laptops', 'High-density vertical racks for active corporate laptop SKUs', 1, 0, 120, 350.0, '{"x":30,"y":135,"w":140,"h":115}'],
      ['zone-a2', 'ZONE-A2', 'Zone A2: Laptop High-Demand Storage', 'STORAGE', 'Laptops Fast-Moving', 'Pick-face fast-accessible location for bestselling lightweight laptops', 1, 0, 100, 300.0, '{"x":180,"y":135,"w":140,"h":115}'],
      ['zone-a3', 'ZONE-A3', 'Zone A3: Laptop Bulk / Reserve Storage', 'STORAGE', 'Laptops Bulk', 'High-bay reserve pallets awaiting replenishment down to Zone A1/A2', 0, 0, 200, 500.0, '{"x":330,"y":135,"w":140,"h":115}'],

      ['zone-b1', 'ZONE-B1', 'Zone B1: Smartphone Storage', 'STORAGE', 'Smartphones', 'Specialized modular bins for Android and iOS smartphones', 1, 0, 90, 250.0, '{"x":480,"y":135,"w":130,"h":115}'],
      ['zone-b2', 'ZONE-B2', 'Zone B2: Smartphone Secure Storage', 'STORAGE', 'Flagship Secure', 'Biometric caged zone for high-tier phones with 24/7 CCTV surveillance', 1, 1, 80, 220.0, '{"x":620,"y":135,"w":130,"h":115}'],
      ['zone-b3', 'ZONE-B3', 'Zone B3: Tablet Storage', 'STORAGE', 'Tablets & Displays', 'Horizontal padded racking for iPads, Android tablets, and drawing pads', 1, 0, 90, 240.0, '{"x":760,"y":135,"w":130,"h":115}'],

      ['zone-c1', 'ZONE-C1', 'Zone C1: Accessories Storage', 'STORAGE', 'Accessories', 'Shelving for laptop sleeves, smartphone cases, and screen guards', 0, 0, 80, 200.0, '{"x":30,"y":270,"w":140,"h":115}'],
      ['zone-c2', 'ZONE-C2', 'Zone C2: Chargers and Cables', 'STORAGE', 'Power Accessories', 'Binned storage for USB-C PD chargers, GaN blocks, and HDMI cables', 0, 0, 80, 200.0, '{"x":180,"y":270,"w":140,"h":115}'],
      ['zone-c3', 'ZONE-C3', 'Zone C3: Computer Peripherals', 'STORAGE', 'Peripherals', 'Ergonomic mice, mechanical keyboards, webcams, and USB hubs', 0, 0, 90, 220.0, '{"x":330,"y":270,"w":140,"h":115}'],

      ['zone-d1', 'ZONE-D1', 'Zone D1: Networking Equipment', 'STORAGE', 'Enterprise Network', 'Routers, Layer-3 managed switches, PoE injectors, and patch racks', 1, 0, 100, 280.0, '{"x":480,"y":270,"w":130,"h":115}'],
      ['zone-d2', 'ZONE-D2', 'Zone D2: Other Electronics', 'STORAGE', 'Electronics General', 'External SSDs, RAM modules, cooling pads, and power supplies', 1, 0, 90, 250.0, '{"x":620,"y":270,"w":130,"h":115}'],

      ['zone-e1', 'ZONE-E1', 'Zone E1: Customer-Specific Storage', 'STORAGE', 'Dedicated Client', 'Dedicated contracted storage bays for Apex and Nexus projects', 1, 0, 110, 300.0, '{"x":760,"y":270,"w":130,"h":115}'],
      ['zone-e2', 'ZONE-E2', 'Zone E2: Reserved / Contract Storage', 'STORAGE', 'Contract Reserve', 'Contractually guaranteed buffer capacity for enterprise seasonal peaks', 1, 0, 100, 280.0, '{"x":900,"y":270,"w":110,"h":115}'],

      ['zone-f1', 'ZONE-F1', 'Zone F1: High-Value Electronics', 'STORAGE', 'High-Value Vault', 'Reinforced lockable vault for flagship MacBooks and high-end enterprise GPUs', 1, 1, 70, 180.0, '{"x":30,"y":405,"w":140,"h":110}'],
      ['zone-f2', 'ZONE-F2', 'Zone F2: Restricted-Access Storage', 'STORAGE', 'Restricted Spares', 'Restricted access cages for calibrated electronics and proprietary spares', 1, 1, 60, 160.0, '{"x":180,"y":405,"w":140,"h":110}'],

      ['zone-g1', 'ZONE-G1', 'Zone G1: Overflow Storage', 'STORAGE', 'Overflow', 'Buffer pallets during high-inbound seasonal surges (Diwali / New Year peaks)', 0, 0, 140, 360.0, '{"x":330,"y":405,"w":140,"h":110}'],
      ['zone-g2', 'ZONE-G2', 'Zone G2: Temporary Staging', 'STORAGE', 'Cross-Dock Stage', 'Transit holding area for cross-docked bulk deliveries', 0, 0, 80, 200.0, '{"x":480,"y":405,"w":130,"h":110}'],

      ['zone-h1', 'ZONE-H1', 'Zone H1: Returns Awaiting Inspection', 'STORAGE', 'Returns Holding', 'Staging area for returned consignments before technician testing', 0, 0, 50, 140.0, '{"x":620,"y":405,"w":130,"h":110}'],
      ['zone-h2', 'ZONE-H2', 'Zone H2: Damaged or Hold Inventory', 'STORAGE', 'Damage Isolation', 'Quarantined broken screens, swollen lithium packs, transit-crushed goods', 1, 1, 50, 130.0, '{"x":760,"y":405,"w":130,"h":110}'],

      // Fulfillment
      ['zone-pick-1', 'PICK-1', 'Order Picking Zone 1', 'FULFILLMENT', 'Picking Aisle', 'Automated tote picking for customer orders from Zones A & B', 0, 0, 60, 180.0, '{"x":30,"y":540,"w":140,"h":85}'],
      ['zone-pick-2', 'PICK-2', 'Order Picking Zone 2', 'FULFILLMENT', 'Picking Aisle', 'Tote picking line for peripherals, cables, and networking hardware', 0, 0, 60, 180.0, '{"x":180,"y":540,"w":140,"h":85}'],
      ['zone-batch-pick', 'BATCH-PICK', 'Batch Picking and Consolidation', 'FULFILLMENT', 'Consolidation', 'Consolidating multi-item totes into consolidated customer shipments', 0, 0, 50, 150.0, '{"x":330,"y":540,"w":140,"h":85}'],
      ['zone-pack-1', 'PACK-1', 'Packing Station Area 1', 'FULFILLMENT', 'Packaging Lines', 'Anti-static ESD packaging tables with bubble wrapping and tamper tape', 0, 0, 45, 140.0, '{"x":480,"y":540,"w":130,"h":85}'],
      ['zone-pack-2', 'PACK-2', 'Packing Station Area 2', 'FULFILLMENT', 'Bulk Packaging', 'Automated carton taping and pallet wrapping for bulk retailer consignments', 0, 0, 45, 140.0, '{"x":620,"y":540,"w":130,"h":85}'],
      ['zone-final-vfy', 'FINAL-VFY', 'Final Verification', 'FULFILLMENT', 'Dispatch Audit', 'Barcode weigh-scale check and shipping invoice envelope attachment', 0, 0, 40, 120.0, '{"x":760,"y":540,"w":130,"h":85}'],
      ['zone-out-stage', 'OUT-STAGE', 'Outbound Staging', 'FULFILLMENT', 'Carrier Staging', 'Sorted consignments staged by carrier routes (Bluedart, Delhivery, Express)', 0, 0, 70, 220.0, '{"x":900,"y":405,"w":110,"h":220}'],
      ['zone-disp-1', 'DISP-1', 'Dispatch Dock 1', 'FULFILLMENT', 'Outbound Dock', 'Express outbound vehicle bay for intra-city Mumbai deliveries', 0, 0, 40, 140.0, '{"x":30,"y":645,"w":170,"h":65}'],
      ['zone-disp-2', 'DISP-2', 'Dispatch Dock 2', 'FULFILLMENT', 'Outbound Dock', 'Heavy container outbound bay for interstate cargo transit', 0, 0, 40, 140.0, '{"x":220,"y":645,"w":170,"h":65}'],

      // Support & Infrastructure
      ['zone-office', 'WH-OFFICE', 'Warehouse Office', 'SUPPORT', 'Administration', 'Operations management office, terminal room, and visitor lounge', 1, 0, 10, 60.0, '{"x":410,"y":645,"w":130,"h":65}'],
      ['zone-workforce', 'WORKFORCE-HUB', 'Workforce Check-in & Tasks', 'SUPPORT', 'Staff Facility', 'Biometric punch-in, handheld barcode scanner locker, and briefing room', 1, 0, 10, 50.0, '{"x":550,"y":645,"w":140,"h":65}'],
      ['zone-mhe', 'MHE-AREA', 'Equipment & MHE Staging Area', 'SUPPORT', 'Forklifts & Trolleys', 'Reach truck parking, electric pallet truck charging station, battery dock', 0, 0, 25, 90.0, '{"x":700,"y":645,"w":140,"h":65}'],
      ['zone-it', 'IT-ROOM', 'IT & Network Equipment Room', 'SUPPORT', 'Server Infrastructure', 'PRISM local edge server, PoE switchboards, and CCTV NVR racks', 1, 1, 10, 40.0, '{"x":850,"y":645,"w":100,"h":65}'],
      ['zone-safety', 'SAFETY-EXITS', 'Safety Equipment & Emergency Exits', 'SUPPORT', 'Safety Stations', 'CO2 fire extinguishers, eye-wash stations, and emergency evacuation door', 0, 0, 5, 20.0, '{"x":960,"y":645,"w":50,"h":65}']
    ];

    for (const z of zonesData) {
      insertZone.run(z[0], z[1], z[2], z[3], z[4], z[5], z[6], z[7], z[8], z[9], z[10]);
    }

    // 4. Storage Bins (Generate bins for storage zones)
    const insertBin = Database.get().prepare(`
      INSERT INTO storage_bins (id, zone_id, rack_code, shelf_code, bin_code, full_location_code, max_weight_kg, max_volume_m3, is_occupied, is_blocked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const storageZoneIds = [
      'zone-a1', 'zone-a2', 'zone-a3', 'zone-b1', 'zone-b2', 'zone-b3',
      'zone-c1', 'zone-c2', 'zone-c3', 'zone-d1', 'zone-d2', 'zone-e1',
      'zone-e2', 'zone-f1', 'zone-f2', 'zone-g1', 'zone-g2', 'zone-h1', 'zone-h2'
    ];

    for (const zoneId of storageZoneIds) {
      const zoneCode = zoneId.replace('zone-', '').toUpperCase();
      for (let r = 1; r <= 3; r++) {
        const rackCode = `R${r.toString().padStart(2, '0')}`;
        for (let s = 1; s <= 2; s++) {
          const shelfCode = `S${s.toString().padStart(2, '0')}`;
          for (let b = 1; b <= 2; b++) {
            const binCode = `B${b.toString().padStart(2, '0')}`;
            const fullCode = `${zoneCode}-${rackCode}-${shelfCode}-${binCode}`;
            const binId = `bin-${zoneId.replace('zone-', '')}-${r}-${s}-${b}`;
            insertBin.run(binId, zoneId, rackCode, shelfCode, binCode, fullCode, 450.0, 2.2, 0, 0);
          }
        }
      }
    }

    // 5. Products & SKUs (Electronics Hardware)
    const insertProduct = Database.get().prepare(`
      INSERT INTO products (
        id, sku, name, category, customer_id, unit_price, weight_kg, volume_m3, handling_class, is_high_value, reorder_threshold, target_stock, preferred_zone_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const productsData = [
      // Apex Electronics (Laptops)
      ['prod-1', 'APX-LAP-X1C', 'ThinkPad X1 Carbon Gen 12 Core Ultra 7', 'Laptops & Workstations', 'cust-apex', 178500.0, 1.12, 0.008, 'FRAGILE', 1, 35, 180, 'zone-a2'],
      ['prod-2', 'APX-LAP-MBP16', 'MacBook Pro 16" M3 Max 36GB Space Black', 'Laptops & Workstations', 'cust-apex', 319900.0, 2.14, 0.012, 'HIGH_VALUE_RESTRICTED', 1, 20, 120, 'zone-f1'],
      ['prod-3', 'APX-LAP-DEL7680', 'Dell Precision 7680 RTX 4080 Mobile Workstation', 'Laptops & Workstations', 'cust-apex', 265000.0, 2.67, 0.015, 'FRAGILE', 1, 15, 90, 'zone-a1'],
      ['prod-4', 'APX-LAP-HPDF', 'HP EliteBook Dragonfly G4 Core i7 32GB', 'Laptops & Workstations', 'cust-apex', 145000.0, 1.25, 0.009, 'FRAGILE', 0, 40, 220, 'zone-a1'],
      ['prod-5', 'APX-LAP-ASUSZ16', 'ASUS ROG Zephyrus G16 OLED Gaming Laptop', 'Laptops & Workstations', 'cust-apex', 189990.0, 1.95, 0.011, 'FRAGILE', 1, 25, 140, 'zone-a3'],

      // Nexus Mobile Technologies (Smartphones & Tablets)
      ['prod-6', 'NEX-MOB-S24U', 'Samsung Galaxy S24 Ultra 512GB Titanium Gray', 'Smartphones & Tablets', 'cust-nexus', 134999.0, 0.23, 0.002, 'LITHIUM_BATTERY', 1, 60, 350, 'zone-b2'],
      ['prod-7', 'NEX-MOB-IP15PM', 'Apple iPhone 15 Pro Max 256GB Natural Titanium', 'Smartphones & Tablets', 'cust-nexus', 159900.0, 0.22, 0.002, 'HIGH_VALUE_RESTRICTED', 1, 50, 300, 'zone-b2'],
      ['prod-8', 'NEX-MOB-PIX8P', 'Google Pixel 8 Pro 256GB Obsidian', 'Smartphones & Tablets', 'cust-nexus', 84999.0, 0.21, 0.002, 'LITHIUM_BATTERY', 0, 45, 250, 'zone-b1'],
      ['prod-9', 'NEX-MOB-ONE12', 'OnePlus 12 512GB Silky Black', 'Smartphones & Tablets', 'cust-nexus', 69999.0, 0.22, 0.002, 'LITHIUM_BATTERY', 0, 50, 280, 'zone-b1'],
      ['prod-10', 'NEX-TAB-IPAD12', 'Apple iPad Pro 12.9" M2 Wi-Fi 256GB Space Gray', 'Smartphones & Tablets', 'cust-nexus', 112900.0, 0.68, 0.005, 'FRAGILE', 1, 30, 160, 'zone-b3'],
      ['prod-11', 'NEX-TAB-SAMS9', 'Samsung Galaxy Tab S9 Ultra 512GB 5G', 'Smartphones & Tablets', 'cust-nexus', 122999.0, 0.73, 0.006, 'FRAGILE', 1, 25, 140, 'zone-b3'],

      // Zenith Peripherals & Networking
      ['prod-12', 'ZEN-PER-MXM3S', 'Logitech MX Master 3S Wireless Performance Mouse', 'Computer Peripherals', 'cust-zenith', 9495.0, 0.14, 0.001, 'STANDARD', 0, 80, 500, 'zone-c3'],
      ['prod-13', 'ZEN-PER-MXKEYS', 'Logitech MX Mechanical Wireless Illuminated Keyboard', 'Computer Peripherals', 'cust-zenith', 16995.0, 0.82, 0.004, 'STANDARD', 0, 60, 350, 'zone-c3'],
      ['prod-14', 'ZEN-PER-KQ3PRO', 'Keychron Q3 Pro Special Edition QMK Mechanical Keyboard', 'Computer Peripherals', 'cust-zenith', 19999.0, 1.82, 0.005, 'STANDARD', 0, 30, 180, 'zone-c3'],
      ['prod-15', 'ZEN-NET-C9200', 'Cisco Catalyst 9200L 48-Port PoE+ Gigabit Switch', 'Networking Hardware', 'cust-zenith', 245000.0, 5.20, 0.045, 'FRAGILE', 1, 10, 60, 'zone-d1'],
      ['prod-16', 'ZEN-NET-UDMPRO', 'Ubiquiti UniFi Dream Machine Pro Enterprise Gateway', 'Networking Hardware', 'cust-zenith', 48500.0, 3.90, 0.035, 'FRAGILE', 0, 20, 110, 'zone-d1'],
      ['prod-17', 'ZEN-NET-AP7PRO', 'Ubiquiti UniFi U7 Pro Wi-Fi 7 Tri-Band AP', 'Networking Hardware', 'cust-zenith', 22900.0, 0.68, 0.003, 'STANDARD', 0, 40, 240, 'zone-d1'],
      ['prod-18', 'ZEN-ACC-TB4DOCK', 'CalDigit TS4 Thunderbolt 4 18-Port Docking Station', 'Computer Peripherals', 'cust-zenith', 38900.0, 0.98, 0.003, 'STANDARD', 0, 25, 150, 'zone-c3'],

      // ElectraCore Components
      ['prod-19', 'ELC-PWR-GAN140', 'Anker 737 GaNPrime 140W Multi-Port Fast Charger', 'Chargers & Accessories', 'cust-electra', 12999.0, 0.32, 0.001, 'STANDARD', 0, 90, 600, 'zone-c2'],
      ['prod-20', 'ELC-PWR-PB24K', 'Anker PowerCore 24,000mAh 140W Smart Power Bank', 'Chargers & Accessories', 'cust-electra', 14999.0, 0.63, 0.002, 'LITHIUM_BATTERY', 0, 70, 400, 'zone-c2'],
      ['prod-21', 'ELC-CBL-TB42M', 'Belkin Pro Thunderbolt 4 Passive Cable 2M 40Gbps', 'Chargers & Accessories', 'cust-electra', 5999.0, 0.09, 0.0005, 'STANDARD', 0, 120, 800, 'zone-c2'],
      ['prod-22', 'ELC-SSD-990P2', 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 Internal SSD', 'Components & Sub-assemblies', 'cust-electra', 17499.0, 0.04, 0.0003, 'FRAGILE', 0, 80, 550, 'zone-d2'],
      ['prod-23', 'ELC-RAM-DDR564', 'Corsair Vengeance 64GB (2x32GB) DDR5 6000MHz CL30', 'Components & Sub-assemblies', 'cust-electra', 22999.0, 0.12, 0.0005, 'FRAGILE', 0, 50, 320, 'zone-d2'],
      ['prod-24', 'ELC-BAT-LIPO60', 'High-Discharge Lithium-Polymer 60Wh Replacement Pack', 'Components & Sub-assemblies', 'cust-electra', 6800.0, 0.35, 0.001, 'LITHIUM_BATTERY', 0, 40, 260, 'zone-c2']
    ];

    for (const p of productsData) {
      insertProduct.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12]);
    }

    // 6. Inventory Balances (Assign initial stock across bins)
    const insertBalance = Database.get().prepare(`
      INSERT INTO inventory_balances (
        id, product_id, customer_id, zone_id, bin_id, quantity_on_hand, quantity_available, quantity_reserved, quantity_quarantined, quantity_damaged
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const balances = [
      ['bal-1', 'prod-1', 'cust-apex', 'zone-a2', 'bin-a2-1-1-1', 95, 90, 5, 0, 0],
      ['bal-2', 'prod-1', 'cust-apex', 'zone-a2', 'bin-a2-1-1-2', 60, 60, 0, 0, 0],
      ['bal-3', 'prod-2', 'cust-apex', 'zone-f1', 'bin-f1-1-1-1', 38, 30, 8, 0, 0],
      ['bal-4', 'prod-3', 'cust-apex', 'zone-a1', 'bin-a1-1-1-1', 45, 45, 0, 0, 0],
      ['bal-5', 'prod-4', 'cust-apex', 'zone-a1', 'bin-a1-1-2-1', 120, 115, 5, 0, 0],
      ['bal-6', 'prod-5', 'cust-apex', 'zone-a3', 'bin-a3-1-1-1', 82, 80, 2, 0, 0],

      ['bal-7', 'prod-6', 'cust-nexus', 'zone-b2', 'bin-b2-1-1-1', 140, 130, 10, 0, 0],
      ['bal-8', 'prod-6', 'cust-nexus', 'zone-b2', 'bin-b2-1-1-2', 110, 110, 0, 0, 0],
      ['bal-9', 'prod-7', 'cust-nexus', 'zone-b2', 'bin-b2-1-2-1', 185, 160, 25, 0, 0],
      ['bal-10', 'prod-8', 'cust-nexus', 'zone-b1', 'bin-b1-1-1-1', 92, 92, 0, 0, 0],
      ['bal-11', 'prod-9', 'cust-nexus', 'zone-b1', 'bin-b1-1-2-1', 135, 125, 10, 0, 0],
      ['bal-12', 'prod-10', 'cust-nexus', 'zone-b3', 'bin-b3-1-1-1', 78, 70, 8, 0, 0],
      ['bal-13', 'prod-11', 'cust-nexus', 'zone-b3', 'bin-b3-1-2-1', 64, 60, 4, 0, 0],

      ['bal-14', 'prod-12', 'cust-zenith', 'zone-c3', 'bin-c3-1-1-1', 28, 25, 3, 0, 0], // Low stock!
      ['bal-15', 'prod-13', 'cust-zenith', 'zone-c3', 'bin-c3-1-2-1', 190, 180, 10, 0, 0],
      ['bal-16', 'prod-14', 'cust-zenith', 'zone-c3', 'bin-c3-2-1-1', 94, 90, 4, 0, 0],
      ['bal-17', 'prod-15', 'cust-zenith', 'zone-d1', 'bin-d1-1-1-1', 18, 15, 3, 0, 0],
      ['bal-18', 'prod-16', 'cust-zenith', 'zone-d1', 'bin-d1-1-2-1', 48, 45, 3, 0, 0],
      ['bal-19', 'prod-17', 'cust-zenith', 'zone-d1', 'bin-d1-2-1-1', 115, 110, 5, 0, 0],
      ['bal-20', 'prod-18', 'cust-zenith', 'zone-c3', 'bin-c3-2-2-1', 58, 55, 3, 0, 0],

      ['bal-21', 'prod-19', 'cust-electra', 'zone-c2', 'bin-c2-1-1-1', 340, 320, 20, 0, 0],
      ['bal-22', 'prod-20', 'cust-electra', 'zone-c2', 'bin-c2-1-2-1', 210, 200, 10, 0, 0],
      ['bal-23', 'prod-21', 'cust-electra', 'zone-c2', 'bin-c2-2-1-1', 460, 450, 10, 0, 0],
      ['bal-24', 'prod-22', 'cust-electra', 'zone-d2', 'bin-d2-1-1-1', 240, 230, 10, 0, 0],
      ['bal-25', 'prod-23', 'cust-electra', 'zone-d2', 'bin-d2-1-2-1', 130, 125, 5, 0, 0],
      ['bal-26', 'prod-24', 'cust-electra', 'zone-c2', 'bin-c2-2-2-1', 32, 28, 4, 0, 0], // Low stock!

      // Quarantined items in inspection/quarantine
      ['bal-27', 'prod-6', 'cust-nexus', 'zone-quarantine', 'bin-h2-1-1-1', 6, 0, 0, 6, 0],
      ['bal-28', 'prod-12', 'cust-zenith', 'zone-h2', 'bin-h2-1-2-1', 4, 0, 0, 0, 4]
    ];

    for (const b of balances) {
      insertBalance.run(b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8], b[9]);
    }

    // 7. Update Zone pallet and cubic metrics from initial balances
    Database.get().exec(`
      UPDATE warehouse_zones SET
        current_pallet_count = (SELECT COALESCE(COUNT(DISTINCT bin_id), 0) FROM inventory_balances WHERE inventory_balances.zone_id = warehouse_zones.id),
        current_cubic_meters = (
          SELECT COALESCE(SUM(b.quantity_on_hand * p.volume_m3), 0.0)
          FROM inventory_balances b
          JOIN products p ON b.product_id = p.id
          WHERE b.zone_id = warehouse_zones.id
        )
    `);

    // 8. Inbound Shipments
    const insertShipment = Database.get().prepare(`
      INSERT INTO inbound_shipments (
        id, po_number, supplier, customer_id, dock_id, carrier, tracking_number, expected_units, received_units, accepted_units, quarantined_units, status, eta, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertShipment.run(
      'ship-in-101', 'PO-APX-2026-089', 'Lenovo Global Supply (Shenzhen)', 'cust-apex', 'zone-recv-1',
      'DHL Global Forwarding', 'DHL-IN-88912410', 250, 250, 248, 2, 'COMPLETED',
      '2026-10-27 09:30:00', '2 units quarantined due to outer carton crush during tarmac transit.'
    );
    insertShipment.run(
      'ship-in-102', 'PO-NEX-2026-114', 'Samsung Electronics Vietnam Co.', 'cust-nexus', 'zone-recv-2',
      'FedEx Freight India', 'FDX-BOM-910245', 400, 400, 400, 0, 'PUTAWAY_PENDING',
      '2026-10-27 14:00:00', 'Passed seal check & IMEI sample verification. Ready for putaway to Zone B2.'
    );
    insertShipment.run(
      'ship-in-103', 'PO-ZEN-2026-042', 'Logitech Far East Ltd', 'cust-zenith', 'zone-recv-1',
      'Blue Dart Surface', 'BD-MUM-7712390', 300, 0, 0, 0, 'ARRIVED_DOCK',
      '2026-10-28 08:00:00', 'Trailer docked at Bay 1. Awaiting unloading and barcode manifest verify.'
    );
    insertShipment.run(
      'ship-in-104', 'PO-ELC-2026-077', 'Anker Innovations Co.', 'cust-electra', 'zone-recv-2',
      'Delhivery Enterprise', 'DEL-KHG-339182', 500, 0, 0, 0, 'SCHEDULED',
      '2026-10-28 16:30:00', 'Scheduled for evening intake. GaN multi-chargers and replacement packs.'
    );

    // 9. Outbound Orders
    const insertOrder = Database.get().prepare(`
      INSERT INTO outbound_orders (
        id, order_number, customer_id, destination, priority, dock_id, carrier, tracking_number, status, total_items, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(
      'ord-out-201', 'SO-APX-9821', 'cust-apex', 'Reliance Digital Hub, Lower Parel, Mumbai',
      'HIGH', 'zone-disp-1', 'Blue Dart Express', 'BD-XP-441920', 'PACKED_READY', 45,
      '2026-10-28 12:00:00'
    );
    insertOrder.run(
      'ord-out-202', 'SO-NEX-4190', 'cust-nexus', 'Croma Central DC, Bhiwandi, Thane',
      'URGENT', 'zone-disp-2', 'Delhivery Cargo', 'DEL-BHW-550192', 'PICKING', 80,
      '2026-10-28 14:00:00'
    );
    insertOrder.run(
      'ord-out-203', 'SO-ZEN-1102', 'cust-zenith', 'Tata Consultancy Services Olympus, Thane',
      'NORMAL', 'zone-disp-1', 'Speed Post Business', 'SP-MH-992014', 'PENDING_PICK', 25,
      '2026-10-28 18:00:00'
    );

    // 9.5 Outbound Order Lines
    const insertOrderLine = Database.get().prepare(`
      INSERT INTO order_lines (
        id, order_id, product_id, quantity_ordered, quantity_picked, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertOrderLine.run('line-out-1', 'ord-out-202', 'prod-7', 25, 0, 'PENDING');
    insertOrderLine.run('line-out-2', 'ord-out-203', 'prod-12', 25, 0, 'PENDING');
    insertOrderLine.run('line-out-3', 'ord-out-201', 'prod-1', 45, 45, 'PICKED');

    // 10. Employee Operational Tasks
    const insertTask = Database.get().prepare(`
      INSERT INTO employee_tasks (
        id, task_code, task_type, priority, status, assigned_to_user_id, zone_id, bin_id, product_id, customer_id, quantity, reference_id, instructions, due_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTask.run(
      'task-1', 'TSK-RCV-01', 'RECEIVE', 'HIGH', 'IN_PROGRESS', 'usr-emp-2', 'zone-recv-1', null, 'prod-12', 'cust-zenith', 300, 'ship-in-103',
      'Unload pallet shipment PO-ZEN-2026-042 at Receiving Dock 1. Scan carton barcodes and tally against manifest.', '2026-10-28 10:00:00'
    );
    insertTask.run(
      'task-2', 'TSK-PTW-04', 'PUTAWAY', 'URGENT', 'PENDING', 'usr-emp-1', 'zone-b2', 'bin-b2-1-1-2', 'prod-6', 'cust-nexus', 150, 'ship-in-102',
      'Transfer inspected Galaxy S24 Ultra crates from Inbound Verification to high-security Zone B2, Bin B2-R01-S01-B02.', '2026-10-28 11:30:00'
    );
    insertTask.run(
      'task-3', 'TSK-PCK-09', 'PICK', 'URGENT', 'IN_PROGRESS', 'usr-emp-3', 'zone-b2', 'bin-b2-1-2-1', 'prod-7', 'cust-nexus', 25, 'ord-out-202',
      'Wave pick 25 units iPhone 15 Pro Max 256GB for Croma Bhiwandi dispatch. Scan each device serial barcode into tote T-44.', '2026-10-28 12:15:00'
    );
    insertTask.run(
      'task-4', 'TSK-PCK-10', 'PICK', 'HIGH', 'PENDING', 'usr-emp-3', 'zone-a2', 'bin-a2-1-1-1', 'prod-1', 'cust-apex', 5, 'ord-out-201',
      'Pick 5 units ThinkPad X1 Carbon Gen 12 for Reliance Digital consignment. Deliver to Packing Station 1.', '2026-10-28 11:00:00'
    );
    insertTask.run(
      'task-5', 'TSK-DSP-02', 'DISPATCH', 'HIGH', 'PENDING', 'usr-emp-2', 'zone-disp-1', null, null, 'cust-apex', 45, 'ord-out-201',
      'Load packed order SO-APX-9821 into Blue Dart Express vehicle at Dispatch Dock 1. Capture driver sign-off.', '2026-10-28 13:00:00'
    );
    insertTask.run(
      'task-6', 'TSK-CNT-01', 'STOCK_COUNT', 'NORMAL', 'PENDING', 'usr-emp-1', 'zone-c3', 'bin-c3-1-1-1', 'prod-12', 'cust-zenith', 28, null,
      'Perform physical blind cycle count of Logitech MX Master 3S mice. Verify serial sample.', '2026-10-28 17:00:00'
    );

    // 11. Multi-Agent AI System: 7 Agent Definitions
    const insertAgent = Database.get().prepare(`
      INSERT INTO agent_definitions (
        id, code, name, role, description, status, icon_name, capabilities_json, last_run_at, total_runs, success_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const agentsData = [
      ['agent-orchestrator', 'ORCH-01', 'Main Orchestrator Agent', 'Global Operations Coordinator',
        'Receives warehouse manager instructions, decomposes cross-functional objectives, delegates sub-tasks to specialized domain agents, synthesizes results, and enforces approval safety gates.',
        'IDLE', 'Brain', '["intent_decomposition", "cross_agent_routing", "human_approval_gate", "safety_validation"]', '2026-10-28 07:45:00', 148, 99.3],

      ['agent-inventory', 'INV-02', 'Inventory Intelligence Agent', 'Stock & Replenishment Specialist',
        'Continuously audits SKU velocity, flags low-stock risks against lead times, identifies stagnant inventory, and calculates optimal reorder points for customer lines.',
        'IDLE', 'Boxes', '["low_stock_detection", "dynamic_safety_stock", "consumption_velocity", "reorder_calculation"]', '2026-10-28 07:48:00', 312, 100.0],

      ['agent-storage', 'STR-03', 'Storage Optimization Agent', 'Warehouse Space & Slotting Architect',
        'Evaluates usable bin and cubic volume capacity, detects floor congestion, enforces customer segregation rules, and recommends optimal putaway/relocation coordinates.',
        'IDLE', 'LayoutGrid', '["slotting_optimization", "zone_capacity_audit", "congestion_detection", "customer_segregation_check"]', '2026-10-28 07:50:00', 205, 98.5],

      ['agent-inbound-outbound', 'LOG-04', 'Inbound & Outbound Agent', 'Dock & Shipment Logistics Monitor',
        'Monitors incoming trailer schedules, tracks inspection dwell times, assesses pick/pack queue throughput, and prevents dock bottlenecks.',
        'IDLE', 'Truck', '["dock_scheduling", "inspection_dwell_monitor", "dispatch_bottleneck_detection", "carrier_tracking"]', '2026-10-28 07:52:00', 260, 99.6],

      ['agent-workforce', 'WKF-05', 'Workforce & Capacity Agent', 'Labor & Shift Allocation Strategist',
        'Monitors active floor tasks, measures pick-rate velocities, detects labor bottlenecks, and recommends skill-matched task balancing across shifts.',
        'IDLE', 'Users', '["labor_balancing", "skill_matching", "backlog_prediction", "shift_optimization"]', '2026-10-28 07:55:00', 188, 97.9],

      ['agent-analytics', 'ANL-06', 'Analytics & Forecasting Agent', 'Predictive Modeling & Statistical Insights',
        'Computes historical trends, calculates exponential moving averages for seasonal demand spikes, predicts weekly fulfillment volumes, and specifies confidence bounds.',
        'IDLE', 'TrendingUp', '["exponential_smoothing", "confidence_intervals", "inventory_turnover", "sla_tracking"]', '2026-10-28 08:00:00', 142, 98.6],

      ['agent-compliance', 'CMP-07', 'Compliance & Safety Agent', 'Regulatory & Hazardous Electronics Auditor',
        'Enforces BIS certification compliance, audits lithium battery UN 38.3 handling SOPs, tracks e-waste authorization validity, and flags hazardous storage violations.',
        'IDLE', 'ShieldCheck', '["bis_certification_check", "lithium_battery_sop_audit", "e_waste_tracking", "customer_sla_audit"]', '2026-10-28 08:05:00', 176, 100.0]
    ];

    for (const a of agentsData) {
      insertAgent.run(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10]);
    }

    // 12. Seed an Initial Agent Recommendation & Approval for Demonstration
    const insertRec = Database.get().prepare(`
      INSERT INTO agent_recommendations (
        id, run_id, agent_id, product_id, zone_id, customer_id, category, title, description, impact_level, evidence_json, suggested_action_json, status, requires_approval
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertRec.run(
      'rec-seed-1', null, 'agent-inventory', 'prod-12', 'zone-c3', 'cust-zenith',
      'REORDER', 'Critical Stock Depletion: Logitech MX Master 3S',
      'Inventory balance has dropped to 28 units, which is below the configured safety threshold of 80 units. Historical run rate indicates stockout in approximately 3.2 days.',
      'CRITICAL',
      JSON.stringify({
        current_stock: 28,
        safety_threshold: 80,
        daily_velocity: 8.75,
        supplier_lead_time_days: 4,
        projected_stockout_date: '2026-10-31'
      }),
      JSON.stringify({
        action: 'CREATE_PURCHASE_REQUISITION',
        supplier: 'Logitech Far East Ltd',
        recommended_quantity: 450,
        estimated_cost_inr: 4272750.0,
        target_zone: 'ZONE-C3'
      }),
      'PENDING_APPROVAL', 1
    );

    insertRec.run(
      'rec-seed-2', null, 'agent-storage', 'prod-1', 'zone-a2', 'cust-apex',
      'STORAGE_OPTIMIZATION', 'Relocate Reserve ThinkPad X1 Units to Zone A2 Fast-Pick Face',
      'Zone A2 fast-pick bin utilization is at 82% while Zone A3 bulk storage has 82 unallocated units. Moving 40 units to Zone A2 will reduce wave pick travel distance by 34%.',
      'MEDIUM',
      JSON.stringify({
        source_zone: 'ZONE-A3',
        destination_zone: 'ZONE-A2',
        estimated_pick_time_saving_seconds: 18.5,
        target_sku: 'APX-LAP-X1C'
      }),
      JSON.stringify({
        action: 'SCHEDULE_INTERNAL_TRANSFER',
        quantity: 40,
        source_bin: 'A3-R01-S01-B01',
        dest_bin: 'A2-R01-S01-B02'
      }),
      'PENDING_APPROVAL', 1
    );

    // 13. Create Approval Request
    const insertApproval = Database.get().prepare(`
      INSERT INTO approvals (id, recommendation_id, run_id, requested_action, risk_level, status, decision_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertApproval.run(
      'appr-seed-1', 'rec-seed-1', null, 'Approve Reorder of 450 units Logitech MX Master 3S (Estimated Cost: ₹42,72,750)', 'HIGH', 'PENDING', null
    );
    insertApproval.run(
      'appr-seed-2', 'rec-seed-2', null, 'Reallocate 40 ThinkPad X1 units from Zone A3 to Zone A2 fast-pick rack', 'MEDIUM', 'PENDING', null
    );

    // 14. Compliance Records
    const insertCompliance = Database.get().prepare(`
      INSERT INTO compliance_records (
        id, customer_id, title, doc_type, document_number, issuing_authority, expiry_date, status, notes, verified_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCompliance.run(
      'comp-1', 'cust-apex', 'BIS Electronics Compulsory Registration Scheme (CRS)', 'BIS_CERTIFICATE',
      'BIS-REG-841920-CRS', 'Bureau of Indian Standards', '2027-04-15', 'VALID',
      'Valid for ThinkPad & workstation imports into Kharghar facility.', 'Inspector R. Verma'
    );
    insertCompliance.run(
      'comp-2', 'cust-nexus', 'UN 38.3 Lithium Ion Cell Transport Safety Audit', 'LITHIUM_BATTERY_SOP',
      'UN38.3-NEXUS-2025-V2', 'TUV Rheinland India', '2026-11-15', 'WARNING_EXPIRING_SOON',
      'Annual audit due within 18 days. Mandates fire-suppression isolation in Zone B2 and H2.', 'Priya Sharma (Sr. Compliance Lead)'
    );
    insertCompliance.run(
      'comp-3', 'cust-electra', 'Maharashtra Pollution Control Board E-Waste Authorisation', 'E_WASTE_AUTHORIZATION',
      'MPCB/RO-NM/EW/2024/099', 'MPCB Navi Mumbai', '2028-08-31', 'VALID',
      'Approved for reverse logistics and safe battery disposal in Kharghar node.', 'Officer M. Kulkarni'
    );
    insertCompliance.run(
      'comp-4', 'cust-zenith', 'Hazardous Electronics Material Declaration (RoHS 3)', 'HAZARDOUS_GOODS_DECLARATION',
      'ROHS-ZEN-2026-EU-IN', 'SGS India Pvt Ltd', '2027-01-10', 'VALID',
      'Full compliance with Lead, Cadmium, and Mercury limits across networking equipment.', 'Farhan Shaikh'
    );

    // 15. Audit Logs
    const insertAudit = Database.get().prepare(`
      INSERT INTO audit_logs (id, event_category, action, entity_type, entity_id, user_id, user_role, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(
      'aud-1', 'SYSTEM', 'SYSTEM_INITIALIZATION', 'WAREHOUSE', 'KHARGHAR-MAIN', 'usr-mgr-1', 'manager',
      JSON.stringify({ location: 'Kharghar, Navi Mumbai', status: 'ONLINE', nodes: 38 })
    );
    insertAudit.run(
      'aud-2', 'INVENTORY', 'RECEIVING_COMPLETED', 'SHIPMENT', 'ship-in-101', 'usr-emp-2', 'employee',
      JSON.stringify({ po_number: 'PO-APX-2026-089', received_units: 250, dock: 'zone-recv-1' })
    );
    insertAudit.run(
      'aud-3', 'AGENT', 'AGENT_CYCLE_COMPLETED', 'AGENT', 'agent-inventory', null, 'system',
      JSON.stringify({ skus_scanned: 24, low_stock_alerts_generated: 2 })
    );
  });

  console.log('[PRISM DB] Successfully seeded database with complete electronics warehouse records.');
}
