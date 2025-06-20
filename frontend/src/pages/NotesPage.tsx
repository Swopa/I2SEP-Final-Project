import React, { useState, useEffect } from 'react';
import type { Note } from '../types'; 
import '../App.css'; 

const API_BASE_URL = 'http://localhost:3001';

const NotesPage: React.FC = () => {
    // --- Note States ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteCourse, setNewNoteCourse] = useState<string>('');
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [newNoteLink, setNewNoteLink] = useState<string>(''); // Optional link

  // --- Note Functions ---

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Note[] = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      // alert("Failed to load notes. Ensure the backend is running and CORS is enabled."); // Removed for cleaner UX
    }
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newNoteCourse || !newNoteTitle || !newNoteContent) {
      alert('Please fill in course, title, and content for the note!');
      return;
    }

    const noteToAdd = {
      course: newNoteCourse,
      title: newNoteTitle,
      content: newNoteContent,
      link: newNoteLink || undefined,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteToAdd),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error adding note.' }));
        throw new Error(`HTTP error! status: ${response.status}. Message: ${errorData.message}`);
      }

      setNewNoteCourse('');
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNoteLink('');
      fetchNotes();
    } catch (error) {
      console.error("Failed to add note:", error);
      alert(`Failed to add note: ${error instanceof Error ? error.message : String(error)}. Check backend console.`);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);
  
  
  
  
    return (
        <section className="notes-section section-card">
          <h2>Notes</h2>

          {/* Form to Add New Note */}
          <h3 className="section-subtitle">Add New Note</h3>
          <form onSubmit={handleAddNote} className="add-item-form">
            <input
              type="text"
              placeholder="Course (e.g., Physics 201)"
              value={newNoteCourse}
              onChange={(e) => setNewNoteCourse(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Note Title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Note Content"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={4}
              required
            ></textarea>
            <input
              type="url"
              placeholder="Related Link (optional)"
              value={newNoteLink}
              onChange={(e) => setNewNoteLink(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Add Note</button>
          </form>

          {/* List of Existing Notes */}
          <h3 className="section-subtitle">Your Notes</h3>
          {notes.length === 0 ? (
            <p className="empty-message">No notes recorded. Add one above!</p>
          ) : (
            <ul className="item-list">
              {notes.map((note) => (
                <li key={note.id} className="item-card">
                  <div className="item-header">
                    <strong>{note.title}</strong>
                    <span className="item-tag">{note.course}</span>
                  </div>
                  <p className="item-content">{note.content}</p>
                  {note.link && (
                    <p className="item-link"><a href={note.link} target="_blank" rel="noopener noreferrer">View Link</a></p>
                  )}
                  <small className="item-meta">Created: {new Date(note.createdAt).toLocaleDateString()}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
    
  );
};

export default NotesPage;