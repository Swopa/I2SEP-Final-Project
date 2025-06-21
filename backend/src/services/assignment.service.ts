// backend/src/services/assignment.service.ts
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Assignment, NewAssignmentData } from '../models/assignment.model';

/**
 * Creates a new assignment in the database for a specific user.
 * @param db The SQLite database connection instance.
 * @param userId The ID of the user creating the assignment.
 * @param assignmentData Data for the new assignment (title, dueDate, description, courseTitle, status).
 * @returns A promise that resolves to the newly created Assignment object.
 */
export const createAssignmentDb = (
  db: sqlite3.Database,
  userId: string,
  assignmentData: NewAssignmentData
): Promise<Assignment> => {
  return new Promise((resolve, reject) => {
    const newAssignment: Assignment = {
      id: uuidv4(),
      userId: userId,
      title: assignmentData.title,
      description: assignmentData.description,
      dueDate: assignmentData.dueDate, // Ensure this is an ISO string if coming from client
      courseTitle: assignmentData.courseTitle,
      status: assignmentData.status || 'pending', // Default to 'pending' if not provided
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), // Set updatedAt on creation as well
    };

    const sql = `
      INSERT INTO assignments (id, userId, title, description, dueDate, courseTitle, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      sql,
      [
        newAssignment.id,
        newAssignment.userId,
        newAssignment.title,
        newAssignment.description,
        newAssignment.dueDate,
        newAssignment.courseTitle,
        newAssignment.status,
        newAssignment.createdAt,
        newAssignment.updatedAt,
      ],
      function (err) { // Use 'function' for 'this'
        if (err) {
          console.error('Error creating assignment in DB:', err.message);
          reject(err);
        } else {
          if (this.changes === 0) {
            return reject(new Error('Assignment creation failed, no rows inserted.'));
          }
          console.log(`Assignment created successfully with id ${newAssignment.id} for user ${userId}`);
          resolve(newAssignment);
        }
      }
    );
  });
};

/**
 * Retrieves all assignments for a specific user, ordered by due date.
 * @param db The SQLite database connection instance.
 * @param userId The ID of the user whose assignments are to be retrieved.
 * @returns A promise that resolves to an array of Assignment objects.
 */
export const getAssignmentsByUserIdDb = (db: sqlite3.Database, userId: string): Promise<Assignment[]> => {
  return new Promise((resolve, reject) => {
    // Order by dueDate, then by createdAt for consistent ordering
    const sql = "SELECT * FROM assignments WHERE userId = ? ORDER BY dueDate ASC, createdAt ASC";
    db.all(sql, [userId], (err, rows: Assignment[]) => {
      if (err) {
        console.error('Error fetching assignments by userId from DB:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
