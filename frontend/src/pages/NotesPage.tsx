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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null); // ID of note being edited
  const [editedNoteCourse, setEditedNoteCourse] = useState<string>('');
  const [editedNoteTitle, setEditedNoteTitle] = useState<string>('');
  const [editedNoteContent, setEditedNoteContent] = useState<string>('');
  const [editedNoteLink, setEditedNoteLink] = useState<string>('');

  // --- Note Functions ---
  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Note[] = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setError("Failed to load notes. Please try again.");
      // alert("Failed to load notes. Ensure the backend is running and CORS is enabled."); // Removed for cleaner UX
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newNoteCourse || !newNoteTitle || !newNoteContent) {
      alert('Please fill in course, title, and content for the note!');
      return;
    }

    setError(null);
    setIsLoading(true);

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
      setError(`Failed to add note: ${error instanceof Error ? error.message : String(error)}. Check backend console.`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    console.log(`Stub: Attempting to delete note with ID: ${id}`);
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate successful deletion: update local state directly
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      console.log(`Stub: Note with ID ${id} deleted successfully from local state.`);
    } catch (err) {
      console.error(`Error deleting note ${id}:`, err);
      setError(`Failed to delete note: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleEditClick = (note: Note) => {
    setEditingNoteId(note.id);
    setEditedNoteCourse(note.course);
    setEditedNoteTitle(note.title);
    setEditedNoteContent(note.content);
    setEditedNoteLink(note.link || '');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedNoteCourse('');
    setEditedNoteTitle('');
    setEditedNoteContent('');
    setEditedNoteLink('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editedNoteCourse || !editedNoteTitle || !editedNoteContent) {
      alert('Please fill in course, title, and content to save the note!');
      return;
    }

    setError(null);
    setIsLoading(true);

    const updatedNote: Note = {
      id: id,
      course: editedNoteCourse,
      title: editedNoteTitle,
      content: editedNoteContent,
      link: editedNoteLink || undefined,
      createdAt: notes.find(n => n.id === id)?.createdAt || new Date().toISOString(),
    };

    console.log(`Stub: Attempting to save note with ID: ${id}`, updatedNote);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate successful update: update local state directly
      setNotes(prevNotes =>
        prevNotes.map(note => (note.id === id ? updatedNote : note))
      );
      console.log(`Stub: Note with ID ${id} updated successfully in local state.`);

      setEditingNoteId(null);
    } catch (err) {
      console.error(`Error saving note ${id}:`, err);
      setError(`Failed to save note: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchNotes();
  }, []);




  return (
    <section className="notes-section section-card">
      <h2>Notes</h2>

      {error && <p className="error-message">{error}</p>}
      {isLoading && <p className="loading-message">Loading notes...</p>}

      {/* Form to Add New Note */}
      <h3 className="section-subtitle">Add New Note</h3>
      <form onSubmit={handleAddNote} className="add-item-form">
        <input
          type="text"
          placeholder="Course (e.g., Physics 201)"
          value={newNoteCourse}
          onChange={(e) => setNewNoteCourse(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Note Title"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          required
          disabled={isLoading}
        />
        <textarea
          placeholder="Note Content"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          rows={4}
          required
          disabled={isLoading}
        ></textarea>
        <input
          type="url"
          placeholder="Related Link (optional)"
          value={newNoteLink}
          onChange={(e) => setNewNoteLink(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary add-note-btn" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Note'}
        </button>
      </form>

      {/* List of Existing Notes */}
      <h3 className="section-subtitle">Your Notes</h3>
      {notes.length === 0 && !isLoading ? (
        <p className="empty-message">No notes recorded. Add one above!</p>
      ) : (
        <ul className="item-list">
          {notes.map((note) => (
            <li key={note.id} className="item-card">
              {editingNoteId === note.id ? (
                // --- Edit Mode UI for Note ---
                <div className="edit-form-container">
                  <input
                    type="text"
                    value={editedNoteCourse}
                    onChange={(e) => setEditedNoteCourse(e.target.value)}
                    className="form-input"
                    placeholder="Course"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={editedNoteTitle}
                    onChange={(e) => setEditedNoteTitle(e.target.value)}
                    className="form-input"
                    placeholder="Title"
                    disabled={isLoading}
                  />
                  <textarea
                    value={editedNoteContent}
                    onChange={(e) => setEditedNoteContent(e.target.value)}
                    className="form-input"
                    placeholder="Content"
                    rows={4}
                    disabled={isLoading}
                  ></textarea>
                  <input
                    type="url"
                    value={editedNoteLink}
                    onChange={(e) => setEditedNoteLink(e.target.value)}
                    className="form-input"
                    placeholder="Link"
                    disabled={isLoading}
                  />
                  <div className="edit-buttons">
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="btn btn-primary save-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-secondary cancel-btn"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // --- View Mode UI for Note ---
                <>
                  <div className="item-header">
                    <strong>{note.title}</strong>
                    <span className="item-tag">{note.course}</span>
                  </div>
                  <p className="item-content">{note.content}</p>
                  {note.link && (
                    <p className="item-link"><a href={note.link} target="_blank" rel="noopener noreferrer">View Link</a></p>
                  )}
                  <small className="item-meta">Created: {new Date(note.createdAt).toLocaleDateString()}</small>
                  <div className="item-actions">
                    <button
                      onClick={() => handleEditClick(note)}
                      className="btn btn-info edit-btn"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="btn btn-danger delete-btn"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>

  );
};

export default NotesPage;