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