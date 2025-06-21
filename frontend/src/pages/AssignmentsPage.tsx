import React, { useState, useEffect } from 'react';
import type { Assignment } from '../types';
import '../App.css';

const API_BASE_URL = 'http://localhost:3001';

const AssignmentsPage: React.FC = () => {

  // --- Assignment States ---
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState<string>('');
  const [newAssignmentCourse, setNewAssignmentCourse] = useState<string>('');
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // For error messages

  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null); // ID of assignment being edited
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedCourse, setEditedCourse] = useState<string>('');
  const [editedDeadline, setEditedDeadline] = useState<string>('');



  // --- Assignment Functions ---

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Assignment[] = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      setError("Failed to load assignments. Please try again.");
      // alert("Failed to load assignments. Ensure the backend is running and CORS is enabled."); // Removed for cleaner UX
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

    setError(null);
    setIsLoading(true);

    const deadlineDate = new Date(newAssignmentDeadline);
    deadlineDate.setUTCHours(23, 59, 59, 999); // Set to end of day, UTC
    const formattedDeadline = deadlineDate.toISOString();

    const assignmentToAdd = {
      title: newAssignmentTitle,
      course: newAssignmentCourse,
      deadline: formattedDeadline,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentToAdd),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error adding assignment.' }));
        throw new Error(`HTTP error! status: ${response.status}. Message: ${errorData.message}`);
      }

      setNewAssignmentTitle('');
      setNewAssignmentCourse('');
      setNewAssignmentDeadline('');
      fetchAssignments();
    } catch (error) {
      console.error("Failed to add assignment:", error);
      setError(`Failed to add assignment: ${error instanceof Error ? error.message : String(error)}. Check backend console.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    console.log(`Stub: Attempting to delete assignment with ID: ${id}`);
    setError(null);
    setIsLoading(true); // Can also have a specific 'isDeleting' state

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate successful deletion: update local state directly
      setAssignments(prevAssignments => prevAssignments.filter(assignment => assignment.id !== id));
      console.log(`Stub: Assignment with ID ${id} deleted successfully from local state.`);
    } catch (err) {
      console.error(`Error deleting assignment ${id}:`, err);
      setError(`Failed to delete assignment: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id);
    setEditedTitle(assignment.title);
    setEditedCourse(assignment.course);
    // Convert backend ISO string (e.g., "2024-03-15T23:59:59.999Z") to "YYYY-MM-DD" for input type="date"
    setEditedDeadline(assignment.deadline.split('T')[0]);
  };

  const handleCancelEdit = () => {
    setEditingAssignmentId(null);
    setEditedTitle('');
    setEditedCourse('');
    setEditedDeadline('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editedTitle || !editedCourse || !editedDeadline) {
      alert('Please fill in all fields to save the assignment!');
      return;
    }

    setError(null);
    setIsLoading(true);

    const updatedDeadlineDate = new Date(editedDeadline);
    updatedDeadlineDate.setUTCHours(23, 59, 59, 999);
    const formattedUpdatedDeadline = updatedDeadlineDate.toISOString();

    const updatedAssignment: Assignment = {
      id: id,
      title: editedTitle,
      course: editedCourse,
      deadline: formattedUpdatedDeadline,
    };

    console.log(`Stub: Attempting to save assignment with ID: ${id}`, updatedAssignment);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate successful update: update local state directly
      setAssignments(prevAssignments =>
        prevAssignments.map(assign => (assign.id === id ? updatedAssignment : assign))
      );
      console.log(`Stub: Assignment with ID ${id} updated successfully in local state.`);

      setEditingAssignmentId(null);
    } catch (err) {
      console.error(`Error saving assignment ${id}:`, err);
      setError(`Failed to save assignment: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchAssignments();
  }, []);


  return (
    <section className="assignments-section section-card">
      <h2>Assignments</h2>

      {error && <p className="error-message">{error}</p>}
      {isLoading && <p className="loading-message">Loading assignments...</p>}

      {/* Form to Add New Assignment */}
      <h3 className="section-subtitle">Add New Assignment</h3>
      <form onSubmit={handleAddAssignment} className="add-item-form">
        <input
          type="text"
          placeholder="Assignment Title"
          value={newAssignmentTitle}
          onChange={(e) => setNewAssignmentTitle(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Course (e.g., Math 101)"
          value={newAssignmentCourse}
          onChange={(e) => setNewAssignmentCourse(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="date"
          value={newAssignmentDeadline}
          onChange={(e) => setNewAssignmentDeadline(e.target.value)}
          required
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary add-assignment-btn" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Assignment'}
        </button>
      </form>

      {/* List of Existing Assignments */}
      <h3 className="section-subtitle">Your Assignments</h3>
      {assignments.length === 0 && !isLoading ? (
        <p className="empty-message">No assignments recorded. Add one above!</p>
      ) : (
        <ul className="item-list">
          {assignments.map((assignment) => (
            <li key={assignment.id} className="item-card">
              {editingAssignmentId === assignment.id ? (
                // --- Edit Mode UI ---
                <div className="edit-form-container">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="form-input"
                    placeholder="Title"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={editedCourse}
                    onChange={(e) => setEditedCourse(e.target.value)}
                    className="form-input"
                    placeholder="Course"
                    disabled={isLoading}
                  />
                  <input
                    type="date"
                    value={editedDeadline}
                    onChange={(e) => setEditedDeadline(e.target.value)}
                    className="form-input"
                    placeholder="Deadline"
                    disabled={isLoading}
                  />
                  <div className="edit-buttons">
                    <button
                      onClick={() => handleSaveEdit(assignment.id)}
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
                // --- View Mode UI ---
                <>
                  <div className="item-header">
                    <strong>{assignment.title}</strong>
                    <span className="item-tag">{assignment.course}</span>
                  </div>
                  <p className="item-meta">Due: {assignment.deadline.split('T')[0]}</p>
                  <div className="item-actions">
                    <button
                      onClick={() => handleEditClick(assignment)}
                      className="btn btn-info edit-btn"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
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

export default AssignmentsPage;