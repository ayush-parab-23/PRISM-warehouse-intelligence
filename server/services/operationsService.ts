import { Database } from '../db/database.js';
import { broadcastDomainEvent } from '../ws.js';
import { InventoryService } from './inventoryService.js';

export class OperationsService {
  /**
   * Receive Goods at Inbound Dock
   */
  public static receiveGoods(params: {
    poNumber: string;
    supplier: string;
    customerId: string;
    dockId: string;
    carrier: string;
    trackingNumber?: string;
    expectedUnits: number;
    receivedUnits: number;
    userId: string;
    notes?: string;
  }) {
    return Database.transaction(() => {
      const existing = Database.queryOne(`
        SELECT * FROM inbound_shipments WHERE po_number = ?
      `, [params.poNumber]);

      let shipmentId = existing ? existing.id : `ship-${Date.now()}`;

      if (existing) {
        Database.execute(`
          UPDATE inbound_shipments 
          SET received_units = ?, status = 'ARRIVED_DOCK', arrived_at = CURRENT_TIMESTAMP, notes = ?
          WHERE id = ?
        `, [params.receivedUnits, params.notes || null, shipmentId]);
      } else {
        Database.execute(`
          INSERT INTO inbound_shipments (
            id, po_number, supplier, customer_id, dock_id, carrier, tracking_number,
            expected_units, received_units, status, arrived_at, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ARRIVED_DOCK', CURRENT_TIMESTAMP, ?)
        `, [
          shipmentId, params.poNumber, params.supplier, params.customerId, params.dockId,
          params.carrier, params.trackingNumber || null, params.expectedUnits, params.receivedUnits,
          params.notes || null
        ]);
      }

      // Create an inspection task for QC team
      const taskId = `tsk-qc-${Date.now()}`;
      Database.execute(`
        INSERT INTO employee_tasks (
          id, task_code, task_type, priority, status, zone_id, customer_id,
          quantity, reference_id, instructions, due_at
        ) VALUES (?, ?, 'INSPECT', 'HIGH', 'PENDING', 'zone-qc', ?, ?, ?, ?, DATETIME('now', '+2 hours'))
      `, [
        taskId, `TSK-QC-${params.poNumber.slice(-4)}`, params.customerId, params.receivedUnits, shipmentId,
        `Conduct sample inspection for PO ${params.poNumber} (${params.receivedUnits} units) unloaded at dock.`
      ]);

      broadcastDomainEvent('GOODS_RECEIVED', {
        shipmentId,
        poNumber: params.poNumber,
        receivedUnits: params.receivedUnits,
        dockId: params.dockId,
        timestamp: new Date().toISOString()
      });

      return {
        shipmentId,
        taskId,
        status: 'ARRIVED_DOCK',
        message: `Successfully received ${params.receivedUnits} units for PO ${params.poNumber}. Inspection task created.`
      };
    });
  }

  /**
   * Inspection and Verification Workflow
   */
  public static submitInspection(params: {
    shipmentId: string;
    productId: string;
    customerId: string;
    userId: string;
    quantityReceived: number;
    quantityAccepted: number;
    quantityRejected: number;
    quantityQuarantined: number;
    conditionGrade: 'GRADE_A_NEW' | 'GRADE_B_MINOR_BOX_WEAR' | 'GRADE_C_DAMAGED' | 'FAIL_UNSEALED';
    discrepancyReason?: string;
    serialNumbersSample?: string;
  }) {
    return Database.transaction(() => {
      const inspectionId = `insp-${Date.now()}`;
      const shipment = Database.queryOne(`SELECT * FROM inbound_shipments WHERE id = ?`, [params.shipmentId]);
      const poNumber = shipment ? shipment.po_number : 'UNKNOWN';

      Database.execute(`
        INSERT INTO quality_inspections (
          id, shipment_id, po_number, product_id, customer_id, inspector_user_id,
          quantity_received, quantity_accepted, quantity_rejected, quantity_quarantined,
          condition_grade, discrepancy_reason, serial_numbers_sample
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        inspectionId, params.shipmentId, poNumber, params.productId, params.customerId,
        params.userId, params.quantityReceived, params.quantityAccepted, params.quantityRejected,
        params.quantityQuarantined, params.conditionGrade, params.discrepancyReason || null,
        params.serialNumbersSample || null
      ]);

      // Update shipment record
      Database.execute(`
        UPDATE inbound_shipments 
        SET accepted_units = accepted_units + ?, quarantined_units = quarantined_units + ?, status = 'PUTAWAY_PENDING'
        WHERE id = ?
      `, [params.quantityAccepted, params.quantityQuarantined + params.quantityRejected, params.shipmentId]);

      // If accepted units > 0, generate Putaway task for employee
      let putawayTaskId = null;
      if (params.quantityAccepted > 0) {
        putawayTaskId = `tsk-ptw-${Date.now()}`;
        Database.execute(`
          INSERT INTO employee_tasks (
            id, task_code, task_type, priority, status, zone_id, product_id,
            customer_id, quantity, reference_id, instructions, due_at
          ) VALUES (?, ?, 'PUTAWAY', 'HIGH', 'PENDING', 'zone-inbound-vfy', ?, ?, ?, ?, ?, DATETIME('now', '+3 hours'))
        `, [
          putawayTaskId, `TSK-PTW-${Date.now().toString().slice(-4)}`, params.productId,
          params.customerId, params.quantityAccepted, params.shipmentId,
          `Putaway ${params.quantityAccepted} inspected units from Inbound Verification to designated storage racks.`
        ]);
      }

      broadcastDomainEvent('INSPECTION_COMPLETED', {
        inspectionId,
        shipmentId: params.shipmentId,
        accepted: params.quantityAccepted,
        quarantined: params.quantityQuarantined + params.quantityRejected,
        putawayTaskId,
        timestamp: new Date().toISOString()
      });

      return {
        inspectionId,
        putawayTaskId,
        acceptedUnits: params.quantityAccepted,
        quarantinedUnits: params.quantityQuarantined + params.quantityRejected
      };
    });
  }

  /**
   * Putaway Stock into Specific Bin
   */
  public static executePutaway(params: {
    productId: string;
    customerId: string;
    sourceBinId: string;
    destBinId: string;
    quantity: number;
    userId: string;
    taskId?: string;
  }) {
    // Look up zones for bins
    const sourceBin = Database.queryOne(`SELECT zone_id FROM storage_bins WHERE id = ?`, [params.sourceBinId]) || { zone_id: 'zone-unload' };
    const destBin = Database.queryOne(`SELECT zone_id FROM storage_bins WHERE id = ?`, [params.destBinId]);

    if (!destBin) {
      throw new Error(`Destination bin ${params.destBinId} not found.`);
    }

    const result = InventoryService.moveStock({
      productId: params.productId,
      customerId: params.customerId,
      sourceZoneId: sourceBin.zone_id,
      sourceBinId: params.sourceBinId,
      destZoneId: destBin.zone_id,
      destBinId: params.destBinId,
      quantity: params.quantity,
      movementType: 'PUTAWAY',
      referenceType: 'TASK',
      referenceId: params.taskId || 'MANUAL_PUTAWAY',
      userId: params.userId,
      notes: `Putaway completed to bin ${params.destBinId}`
    });

    if (params.taskId) {
      Database.execute(`
        UPDATE employee_tasks 
        SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [params.taskId]);
    }

    return result;
  }

  /**
   * Pick Stock for Outbound Order
   */
  public static executePick(params: {
    orderId: string;
    orderLineId: string;
    productId: string;
    binId: string;
    quantityPicked: number;
    userId: string;
    taskId?: string;
  }) {
    return Database.transaction(() => {
      const line = Database.queryOne(`SELECT * FROM order_lines WHERE id = ?`, [params.orderLineId]);
      if (!line) throw new Error(`Order line ${params.orderLineId} not found.`);

      // Update line status
      Database.execute(`
        UPDATE order_lines 
        SET quantity_picked = quantity_picked + ?, status = 'PICKED'
        WHERE id = ?
      `, [params.quantityPicked, params.orderLineId]);

      // Update parent order
      Database.execute(`
        UPDATE outbound_orders 
        SET status = 'PICKING'
        WHERE id = ?
      `, [params.orderId]);

      if (params.taskId) {
        Database.execute(`
          UPDATE employee_tasks 
          SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [params.taskId]);
      }

      broadcastDomainEvent('ITEM_PICKED', {
        orderId: params.orderId,
        orderLineId: params.orderLineId,
        quantityPicked: params.quantityPicked,
        binId: params.binId,
        timestamp: new Date().toISOString()
      });

      return {
        status: 'SUCCESS',
        quantityPicked: params.quantityPicked
      };
    });
  }

  /**
   * Pack Outbound Order
   */
  public static executePack(params: {
    orderId: string;
    userId: string;
    cartonCount: number;
    notes?: string;
  }) {
    return Database.transaction(() => {
      Database.execute(`
        UPDATE outbound_orders 
        SET status = 'PACKED_READY'
        WHERE id = ?
      `, [params.orderId]);

      Database.execute(`
        UPDATE order_lines 
        SET status = 'PACKED'
        WHERE order_id = ?
      `, [params.orderId]);

      broadcastDomainEvent('ORDER_PACKED', {
        orderId: params.orderId,
        cartonCount: params.cartonCount,
        timestamp: new Date().toISOString()
      });

      return {
        orderId: params.orderId,
        status: 'PACKED_READY',
        message: 'Order consolidated and packed into shipping cartons. Ready for dispatch.'
      };
    });
  }

  /**
   * Dispatch Order onto Carrier
   */
  public static executeDispatch(params: {
    orderId: string;
    carrier: string;
    trackingNumber: string;
    dockId: string;
    userId: string;
  }) {
    return Database.transaction(() => {
      Database.execute(`
        UPDATE outbound_orders 
        SET status = 'DISPATCHED', carrier = ?, tracking_number = ?, dock_id = ?, dispatched_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [params.carrier, params.trackingNumber, params.dockId, params.orderId]);

      broadcastDomainEvent('ORDER_DISPATCHED', {
        orderId: params.orderId,
        carrier: params.carrier,
        trackingNumber: params.trackingNumber,
        dockId: params.dockId,
        timestamp: new Date().toISOString()
      });

      return {
        orderId: params.orderId,
        status: 'DISPATCHED',
        carrier: params.carrier,
        trackingNumber: params.trackingNumber
      };
    });
  }

  /**
   * Submit Stock Cycle Count
   */
  public static submitStockCount(params: {
    binId: string;
    productId: string;
    countedQuantity: number;
    userId: string;
    notes?: string;
  }) {
    return Database.transaction(() => {
      const balance = Database.queryOne(`
        SELECT * FROM inventory_balances WHERE bin_id = ? AND product_id = ?
      `, [params.binId, params.productId]);

      const expectedQuantity = balance ? balance.quantity_on_hand : 0;
      const variance = params.countedQuantity - expectedQuantity;

      // Update balance
      if (balance) {
        Database.execute(`
          UPDATE inventory_balances 
          SET quantity_on_hand = ?, quantity_available = ?, last_counted_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [params.countedQuantity, params.countedQuantity, balance.id]);
      }

      // Log movement adjustment if variance exists
      if (variance !== 0) {
        Database.execute(`
          INSERT INTO inventory_movements (
            id, movement_type, product_id, customer_id, source_bin_id, quantity,
            reference_type, reference_id, performed_by_user_id, notes
          ) VALUES (?, 'CYCLE_COUNT_ADJUST', ?, ?, ?, ?, 'CYCLE_COUNT', ?, ?, ?)
        `, [
          `adj-${Date.now()}`, params.productId, balance ? balance.customer_id : 'cust-apex',
          params.binId, Math.abs(variance), `COUNT-${Date.now()}`, params.userId,
          `Cycle count adjustment: variance of ${variance} units. ${params.notes || ''}`
        ]);
      }

      broadcastDomainEvent('STOCK_COUNT_SUBMITTED', {
        binId: params.binId,
        productId: params.productId,
        expectedQuantity,
        countedQuantity: params.countedQuantity,
        variance,
        timestamp: new Date().toISOString()
      });

      return {
        binId: params.binId,
        expectedQuantity,
        countedQuantity: params.countedQuantity,
        variance,
        reconciled: variance === 0
      };
    });
  }
}
