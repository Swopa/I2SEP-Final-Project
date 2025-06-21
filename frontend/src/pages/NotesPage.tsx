import React, { useState, useEffect } from 'react';
import type { Note } from '../types';
import '../App.css';
import { fetchAllNotes, addNote, updateNote, deleteNote } from '../services/noteService'; // <--- Import deleteNote
import { useAuth } from '../context/AuthContext';
import EditNoteModal from '../components/EditNoteModal';

const NotesPage: React.FC = () => {
  // --- Note States ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteCourse, setNewNoteCourse] = useState<string>('');
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [newNoteLink, setNewNoteLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- State for Edit Modal ---
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [currentNoteToEdit, setCurrentNoteToEdit] = useState<Note | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  const { logout } = useAuth();

  // --- Note Functions ---
  const handleFetchNotes = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetchAllNotes();
      if (response.success && response.data) {
        setNotes(response.data);
      } else {
        setError(response.message || 'Failed to load notes.');
        if (response.message?.includes('Authentication required')) {
          console.error('Authentication error fetching notes. Logging out...');
          logout();
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during note fetch:", err);
      setError('An unexpected error occurred while loading notes.');
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

    const noteData = {
      course: newNoteCourse,
      title: newNoteTitle,
      content: newNoteContent,
      link: newNoteLink || undefined,
    };

    setError(null);
    setIsAdding(true);
    try {
      const response = await addNote(noteData);
      if (response.success && response.data) {
        setNewNoteCourse('');
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteLink('');
        handleFetchNotes(); // Re-fetch to update the list
      } else {
        setError(response.message || 'Failed to add note.');
        if (response.message?.includes('Authentication required')) {
          console.error('Authentication error adding note. Logging out...');
          logout();
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during note add:", err);
      setError('An unexpected error occurred while adding note.');
    } finally {
      setIsAdding(false);
    }
  };

  // --- Edit Logic ---
  const handleEditClick = (note: Note) => {
    setCurrentNoteToEdit(note);
    setIsEditModalOpen(true);
    setEditError(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentNoteToEdit(null);
    setEditError(null);
  };

  const handleSaveEditedNote = async (id: string, updatedFields: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setEditError(null);
    setIsSavingEdit(true);
    try {
      const response = await updateNote(id, updatedFields);
      if (response.success) {
        console.log('Note updated successfully!');
        handleCloseEditModal();
        handleFetchNotes();
      } else {
        setEditError(response.message || 'Failed to save changes.');
        if (response.message?.includes('Authentication required')) {
            console.error('Authentication error updating note. Logging out...');
            logout();
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during note update:", err);
      setEditError('An unexpected error occurred while saving changes.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // --- Delete Logic ---
  const handleDeleteClick = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the note "${title}"? This action cannot be undone.`)) {
      return; // User cancelled
    }

    setError(null); // Clear main page error for new operation
    setIsLoading(true); // Show loading state for entire list while deleting
    try {
      const response = await deleteNote(id); // Call delete service
      if (response.success) {
        console.log('Note deleted successfully!');
        handleFetchNotes(); // Re-fetch list to show changes
      } else {
        setError(response.message || 'Failed to delete note.');
        if (response.message?.includes('Authentication required')) {
            console.error('Authentication error deleting note. Logging out...');
            logout();
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during note deletion:", err);
      setError('An unexpected error occurred while deleting note.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Fetch notes on component mount
  useEffect(() => {
    handleFetchNotes();
  }, []);

  return (
    <section className="notes-section section-card">
      <h2>Notes</h2>

      {/* Add Note Form */}
      <h3 className="section-subtitle">Add New Note</h3>
      <form onSubmit={handleAddNote} className="add-item-form">
        <input
          type="text"
          placeholder="Course (e.g., Physics 201)"
          value={newNoteCourse}
          onChange={(e) => setNewNoteCourse(e.target.value)}
          required
          disabled={isAdding}
        />
        <input
          type="text"
          placeholder="Note Title"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          required
          disabled={isAdding}
        />
        <textarea
          placeholder="Note Content"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          rows={4}
          required
          disabled={isAdding}
        ></textarea>
        <input
          type="url"
          placeholder="Related Link (optional)"
          value={newNoteLink}
          onChange={(e) => setNewNoteLink(e.target.value)}
          disabled={isAdding}
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
              <div className="item-actions">
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleEditClick(note)}
                  disabled={isLoading} // Disable if overall loading (e.g., during delete)
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-small" // <--- NEW: Delete button
                  onClick={() => handleDeleteClick(note.id, note.title)}
                  disabled={isLoading} // Disable if overall loading
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Note Modal */}
      {currentNoteToEdit && (
        <EditNoteModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          note={currentNoteToEdit}
          onSave={handleSaveEditedNote}
          isLoading={isSavingEdit}
          error={editError}
        />
      )}
    </section>
  );
};

export default NotesPage;