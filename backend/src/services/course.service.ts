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