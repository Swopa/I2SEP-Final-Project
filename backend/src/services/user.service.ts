// backend/src/services/user.service.ts
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid'; // For generating user IDs
import { User } from '../models/user.model'; // Assuming NewUser excludes id and createdAt

/**
 * Finds a user by their email address.
 * @param db The SQLite database connection instance.
 * @param email The email to search for.
 * @returns A promise that resolves to the User object if found, or null otherwise.
 */
export const findUserByEmail = (db: sqlite3.Database, email: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, row: User | undefined) => { // Type 'row' explicitly
      if (err) {
        console.error('Error finding user by email:', err.message);
        reject(err);
      } else {
        resolve(row || null); // 'get' returns one row or undefined
      }
    });
  });
};

/**
 * Creates a new user in the database.
 * @param db The SQLite database connection instance.
 * @param userData An object containing email and passwordHash.
 * @returns A promise that resolves to the newly created User object.
 */
export const createUser = (
  db: sqlite3.Database,
  userData: { email: string; passwordHash: string } 
): Promise<User> => {
  return new Promise((resolve, reject) => {
    const newUser: User = {
      id: uuidv4(),
      email: userData.email, // userData directly has email
      passwordHash: userData.passwordHash, // userData directly has passwordHash
      createdAt: new Date().toISOString(),
    };

    const sql = `
      INSERT INTO users (id, email, passwordHash, createdAt)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [newUser.id, newUser.email, newUser.passwordHash, newUser.createdAt], function (err) {
      if (err) {
        console.error('Error creating user:', err.message);
        if (err.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email')) {
            return reject(new Error('EmailAlreadyExists'));
        }
        reject(err);
      } else {
        resolve(newUser);
      }
    });
  });
};