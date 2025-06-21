// backend/src/services/assignment.service.ts
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Assignment, NewAssignmentData, UpdateAssignmentData } from '../models/assignment.model';

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

/**
 * Updates an existing assignment for a specific user.
 * Only updates fields that are provided in assignmentData.
 * @param db The SQLite database connection instance.
 * @param assignmentId The ID of the assignment to update.
 * @param userId The ID of the user who owns the assignment.
 * @param assignmentData An object containing the fields to update.
 * @returns A promise that resolves to the updated Assignment object if successful, or null if not found/not owned or no changes.
 */
export const updateAssignmentDb = (
  db: sqlite3.Database,
  assignmentId: string,
  userId: string,
  assignmentData: UpdateAssignmentData
): Promise<Assignment | null> => {
  return new Promise(async (resolve, reject) => { // Made async to use await for getAssignmentByIdAndUserIdDb
    // Fields that can be updated
    const updatableFields: (keyof UpdateAssignmentData)[] = [
      'title', 'description', 'dueDate', 'courseTitle', 'status'
    ];
    const fieldsToUpdate: string[] = [];
    const valuesToUpdate: (string | undefined | null)[] = [];

    for (const field of updatableFields) {
      if (assignmentData[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        valuesToUpdate.push(assignmentData[field]);
      }
    }

    // Always update 'updatedAt' if any other field is being updated
    if (fieldsToUpdate.length === 0) {
      // No actual fields to update, perhaps just return the existing assignment or indicate no change
      // For now, let's consider this as "no effective update performed" by fetching and returning
      try {
        const existingAssignment = await getAssignmentByIdAndUserIdDb(db, assignmentId, userId); // We'll define this in C8
        return resolve(existingAssignment); // Or resolve(null) if no change means no "update"
      } catch (fetchError) {
        return reject(fetchError);
      }
    }

    fieldsToUpdate.push('updatedAt = ?');
    valuesToUpdate.push(new Date().toISOString());

    const sqlSetClause = fieldsToUpdate.join(', ');
    const sql = `UPDATE assignments SET ${sqlSetClause} WHERE id = ? AND userId = ?`;
    const finalValues = [...valuesToUpdate, assignmentId, userId];

    db.run(sql, finalValues, async function (err) { // Made async for re-fetch
      if (err) {
        console.error('Error updating assignment in DB:', err.message);
        reject(err);
      } else {
        if (this.changes === 0) {
          resolve(null); // No rows updated (not found or not owned)
        } else {
          // Fetch and return the updated assignment
          try {
            const updatedAssignment = await getAssignmentByIdAndUserIdDb(db, assignmentId, userId); // We'll define this in C8
            resolve(updatedAssignment);
          } catch (fetchError) {
            reject(fetchError);
          }
        }
      }
    });
  });
};

/**
 * Retrieves a specific assignment by its ID for a specific user.
 * @param db The SQLite database connection instance.
 * @param assignmentId The ID of the assignment to retrieve.
 * @param userId The ID of the user who should own the assignment.
 * @returns A promise that resolves to the Assignment object if found and owned by user, or null otherwise.
 */
export const getAssignmentByIdAndUserIdDb = (
  db: sqlite3.Database,
  assignmentId: string,
  userId: string
): Promise<Assignment | null> => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM assignments WHERE id = ? AND userId = ?";
    db.get(sql, [assignmentId, userId], (err, row: Assignment | undefined) => {
      if (err) {
        console.error('Error fetching assignment by id and userId from DB:', err.message);
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

/**
 * Deletes a specific assignment for a specific user.
 * @param db The SQLite database connection instance.
 * @param assignmentId The ID of the assignment to delete.
 * @param userId The ID of the user who owns the assignment.
 * @returns A promise that resolves to true if deleted, false if not found/not owned.
 */
export const deleteAssignmentDb = (
  db: sqlite3.Database,
  assignmentId: string,
  userId: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM assignments WHERE id = ? AND userId = ?";
    db.run(sql, [assignmentId, userId], function (err) {
      if (err) {
        console.error('Error deleting assignment from DB:', err.message);
        reject(err);
      } else {
        resolve(this.changes > 0); // True if one or more rows were deleted
      }
    });
  });
};