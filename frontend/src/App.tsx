import React, { useState, useEffect } from 'react';
import type { Assignment } from './types'; 
import './App.css'; 

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState<string>('');
  const [newAssignmentCourse, setNewAssignmentCourse] = useState<string>(''); // For the 'course' field
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState<string>('');

  // --- FETCH ASSIGNMENTS ---
  const fetchAssignments = async () => {
    try {
      // Make sure your backend has a GET /api/assignments endpoint
      const response = await fetch(`${API_BASE_URL}/assignments`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Assignment[] = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      alert("Failed to load assignments. Ensure the backend is running and has the /api/assignments endpoint.");
    }
  };

  // Fetch assignments when the component mounts
  useEffect(() => {
    fetchAssignments();
  }, []); // Empty dependency array means this runs once on mount

  // --- ADD ASSIGNMENT ---
  const handleAddAssignment = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default browser form submission

    if (!newAssignmentTitle || !newAssignmentCourse || !newAssignmentDeadline) {
      alert('Please fill in all assignment fields (Title, Course, Deadline)!');
      return;
    }

    const deadlineDate = new Date(newAssignmentDeadline); // Creates a Date object for the beginning of the selected day
    deadlineDate.setHours(23, 59, 59, 999); // Set to end of day
    const formattedDeadline = deadlineDate.toISOString(); // Convert to ISO 8601 string

    const assignmentToAdd: Omit<Assignment, 'id'> = { // Exclude 'id' as backend generates it
      title: newAssignmentTitle,
      course: newAssignmentCourse,
      deadline: formattedDeadline, // This will be YYYY-MM-DD from the input type="date"
    };

    try {
      //  backend has a POST /api/assignments endpoint
      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentToAdd),
      });

      if (!response.ok) {
        // Attempt to read error message from backend if available
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`HTTP error! status: ${response.status}. Message: ${errorData.message}`);
      }

      // If successful, clear the form and re-fetch assignments to update the list
      setNewAssignmentTitle('');
      setNewAssignmentCourse('');
      setNewAssignmentDeadline('');
      fetchAssignments();
    } catch (error) {
      console.error("Failed to add assignment:", error);
      alert(`Failed to add assignment: ${error instanceof Error ? error.message : String(error)}. Check backend console.`);
    }
  };

  return (
    <div className="App">
      <h1>Academic Organizer</h1>

      <section className="assignments-section">
        <h2>Assignments</h2>

        {/* Form to Add New Assignment */}
        <h3>Add New Assignment</h3>
        <form onSubmit={handleAddAssignment} className="add-assignment-form">
          <input
            type="text"
            placeholder="Assignment Title"
            value={newAssignmentTitle}
            onChange={(e) => setNewAssignmentTitle(e.target.value)}
            required
          />
          <input
            type="text" 
            placeholder="Course (e.g., Math 101)"
            value={newAssignmentCourse}
            onChange={(e) => setNewAssignmentCourse(e.target.value)}
            required
          />
          <input
            type="date" // Provides a date picker in most modern browsers
            value={newAssignmentDeadline}
            onChange={(e) => setNewAssignmentDeadline(e.target.value)}
            required
          />
          <button type="submit">Add Assignment</button>
        </form>

        {/* List of Existing Assignments */}
        <h3>Your Assignments</h3>
        {assignments.length === 0 ? (
          <p>No assignments recorded. Add one using the form above!</p>
        ) : (
          <ul className="assignment-list">
            {assignments.map((assignment) => (
              <li key={assignment.id}>
                <strong>{assignment.title}</strong> - Course: {assignment.course} - Due: {assignment.deadline}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Placeholder for Notes Section (Task 5) */}
      <section className="notes-section" style={{ marginTop: '40px' }}>
        <h2>Notes</h2>
        <p>Notes functionality will be added here in a later task (Task 5).</p>
      </section>
    </div>
  );
}

export default App;