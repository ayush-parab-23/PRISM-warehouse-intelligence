import { Database } from '../db/database.js';
import { broadcastDomainEvent } from '../ws.js';

export interface MoveStockParams {
  productId: string;
  customerId: string;
  sourceZoneId: string;
  sourceBinId: string;
  destZoneId: string;
  destBinId: string;
  quantity: number;
  movementType: 'PUTAWAY' | 'STORAGE_TRANSFER' | 'PICK_RESERVE' | 'CYCLE_COUNT_ADJUST';
  referenceType: string;
  referenceId: string;
  userId: string;
  notes?: string;
}

export class InventoryService {
  /**
   * Transactional stock movement with strict non-negative balance checks
   */
  public static moveStock(params: MoveStockParams) {
    if (params.quantity <= 0) {
      throw new Error('Quantity moved must be strictly greater than 0.');
    }

    return Database.transaction(() => {
      // 1. Verify source balance
      const sourceBalance = Database.queryOne(`
        SELECT * FROM inventory_balances 
        WHERE product_id = ? AND bin_id = ?
      `, [params.productId, params.sourceBinId]);

      if (!sourceBalance || sourceBalance.quantity_available < params.quantity) {
        throw new Error(
          `Insufficient available balance in source bin ${params.sourceBinId}. ` +
          `Available: ${sourceBalance ? sourceBalance.quantity_available : 0}, Requested: ${params.quantity}`
        );
      }

      // 2. Deduct from source bin
      const newSourceAvailable = sourceBalance.quantity_available - params.quantity;
      const newSourceOnHand = sourceBalance.quantity_on_hand - params.quantity;

      Database.execute(`
        UPDATE inventory_balances 
        SET quantity_available = ?, quantity_on_hand = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newSourceAvailable, newSourceOnHand, sourceBalance.id]);

      // 3. Upsert destination bin balance
      const destBalance = Database.queryOne(`
        SELECT * FROM inventory_balances 
        WHERE product_id = ? AND bin_id = ?
      `, [params.productId, params.destBinId]);

      if (destBalance) {
        const newDestAvailable = destBalance.quantity_available + params.quantity;
        const newDestOnHand = destBalance.quantity_on_hand + params.quantity;

        Database.execute(`
          UPDATE inventory_balances 
          SET quantity_available = ?, quantity_on_hand = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [newDestAvailable, newDestOnHand, destBalance.id]);
      } else {
        const newBalId = `bal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        Database.execute(`
          INSERT INTO inventory_balances (
            id, product_id, customer_id, zone_id, bin_id, quantity_on_hand, quantity_available, quantity_reserved, quantity_quarantined, quantity_damaged
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
        `, [
          newBalId, params.productId, params.customerId, params.destZoneId, params.destBinId,
          params.quantity, params.quantity
        ]);
      }

      // 4. Record in immutable movement audit ledger
      const movementId = `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      Database.execute(`
        INSERT INTO inventory_movements (
          id, movement_type, product_id, customer_id, source_zone_id, source_bin_id,
          dest_zone_id, dest_bin_id, quantity, reference_type, reference_id,
          performed_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        movementId, params.movementType, params.productId, params.customerId,
        params.sourceZoneId, params.sourceBinId, params.destZoneId, params.destBinId,
        params.quantity, params.referenceType, params.referenceId, params.userId,
        params.notes || null
      ]);

      // 5. Update zone capacity metrics
      Database.execute(`
        UPDATE warehouse_zones SET
          current_pallet_count = (SELECT COALESCE(COUNT(DISTINCT bin_id), 0) FROM inventory_balances WHERE inventory_balances.zone_id = warehouse_zones.id),
          current_cubic_meters = (
            SELECT COALESCE(SUM(b.quantity_on_hand * p.volume_m3), 0.0)
            FROM inventory_balances b
            JOIN products p ON b.product_id = p.id
            WHERE b.zone_id = warehouse_zones.id
          )
        WHERE id IN (?, ?)
      `, [params.sourceZoneId, params.destZoneId]);

      // 6. Broadcast domain event to manager views
      broadcastDomainEvent('INVENTORY_MOVED', {
        movementId,
        productId: params.productId,
        quantity: params.quantity,
        sourceBinId: params.sourceBinId,
        destBinId: params.destBinId,
        timestamp: new Date().toISOString()
      });

      return {
        movementId,
        status: 'SUCCESS',
        quantityMoved: params.quantity
      };
    });
  }
}
