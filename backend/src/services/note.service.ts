// backend/src/services/note.service.ts
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteDataPayload } from '../models/note.model'; // Use NoteDataPayload

export const createNoteDb = (db: sqlite3.Database, userId: string, noteData: NoteDataPayload): Promise<Note> => {
  return new Promise((resolve, reject) => {
    const newNote: Note = {
      id: uuidv4(),
      userId,
      title: noteData.title,
      content: noteData.content,
      course: noteData.course, // Use 'course'
      link: noteData.link,     // Use 'link'
      createdAt: new Date().toISOString(),
    };
    const sql = `INSERT INTO notes (id, userId, title, content, course, link, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`; // Updated columns
    db.run(sql, [newNote.id, newNote.userId, newNote.title, newNote.content, newNote.course, newNote.link, newNote.createdAt], function(err) {
      if (err) {
        console.error('Error creating note in DB:', err.message);
        reject(err);
      } else {
        if (this.changes === 0) {
            return reject(new Error('Note creation failed, no rows inserted.'));
        }
        console.log(`Note created successfully with id ${newNote.id} for user ${userId}`);
        resolve(newNote);
      }
    });
  });
};

export const getNotesByUserIdDb = (db: sqlite3.Database, userId: string): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, userId, title, content, course, link, createdAt FROM notes WHERE userId = ? ORDER BY createdAt DESC"; // Updated columns
    db.all(sql, [userId], (err, rows: Note[]) => { // rows should directly map to Note[] now
      if (err) {
        console.error('Error fetching notes by userId from DB:', err.message);
        reject(err);
      } else {
        resolve(rows); // No need to parse tags anymore
      }
    });
  });
};

/**
 * Retrieves a specific note by its ID for a specific user.
 */
export const getNoteByIdAndUserIdDb = (db: sqlite3.Database, noteId: string, userId: string): Promise<Note | null> => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, userId, title, content, course, link, createdAt FROM notes WHERE id = ? AND userId = ?";
    db.get(sql, [noteId, userId], (err, row: any) => { // Use any then map for potential future tag parsing
      if (err) {
        console.error('Error fetching note by id and userId from DB:', err.message);
        reject(err);
      } else {
        // If you were storing tags as JSON and needed to parse them:
        // if (row && row.tags) {
        //   row.tags = JSON.parse(row.tags);
        // }
        resolve(row || null);
      }
    });
  });
};

/**
 * Updates an existing note for a specific user.
 * @param db The SQLite database connection instance.
 * @param noteId The ID of the note to update.
 * @param userId The ID of the user who owns the note.
 * @param noteData The data to update (can be partial).
 * @returns A promise that resolves to the updated Note object if successful, or null if not found/not owned.
 */
export const updateNoteDb = (
  db: sqlite3.Database,
  noteId: string,
  userId: string,
  noteData: Partial<NoteDataPayload> // Allow partial updates
): Promise<Note | null> => {
  return new Promise(async (resolve, reject) => { // Made async to use await for getNoteById
    // Construct the SET part of the SQL query dynamically
    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (noteData.title !== undefined) {
      fieldsToUpdate.push("title = ?");
      valuesToUpdate.push(noteData.title);
    }
    if (noteData.content !== undefined) {
      fieldsToUpdate.push("content = ?");
      valuesToUpdate.push(noteData.content);
    }
    if (noteData.course !== undefined) { // Can be set to null or a new string
      fieldsToUpdate.push("course = ?");
      valuesToUpdate.push(noteData.course);
    }
    if (noteData.link !== undefined) { // Can be set to null or a new string
      fieldsToUpdate.push("link = ?");
      valuesToUpdate.push(noteData.link);
    }
    // Add 'updatedAt' field if you have it in your schema
    // fieldsToUpdate.push("updatedAt = ?");
    // valuesToUpdate.push(new Date().toISOString());


    if (fieldsToUpdate.length === 0) {
      // No fields to update, perhaps just fetch and return the existing note
      // or return an indication that no update was performed.
      try {
        const existingNote = await getNoteByIdAndUserIdDb(db, noteId, userId);
        return resolve(existingNote); // Return existing if no changes
      } catch (fetchError) {
        return reject(fetchError);
      }
    }

    const sqlSetClause = fieldsToUpdate.join(", ");
    const sql = `UPDATE notes SET ${sqlSetClause} WHERE id = ? AND userId = ?`;
    const finalValues = [...valuesToUpdate, noteId, userId];

    db.run(sql, finalValues, async function (err) {
      if (err) {
        console.error('Error updating note in DB:', err.message);
        reject(err);
      } else {
        if (this.changes === 0) {
          resolve(null); // Note not found or not owned by user
        } else {
          try {
            const updatedNote = await getNoteByIdAndUserIdDb(db, noteId, userId); // Fetch the updated note
            resolve(updatedNote);
          } catch (fetchError) {
            reject(fetchError);
          }
        }
      }
    });
  });
};

/**
 * Deletes a specific note for a specific user.
 */
export const deleteNoteDb = (db: sqlite3.Database, noteId: string, userId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM notes WHERE id = ? AND userId = ?";
    db.run(sql, [noteId, userId], function (err) {
      if (err) {
        console.error('Error deleting note from DB:', err.message);
        reject(err);
      } else {
        resolve(this.changes > 0); // True if one or more rows were deleted
      }
    });
  });
};