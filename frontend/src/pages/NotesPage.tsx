// frontend/src/pages/NotesPage.tsx

import React, { useState, useEffect } from 'react';
import type { Note } from '../types';
import '../App.css';
import { fetchAllNotes, addNote, updateNote } from '../services/noteService'; // <--- Import updateNote
import { useAuth } from '../context/AuthContext';
import EditNoteModal from '../components/EditNoteModal'; // <--- Import the new modal component

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
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false); // Loading state for modal save
  const [editError, setEditError] = useState<string | null>(null); // Error for modal save

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
        handleFetchNotes();
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
    setCurrentNoteToEdit(note); // Set the note to be edited
    setIsEditModalOpen(true); // Open the modal
    setEditError(null); // Clear any previous modal errors
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentNoteToEdit(null); // Clear the note being edited
    setEditError(null);
  };

  const handleSaveEditedNote = async (id: string, updatedFields: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setEditError(null); // Clear previous edit errors
    setIsSavingEdit(true); // Set saving state
    try {
      const response = await updateNote(id, updatedFields); // Call update service
      if (response.success) {
        console.log('Note updated successfully!');
        handleCloseEditModal(); // Close modal on success
        handleFetchNotes(); // Re-fetch list to show changes
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
      setIsSavingEdit(false); // Reset saving state
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
                >
                  Edit
                </button>
                {/* Delete button will go here in Task C20 */}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Note Modal */}
      {currentNoteToEdit && ( // Only render if a note is selected for editing
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