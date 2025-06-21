// backend/src/services/course.service.ts
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Course, NewCourseData } from '../models/course.model'; // Assuming NewCourseData is Pick<Course, 'title'>

/**
 * Creates a new course in the database for a specific user.
 * @param db The SQLite database connection instance.
 * @param userId The ID of the user creating the course.
 * @param courseData Data for the new course (e.g., title).
 * @returns A promise that resolves to the newly created Course object.
 */
export const createCourseDb = (db: sqlite3.Database, userId: string, courseData: NewCourseData): Promise<Course> => {
  return new Promise((resolve, reject) => {
    const newCourse: Course = {
      id: uuidv4(),
      userId: userId,
      title: courseData.title,
      createdAt: new Date().toISOString(),
      // Set other fields like instructor, schedule to null/undefined or include if in NewCourseData
    };

    const sql = `
      INSERT INTO courses (id, userId, title, createdAt)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [newCourse.id, newCourse.userId, newCourse.title, newCourse.createdAt], function (err) {
      if (err) {
        console.error('Error creating course in DB:', err.message);
        // Could check for specific SQLite errors if needed, e.g., foreign key constraint
        reject(err);
      } else {
        if (this.changes === 0) {
            // Should not happen if SQL is correct and no unique constraints are violated on ID (UUIDs should be unique)
            return reject(new Error('Course creation failed, no rows inserted.'));
        }
        console.log(`Course created successfully with id ${newCourse.id} for user ${userId}`);
        resolve(newCourse);
      }
    });
  });
};

/**
 * Retrieves all courses for a specific user.
 * @param db The SQLite database connection instance.
 * @param userId The ID of the user whose courses are to be retrieved.
 * @returns A promise that resolves to an array of Course objects.
 */
export const getCoursesByUserIdDb = (db: sqlite3.Database, userId: string): Promise<Course[]> => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM courses WHERE userId = ?";
    db.all(sql, [userId], (err, rows: Course[]) => { // Type 'rows' as Course[]
      if (err) {
        console.error('Error fetching courses by userId from DB:', err.message);
        reject(err);
      } else {
        resolve(rows); // 'all' returns an array of rows
      }
    });
  });
};


/**
 * Retrieves a specific course by its ID for a specific user.
 * @param db The SQLite database connection instance.
 * @param courseId The ID of the course to retrieve.
 * @param userId The ID of the user who should own the course.
 * @returns A promise that resolves to the Course object if found and owned by user, or null otherwise.
 */
export const getCourseByIdAndUserIdDb = (db: sqlite3.Database, courseId: string, userId: string): Promise<Course | null> => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM courses WHERE id = ? AND userId = ?";
    db.get(sql, [courseId, userId], (err, row: Course | undefined) => {
      if (err) {
        console.error('Error fetching course by id and userId from DB:', err.message);
        reject(err);
      } else {
        resolve(row || null); // 'get' returns one row or undefined
      }
    });
  });
};


/**
 * Updates the title of a specific course for a specific user.
 * @param db The SQLite database connection instance.
 * @param courseId The ID of the course to update.
 * @param userId The ID of the user who owns the course.
 * @param newTitle The new title for the course.
 * @returns A promise that resolves to the updated Course object if successful and owned by user,
 *          or null if the course was not found or not owned by the user, or if no changes were made.
 *          It could also return the number of rows affected if preferred.
 */
export const updateCourseTitleDb = (
  db: sqlite3.Database,
  courseId: string,
  userId: string,
  newTitle: string
): Promise<Course | null> => { // Returning the updated course or null
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE courses
      SET title = ?
      WHERE id = ? AND userId = ?
    `;
    db.run(sql, [newTitle, courseId, userId], async function (err) { // Use 'function' for 'this'
      if (err) {
        console.error('Error updating course title in DB:', err.message);
        reject(err);
      } else {
        if (this.changes === 0) {
          // No rows updated - either courseId didn't exist or userId didn't match.
          // To be more specific, you could do a SELECT first, but for now, this is okay.
          console.log(`No course found with id ${courseId} for user ${userId} to update, or title was the same.`);
          resolve(null);
        } else {
          console.log(`Course ${courseId} title updated successfully for user ${userId}.`);
          // Fetch the updated course to return it
          try {
            const updatedCourse = await getCourseByIdAndUserIdDb(db, courseId, userId);
            resolve(updatedCourse); // updatedCourse will be null if somehow not found after update, though unlikely
          } catch (fetchError) {
            reject(fetchError);
          }
        }
      }
    });
  });
};


/**
 * Deletes a specific course for a specific user.
 * @param db The SQLite database connection instance.
 * @param courseId The ID of the course to delete.
 * @param userId The ID of the user who owns the course.
 * @returns A promise that resolves to true if the course was successfully deleted,
 *          false if the course was not found or not owned by the user.
 */
export const deleteCourseDb = (
  db: sqlite3.Database,
  courseId: string,
  userId: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM courses
      WHERE id = ? AND userId = ?
    `;
    db.run(sql, [courseId, userId], function (err) { // Use 'function' for 'this'
      if (err) {
        console.error('Error deleting course from DB:', err.message);
        reject(err);
      } else {
        if (this.changes === 0) {
          // No rows deleted - courseId didn't exist or userId didn't match.
          console.log(`No course found with id ${courseId} for user ${userId} to delete.`);
          resolve(false); // Indicate no course was deleted
        } else {
          console.log(`Course ${courseId} deleted successfully for user ${userId}.`);
          resolve(true); // Indicate successful deletion
        }
      }
    });
  });
};