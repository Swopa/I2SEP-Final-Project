import React, { useState, useEffect } from 'react';
import type { Assignment } from '../types'; // Import Assignment type
import '../App.css'; // For common modal styling

interface EditAssignmentModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  assignment: Assignment; // The assignment object to be edited
  onSave: (id: string, updatedFields: Partial<Omit<Assignment, 'id'>>) => Promise<void>; // Callback on save
  isLoading: boolean; // Prop to indicate if save is in progress
  error: string | null; // Prop to display save error
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onSave,
  isLoading,
  error,
}) => {
  const [title, setTitle] = useState(assignment.title);
  const [course, setCourse] = useState(assignment.course);
  // For deadline, ensure it's in YYYY-MM-DD format for input type="date"
  const [deadline, setDeadline] = useState(assignment.deadline.split('T')[0]);

  // Update form fields if the 'assignment' prop changes (e.g., when a different assignment is selected)
  useEffect(() => {
    setTitle(assignment.title);
    setCourse(assignment.course);
    setDeadline(assignment.deadline.split('T')[0]);
  }, [assignment]);

  if (!isOpen) return null; // Don't render anything if modal is not open

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Convert YYYY-MM-DD from input type="date" to ISO 8601 string for backend validation
    const deadlineDate = new Date(deadline);
    deadlineDate.setUTCHours(23, 59, 59, 999);
    const formattedDeadline = deadlineDate.toISOString();

    const updatedFields: Partial<Omit<Assignment, 'id'>> = {
      title,
      course,
      deadline: formattedDeadline,
    };

    // Call the onSave prop, which will trigger the parent component's save logic
    await onSave(assignment.id, updatedFields);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>Edit Assignment</h2>
        <form onSubmit={handleSubmit} className="edit-item-form">
          <div className="form-group">
            <label htmlFor="edit-title">Title</label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-course">Course</label>
            <input
              type="text"
              id="edit-course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-deadline">Deadline</label>
            <input
              type="date"
              id="edit-deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
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

export default EditAssignmentModal;