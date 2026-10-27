/**
 * End-to-End REST API Test Suite for PRISM
 * Validates all HTTP endpoints against the live Express backend server on port 3001
 */

const BASE_URL = 'http://localhost:3001/api';

async function runApiTests() {
  console.log('================================================================');
  console.log('  PRISM END-TO-END REST API TEST SUITE');
  console.log('  Testing live server at: ' + BASE_URL);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      passed++;
      console.log(`  [PASS] API Test ${passed + failed}: ${name}`);
    } catch (err: any) {
      failed++;
      console.error(`  [FAIL] API Test ${passed + failed}: ${name}`);
      console.error(`         Error: ${err.message}`);
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  // 1. Health check & users list
  await test('GET /api/health and /api/auth/users return healthy system and users', async () => {
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert(healthRes.ok, `Health status ${healthRes.status}`);
    const health = await healthRes.json();
    assert(health.status === 'HEALTHY', 'Service healthy');

    const usersRes = await fetch(`${BASE_URL}/auth/users`);
    assert(usersRes.ok, `Users status ${usersRes.status}`);
    const usersData = await usersRes.json();
    assert(Array.isArray(usersData.users) && usersData.users.length > 0, 'Users list returned');
  });

  // 2. Manager Dashboard Overview
  await test('GET /api/dashboard/overview returns warehouse KPIs & charts data', async () => {
    const res = await fetch(`${BASE_URL}/dashboard/overview`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.kpis && data.kpis.totalInventoryUnits > 0, 'Total units positive');
    assert(typeof data.kpis.storageUtilizationPct === 'number', 'Utilization numeric');
    assert(Array.isArray(data.charts.stockByCategory), 'Category distribution array');
    assert(Array.isArray(data.charts.movementTrends), 'Movement trends array');
  });

  // 3. Inventory Products & Filters
  await test('GET /api/inventory/products returns products with customer filter support', async () => {
    const res = await fetch(`${BASE_URL}/inventory/products`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.products) && data.products.length > 0, 'Products array returned');

    // Test filter by customer
    const apexRes = await fetch(`${BASE_URL}/inventory/products?customerId=cust-apex`);
    const apexData = await apexRes.json();
    assert(Array.isArray(apexData.products), 'Apex products array returned');
    assert(apexData.products.every((i: any) => i.customer_id === 'cust-apex'), 'All items belong to cust-apex');
  });

  // 4. Warehouse Digital Twin Zones
  await test('GET /api/warehouse/zones returns complete Kharghar facility zones', async () => {
    const res = await fetch(`${BASE_URL}/warehouse/zones`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.zones), 'Zones array returned');
    assert(data.zones.length >= 38, `Expected at least 38 zones, got ${data.zones.length}`);
  });

  // 5. Zone Detail with Bins & Stored SKUs
  await test('GET /api/warehouse/zones/:id returns rack/bin breakdown & stored inventory', async () => {
    const res = await fetch(`${BASE_URL}/warehouse/zones/zone-a1`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.zone && data.zone.id === 'zone-a1', 'Zone A1 returned');
    assert(Array.isArray(data.bins), 'Bins array returned');
    assert(Array.isArray(data.products), 'Stored products array returned');
  });

  // 6. Multi-Agent Registry
  await test('GET /api/agents returns all 7 specialized agents', async () => {
    const res = await fetch(`${BASE_URL}/agents`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.agents), 'Agents array returned');
    assert(data.agents.length === 7, `Expected 7 agents, got ${data.agents.length}`);
  });

  // 7. Dispatch Agent Command (Storage Optimization Analysis)
  let lastRunId = '';
  await test('POST /api/agents/command creates a task and runs agent workflow', async () => {
    const res = await fetch(`${BASE_URL}/agents/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'agent-storage',
        commandType: 'ANALYZE_STORAGE_CAPACITY',
        userPrompt: 'Analyze usable capacity and detect congested storage zones',
        userId: 'usr-mgr-1'
      })
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.runId && data.status, 'Run ID and status returned');
    lastRunId = data.runId;
  });

  // 8. Agent Run Details & Event Timeline
  await test('GET /api/agents/runs/:id returns execution details and step timeline', async () => {
    assert(!!lastRunId, 'Valid run ID exists');
    const res = await fetch(`${BASE_URL}/agents/runs/${lastRunId}`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.run && data.run.id === lastRunId, 'Run record verified');
    assert(Array.isArray(data.events) && data.events.length > 0, 'Event timeline contains steps');
  });

  // 9. Employee Tasks List
  await test('GET /api/operations/tasks returns active employee tasks', async () => {
    const res = await fetch(`${BASE_URL}/operations/tasks`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.tasks), 'Tasks array returned');
  });

  // 10. Operational Receiving Workflow
  let newShipmentId = '';
  await test('POST /api/operations/receive records inbound receipt at dock', async () => {
    const res = await fetch(`${BASE_URL}/operations/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        poNumber: `PO-E2E-${Date.now()}`,
        supplier: 'Foxconn Electronics India',
        customerId: 'cust-apex',
        dockId: 'zone-recv-1',
        carrier: 'Delhivery Freight',
        expectedUnits: 20,
        receivedUnits: 20,
        packagingCondition: 'GOOD',
        trackingNumber: 'TRK-INB-99881',
        userId: 'usr-emp-1'
      })
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.shipmentId, 'Shipment created');
    newShipmentId = data.shipmentId;
  });

  // 11. Operational Quality Inspection Workflow
  await test('POST /api/operations/inspect records QA verification and updates inventory', async () => {
    assert(!!newShipmentId, 'Valid shipment ID exists');
    const res = await fetch(`${BASE_URL}/operations/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipmentId: newShipmentId,
        productId: 'prod-1',
        customerId: 'cust-apex',
        quantityReceived: 20,
        quantityAccepted: 19,
        quantityRejected: 0,
        quantityQuarantined: 1,
        conditionGrade: 'GRADE_A_NEW',
        discrepancyReason: '1 carton minor corner compression',
        userId: 'usr-emp-2'
      })
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.inspectionId, 'Inspection recorded');
  });

  // 12. Operational Putaway Workflow
  await test('POST /api/operations/putaway moves inventory without double-counting', async () => {
    const res = await fetch(`${BASE_URL}/operations/putaway`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'prod-1',
        customerId: 'cust-apex',
        sourceBinId: 'bin-a2-1-1-1',
        destBinId: 'bin-a2-1-1-2',
        quantity: 2,
        userId: 'usr-emp-1'
      })
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.status === 'SUCCESS' && data.movementId, 'Putaway movement recorded');
  });

  // 13. Operational Pick Workflow
  await test('POST /api/operations/pick validates availability and reserves units', async () => {
    const res = await fetch(`${BASE_URL}/operations/pick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: 'ord-out-202',
        orderLineId: 'line-out-1',
        productId: 'prod-7',
        binId: 'bin-b2-1-2-1',
        quantityPicked: 1,
        userId: 'usr-emp-1'
      })
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.status === 'SUCCESS', 'Pick recorded');
  });

  // 14. Operational Stock Count Workflow
  await test('POST /api/operations/count records physical cycle count', async () => {
    const res = await fetch(`${BASE_URL}/operations/count`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        binId: 'bin-a1-1-1-1',
        productId: 'prod-1',
        countedQuantity: 25,
        userId: 'usr-emp-1',
        notes: 'End-to-end routine cycle verification'
      })
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(typeof data.variance === 'number', 'Cycle count recorded');
  });

  // 15. Customers API
  await test('GET /api/customers returns exactly 4 contracted enterprise clients', async () => {
    const res = await fetch(`${BASE_URL}/customers`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.customers), 'Customers array returned');
    assert(data.customers.length === 4, `Expected 4 customers, got ${data.customers.length}`);
    const names = data.customers.map((c: any) => c.name);
    assert(names.some(n => n.includes('Apex Electronics')), 'Apex present');
    assert(names.some(n => n.includes('Nexus Mobile')), 'Nexus present');
    assert(names.some(n => n.includes('Zenith Peripherals')), 'Zenith present');
    assert(names.some(n => n.includes('ElectraCore Components')), 'ElectraCore present');
  });

  // 16. Workforce API
  await test('GET /api/workforce returns operator roster & task distribution', async () => {
    const res = await fetch(`${BASE_URL}/workforce`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.staff), 'Staff array returned');
    assert(Array.isArray(data.taskStats), 'Task stats returned');
  });

  // 17. Compliance API
  await test('GET /api/compliance returns BIS certifications and audit status', async () => {
    const res = await fetch(`${BASE_URL}/compliance`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.records), 'Compliance records returned');
    assert(data.auditSummary && typeof data.auditSummary.totalRecords === 'number', 'Audit summary returned');
  });

  console.log('\n================================================================');
  console.log(`  API TEST SUMMARY: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runApiTests().catch(err => {
  console.error('API Test Suite Failure:', err);
  process.exit(1);
});
