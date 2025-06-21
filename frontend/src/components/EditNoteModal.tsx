import React, { useState, useEffect } from 'react';
import type { Note } from '../types'; // Import Note type
import '../App.css'; // For common modal styling

interface EditNoteModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  note: Note; // The note object to be edited
  onSave: (id: string, updatedFields: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<void>; // Callback on save
  isLoading: boolean; // Prop to indicate if save is in progress
  error: string | null; // Prop to display save error
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onSave,
  isLoading,
  error,
}) => {
  const [course, setCourse] = useState(note.course);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [link, setLink] = useState(note.link || ''); // Handle optional link, default to empty string

  // Update form fields if the 'note' prop changes (e.g., when a different note is selected)
  useEffect(() => {
    setCourse(note.course);
    setTitle(note.title);
    setContent(note.content);
    setLink(note.link || '');
  }, [note]);

  if (!isOpen) return null; // Don't render anything if modal is not open

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const updatedFields: Partial<Omit<Note, 'id' | 'createdAt'>> = {
      course,
      title,
      content,
      link: link || undefined, // Ensure link is undefined if empty
    };

    // Call the onSave prop, which will trigger the parent component's save logic
    await onSave(note.id, updatedFields);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>Edit Note</h2>
        <form onSubmit={handleSubmit} className="edit-item-form">
          <div className="form-group">
            <label htmlFor="edit-note-course">Course</label>
            <input
              type="text"
              id="edit-note-course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-note-title">Title</label>
            <input
              type="text"
              id="edit-note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-note-content">Content</label>
            <textarea
              id="edit-note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
              className="form-input"
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="edit-note-link">Link (Optional)</label>
            <input
              type="url"
              id="edit-note-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoteModal;