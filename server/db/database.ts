import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.PRISM_DB_PATH || path.join(__dirname, 'prism_warehouse.db');

export class Database {
  private static instance: DatabaseSync | null = null;

  public static get(): DatabaseSync {
    if (!Database.instance) {
      Database.init();
    }
    return Database.instance!;
  }

  public static init(): DatabaseSync {
    if (Database.instance) {
      return Database.instance;
    }

    const isNewDb = !fs.existsSync(DB_PATH);
    const db = new DatabaseSync(DB_PATH);

    // Optimize SQLite for high concurrency and relational safety
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');

    // Load and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schemaSql);
    }

    Database.instance = db;
    console.log(`[PRISM DB] Initialized SQLite at: ${DB_PATH} (New DB: ${isNewDb})`);
    return db;
  }

  private static cleanParams(params: any[]): any[] {
    return params.map(p => (p === undefined ? null : p));
  }

  public static queryAll<T = any>(sql: string, params: any[] = []): T[] {
    const db = Database.get();
    const stmt = db.prepare(sql);
    return stmt.all(...Database.cleanParams(params)) as T[];
  }

  public static queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
    const db = Database.get();
    const stmt = db.prepare(sql);
    const results = stmt.all(...Database.cleanParams(params)) as T[];
    return results[0];
  }

  public static execute(sql: string, params: any[] = []): { changes: number | bigint; lastInsertRowid: number | bigint } {
    const db = Database.get();
    const stmt = db.prepare(sql);
    const result = stmt.run(...Database.cleanParams(params));
    return result;
  }

  public static transaction<T>(callback: () => T): T {
    const db = Database.get();
    db.exec('BEGIN TRANSACTION;');
    try {
      const res = callback();
      db.exec('COMMIT;');
      return res;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }
}
