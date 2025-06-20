// backend/src/database.ts
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs/promises";

const dbDir = path.join(__dirname, "data");
const dbPath = path.join(dbDir, "nerv.sqlite");

// Ensure data directory exists
const ensureDataDirectory = async () => {
  try {
    await fs.access(dbDir);
  } catch {
    console.log(`Data directory not found. Creating: ${dbDir}`);
    await fs.mkdir(dbDir, { recursive: true });
  }
};

// Call ensureDataDirectory once, e.g., when the module loads or before DB init
// Or integrate it into the getDbConnection function

let dbInstance: sqlite3.Database | null = null;

export const getDbConnection = async (): Promise<sqlite3.Database> => {
  if (dbInstance) {
    return dbInstance;
  }
  await ensureDataDirectory();
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error opening database", err.message);
        reject(err);
      } else {
        console.log("Connected to the SQLite database.");
        dbInstance = db;
        resolve(db);
      }
    });
  });
};

// Optional: Function to close DB connection (e.g., on server shutdown)
export const closeDbConnection = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      dbInstance.close((err) => {
        if (err) {
          console.error("Error closing database", err.message);
          return reject(err);
        }
        console.log("Closed the SQLite database connection.");
        dbInstance = null;
        resolve();
      });
    } else {
      resolve(); // No connection to close
    }
  });
};

//Table creation for users
export const initializeUserTable = (db: sqlite3.Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `;
    db.run(sql, (err) => {
      if (err) {
        console.error("Error creating users table", err.message);
        reject(err);
      } else {
        console.log("Users table checked/created successfully.");
        resolve();
      }
    });
  });
};
