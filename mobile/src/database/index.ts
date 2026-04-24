import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const openDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabaseAsync('travelapp.db');
  return db;
};

export const initDB = async (): Promise<void> => {
  const database = await openDB();
  
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      token TEXT
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      start_time TEXT,
      end_time TEXT,
      distance REAL,
      duration INTEGER,
      start_lat REAL,
      start_lng REAL,
      end_lat REAL,
      end_lng REAL,
      start_point TEXT,
      destination TEXT,
      description TEXT,
      total_expense REAL DEFAULT 0,
      is_synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS route_points (
      id TEXT PRIMARY KEY,
      trip_id TEXT,
      latitude REAL,
      longitude REAL,
      timestamp TEXT,
      is_synced INTEGER DEFAULT 0,
      FOREIGN KEY(trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      trip_id TEXT,
      amount REAL,
      category TEXT,
      note TEXT,
      payment_method TEXT,
      latitude REAL,
      longitude REAL,
      timestamp TEXT,
      is_auto INTEGER DEFAULT 0,
      is_synced INTEGER DEFAULT 0,
      FOREIGN KEY(trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );
  `);
  
  try {
    await database.execAsync('ALTER TABLE trips ADD COLUMN start_point TEXT;');
  } catch (e) {}
  
  try {
    await database.execAsync('ALTER TABLE trips ADD COLUMN destination TEXT;');
  } catch (e) {}

  console.log('Database initialized');
};
