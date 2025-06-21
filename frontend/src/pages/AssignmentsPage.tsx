// frontend/src/pages/AssignmentsPage.tsx

import React, { useState, useEffect } from 'react';
import type { Assignment } from '../types';
import '../App.css';
import { fetchAllAssignments, addAssignment, updateAssignment } from '../services/assignmentService'; // <--- Import updateAssignment
import { useAuth } from '../context/AuthContext';
import EditAssignmentModal from '../components/EditAssignmentModal'; // <--- Import the new modal component

const API_BASE_URL = 'http://localhost:3001'; // Ensure this matches your backend URL

const AssignmentsPage: React.FC = () => {
  // --- Assignment States ---
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState<string>('');
  const [newAssignmentCourse, setNewAssignmentCourse] = useState<string>('');
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- State for Edit Modal ---
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [currentAssignmentToEdit, setCurrentAssignmentToEdit] = useState<Assignment | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false); // Loading state for modal save
  const [editError, setEditError] = useState<string | null>(null); // Error for modal save

  const { logout } = useAuth();

  // --- Assignment Functions ---
  const handleFetchAssignments = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetchAllAssignments();
      if (response.success && response.data) {
        setAssignments(response.data);
      } else {
        setError(response.message || 'Failed to load assignments.');
        if (response.message?.includes('Authentication required')) {
          console.error('Authentication error fetching assignments. Logging out...');
          logout();
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during assignment fetch:", err);
      setError('An unexpected error occurred while loading assignments.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssignment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newAssignmentTitle || !newAssignmentCourse || !newAssignmentDeadline) {
      alert('Please fill in all assignment fields (Title, Course, Deadline)!');
      return;
    }

    const deadlineDate = new Date(newAssignmentDeadline);
    deadlineDate.setUTCHours(23, 59, 59, 999);
    const formattedDeadline = deadlineDate.toISOString();

    const assignmentData = {
      title: newAssignmentTitle,
      course: newAssignmentCourse,
      deadline: formattedDeadline,
    };

    setError(null);
    setIsAdding(true);
    try {
      const response = await addAssignment(assignmentData);
      if (response.success && response.data) {
        setNewAssignmentTitle('');
        setNewAssignmentCourse('');
        setNewAssignmentDeadline('');
        handleFetchAssignments();
      } else {
        setError(response.message || 'Failed to add assignment.');
        if (response.message?.includes('Authentication required')) {
          console.error('Authentication error adding assignment. Logging out...');
          logout();
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during assignment add:", err);
      setError('An unexpected error occurred while adding assignment.');
    } finally {
      setIsAdding(false);
    }
  };

  // --- Edit Logic ---
  const handleEditClick = (assignment: Assignment) => {
    setCurrentAssignmentToEdit(assignment); // Set the assignment to be edited
    setIsEditModalOpen(true); // Open the modal
    setEditError(null); // Clear any previous modal errors
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentAssignmentToEdit(null); // Clear the assignment being edited
    setEditError(null);
  };

  const handleSaveEditedAssignment = async (id: string, updatedFields: Partial<Omit<Assignment, 'id'>>) => {
    setEditError(null); // Clear previous edit errors
    setIsSavingEdit(true); // Set saving state
    try {
      const response = await updateAssignment(id, updatedFields); // Call update service
      if (response.success) {
        console.log('Assignment updated successfully!');
        handleCloseEditModal(); // Close modal on success
        handleFetchAssignments(); // Re-fetch list to show changes
      } else {
        setEditError(response.message || 'Failed to save changes.');
        if (response.message?.includes('Authentication required')) {
            console.error('Authentication error updating assignment. Logging out...');
            logout();
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during assignment update:", err);
      setEditError('An unexpected error occurred while saving changes.');
    } finally {
      setIsSavingEdit(false); // Reset saving state
    }
  };

  // Fetch assignments on component mount
  useEffect(() => {
    handleFetchAssignments();
  }, []);

  return (
    <section className="assignments-section section-card">
      <h2>Assignments</h2>

      {/* Add Assignment Form */}
      <h3 className="section-subtitle">Add New Assignment</h3>
      <form onSubmit={handleAddAssignment} className="add-item-form">
        <input
          type="text"
          placeholder="Assignment Title"
          value={newAssignmentTitle}
          onChange={(e) => setNewAssignmentTitle(e.target.value)}
          required
          disabled={isAdding}
        />
        <input
          type="text"
          placeholder="Course (e.g., Math 101)"
          value={newAssignmentCourse}
          onChange={(e) => setNewAssignmentCourse(e.target.value)}
          required
          disabled={isAdding}
        />
        <input
          type="date"
          value={newAssignmentDeadline}
          onChange={(e) => setNewAssignmentDeadline(e.target.value)}
          required
          disabled={isAdding}
        />
        <button type="submit" className="btn btn-primary" disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add Assignment'}
        </button>
      </form>

      {/* Error Display */}
      {error && <p className="error-message">{error}</p>}

      {/* List of Existing Assignments */}
      <h3 className="section-subtitle">Your Assignments</h3>
      {isLoading ? (
        <p className="loading-message">Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p className="empty-message">No assignments recorded. Add one above!</p>
      ) : (
        <ul className="item-list">
          {assignments.map((assignment) => (
            <li key={assignment.id} className="item-card">
              <div className="item-header">
                <strong>{assignment.title}</strong>
                <span className="item-tag">{assignment.course}</span>
              </div>
              <p className="item-meta">Due: {assignment.deadline.split('T')[0]}</p>
              <div className="item-actions"> {/* <--- NEW: Actions container */}
                <button
                  className="btn btn-secondary btn-small" // <--- NEW: Edit button
                  onClick={() => handleEditClick(assignment)}
                >
                  Edit
                </button>
                {/* Delete button will go here in a later task */}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Assignment Modal */}
      {currentAssignmentToEdit && ( // Only render if an assignment is selected for editing
        <EditAssignmentModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          assignment={currentAssignmentToEdit}
          onSave={handleSaveEditedAssignment}
          isLoading={isSavingEdit}
          error={editError}
        />
      )}
    </section>
  );
};

export default AssignmentsPage;