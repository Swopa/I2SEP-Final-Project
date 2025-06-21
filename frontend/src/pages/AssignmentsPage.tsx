// frontend/src/pages/AssignmentsPage.tsx

import React, { useState, useEffect } from 'react';
import type { Assignment } from '../types'; // Import Assignment type
import '../App.css'; // Assuming common styles are linked here
import { fetchAllAssignments, addAssignment } from '../services/assignmentService'; // <--- Import service functions
import { useAuth } from '../context/AuthContext'; // To potentially handle re-authentication/redirect on 401 errors

const AssignmentsPage: React.FC = () => {
  // --- Assignment States ---
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState<string>('');
  const [newAssignmentCourse, setNewAssignmentCourse] = useState<string>('');
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initial loading state for fetch
  const [isAdding, setIsAdding] = useState<boolean>(false); // Loading state for adding new assignment
  const [error, setError] = useState<string | null>(null); // Error state for both operations

  const { logout } = useAuth(); // Get logout from context to handle unauthorized access

  // --- Assignment Functions ---
  const handleFetchAssignments = async () => { // Renamed to avoid confusion with service function
    setError(null); // Clear previous errors
    setIsLoading(true); // Set loading true
    try {
      const response = await fetchAllAssignments(); // <--- Call service function
      if (response.success && response.data) {
        setAssignments(response.data);
      } else {
        setError(response.message || 'Failed to load assignments.');
        if (response.message?.includes('Authentication required')) {
          console.error('Authentication error fetching assignments. Logging out...');
          logout(); // Log out if authentication fails (e.g., token expired, not found)
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during assignment fetch:", err);
      setError('An unexpected error occurred while loading assignments.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleAddAssignment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newAssignmentTitle || !newAssignmentCourse || !newAssignmentDeadline) {
      alert('Please fill in all assignment fields (Title, Course, Deadline)!');
      return;
    }

    // Convert YYYY-MM-DD from input type="date" to ISO 8601 string for backend validation
    const deadlineDate = new Date(newAssignmentDeadline);
    deadlineDate.setUTCHours(23, 59, 59, 999);
    const formattedDeadline = deadlineDate.toISOString();

    const assignmentData = { // Data to send, Omit 'id' as backend generates it
      title: newAssignmentTitle,
      course: newAssignmentCourse,
      deadline: formattedDeadline,
    };

    setError(null); // Clear previous errors
    setIsAdding(true); // Set adding state
    try {
      const response = await addAssignment(assignmentData); // <--- Call service function
      if (response.success && response.data) {
        setNewAssignmentTitle('');
        setNewAssignmentCourse('');
        setNewAssignmentDeadline('');
        handleFetchAssignments(); // Re-fetch to update the list with the new item
      } else {
        setError(response.message || 'Failed to add assignment.');
        if (response.message?.includes('Authentication required')) {
          console.error('Authentication error adding assignment. Logging out...');
          logout(); // Log out if authentication fails
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred during assignment add:", err);
      setError('An unexpected error occurred while adding assignment.');
    } finally {
      setIsAdding(false); // Reset adding state
    }
  };

  // Fetch assignments when the component mounts
  useEffect(() => {
    handleFetchAssignments();
  }, []); // Run only once on mount

  return (
    <section className="assignments-section section-card">
      <h2>Assignments</h2>

      {/* Form to Add New Assignment */}
      <h3 className="section-subtitle">Add New Assignment</h3>
      <form onSubmit={handleAddAssignment} className="add-item-form">
        <input
          type="text"
          placeholder="Assignment Title"
          value={newAssignmentTitle}
          onChange={(e) => setNewAssignmentTitle(e.target.value)}
          required
          disabled={isAdding} // Disable inputs while adding
        />
        <input
          type="text"
          placeholder="Course (e.g., Math 101)"
          value={newAssignmentCourse}
          onChange={(e) => setNewAssignmentCourse(e.target.value)}
          required
          disabled={isAdding} // Disable inputs while adding
        />
        <input
          type="date"
          value={newAssignmentDeadline}
          onChange={(e) => setNewAssignmentDeadline(e.target.value)}
          required
          disabled={isAdding} // Disable inputs while adding
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AssignmentsPage;