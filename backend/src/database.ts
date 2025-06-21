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

export const initializeCourseTable = (db: sqlite3.Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE 
      );
    `;
    // ON DELETE CASCADE means if a user is deleted, their courses are also deleted.
    // Consider if this is desired. Alternatives: ON DELETE SET NULL (if userId can be NULL),
    // ON DELETE RESTRICT (prevent user deletion if they have courses), or handle in application logic.
    // For now, CASCADE is a common choice for owned resources.

    db.run(sql, (err) => {
      if (err) {
        console.error('Error creating courses table', err.message);
        reject(err);
      } else {
        console.log('Courses table checked/created successfully.');
        resolve();
      }
    });
  });
};

// NEW FUNCTION: Initialize Assignment Table
export const initializeAssignmentTable = (db: sqlite3.Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT NOT NULL,    -- Store as ISO8601 string
        courseTitle TEXT,         -- Or courseId TEXT if linking to a courses table
        status TEXT NOT NULL DEFAULT 'pending', -- Default status
        createdAt TEXT NOT NULL,
        updatedAt TEXT,           -- Can be updated on modification
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    // Consider adding an index on userId for faster lookups of a user's assignments
    // const createIndexSql = `CREATE INDEX IF NOT EXISTS idx_assignments_userId ON assignments(userId);`;

    db.serialize(() => { // Use serialize to run statements in order
        db.run(sql, (err) => {
            if (err) {
                console.error('Error creating assignments table:', err.message);
                return reject(err); // Stop if table creation fails
            }
            console.log('Assignments table checked/created successfully.');
            // db.run(createIndexSql, (indexErr) => { // Optional: Create index
            //     if (indexErr) {
            //         console.error('Error creating index on assignments.userId:', indexErr.message);
            //         // Don't necessarily reject if index creation fails, but log it
            //     } else {
            //         console.log('Index on assignments.userId checked/created.');
            //     }
            //     resolve();
            // });
            resolve(); // Resolve after table creation if not adding index or handle index separately
        });
    });
  });
};