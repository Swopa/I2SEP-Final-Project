import React, { useState, useEffect } from 'react';
import type { Note } from '../types'; // Import Note type
import '../App.css'; // Common styling
import { fetchAllNotes, addNote } from '../services/noteService'; // Import service functions
import { useAuth } from '../context/AuthContext'; // To handle re-authentication/redirect

const API_BASE_URL = 'http://localhost:3001'; // Base URL for your backend API

const NotesPage: React.FC = () => {
  // --- Note States ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteCourse, setNewNoteCourse] = useState<string>('');
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [newNoteLink, setNewNoteLink] = useState<string>(''); // Optional link
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initial loading state for fetch
  const [isAdding, setIsAdding] = useState<boolean>(false); // Loading state for adding new note
  const [error, setError] = useState<string | null>(null); // Error state for both operations

  const { logout } = useAuth(); // Get logout from context to handle unauthorized access

  // --- Note Functions ---
  const handleFetchNotes = async () => { // Renamed for clarity
    setError(null); // Clear previous errors
    setIsLoading(true); // Set loading true
    try {
      const response = await fetchAllNotes(); // Call service function
      if (response.success && response.data) {
        setNotes(response.data);
      } else {
        setError(response.message || 'Failed to load notes.');
        if (response.message?.includes('Authentication required')) {
          console.error('Authentication error fetching notes. Logging out...');
          logout(); // Log out if authentication fails (e.g., token expired, not found)
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during note fetch:", err);
      setError('An unexpected error occurred while loading notes.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newNoteCourse || !newNoteTitle || !newNoteContent) {
      alert('Please fill in course, title, and content for the note!');
      return;
    }

    const noteData = { // Data to send, Omit 'id' and 'createdAt' as backend generates them
      course: newNoteCourse,
      title: newNoteTitle,
      content: newNoteContent,
      link: newNoteLink || undefined, // Send undefined if link is empty
    };

    setError(null); // Clear previous errors
    setIsAdding(true); // Set adding state
    try {
      const response = await addNote(noteData); // Call service function
      if (response.success && response.data) {
        setNewNoteCourse('');
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteLink('');
        handleFetchNotes(); // Re-fetch to update the list with the new item
      } else {
        setError(response.message || 'Failed to add note.');
        if (response.message?.includes('Authentication required')) {
          console.error('Authentication error adding note. Logging out...');
          logout(); // Log out if authentication fails
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during note add:", err);
      setError('An unexpected error occurred while adding note.');
    } finally {
      setIsAdding(false); // Reset adding state
    }
  };

  // Fetch notes when the component mounts
  useEffect(() => {
    handleFetchNotes();
  }, []); // Run only once on mount

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
          disabled={isAdding} // Disable inputs while adding
        />
        <input
          type="text"
          placeholder="Note Title"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          required
          disabled={isAdding} // Disable inputs while adding
        />
        <textarea
          placeholder="Note Content"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          rows={4}
          required
          disabled={isAdding} // Disable inputs while adding
        ></textarea>
        <input
          type="url"
          placeholder="Related Link (optional)"
          value={newNoteLink}
          onChange={(e) => setNewNoteLink(e.target.value)}
          disabled={isAdding} // Disable inputs while adding
        />
        <button type="submit" className="btn btn-primary" disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add Note'}
        </button>
      </form>

      {/* Error Display */}
      {error && <p className="error-message">{error}</p>}

      {/* List of Existing Notes */}
      <h3 className="section-subtitle">Your Notes</h3>
      {isLoading ? (
        <p className="loading-message">Loading notes...</p>
      ) : notes.length === 0 ? (
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
              {/* Edit/Delete buttons will go here in later tasks */}
              <div className="item-actions">
                {/* <button className="btn btn-secondary btn-small">Edit</button> */}
                {/* <button className="btn btn-danger btn-small">Delete</button> */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default NotesPage;