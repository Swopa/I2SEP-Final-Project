import React, { useState, useEffect } from 'react';
import type { Assignment, Note } from './types'; 
import './App.css'; 


const API_BASE_URL = 'http://localhost:3001';

function App() {
  // --- Assignment States ---
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState<string>('');
  const [newAssignmentCourse, setNewAssignmentCourse] = useState<string>('');
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState<string>('');

  // --- Note States ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteCourse, setNewNoteCourse] = useState<string>('');
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [newNoteLink, setNewNoteLink] = useState<string>(''); // Optional link

  // --- Assignment Functions ---

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Assignment[] = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      alert("Failed to load assignments. Ensure the backend is running and CORS is enabled.");
    }
  };

  const handleAddAssignment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newAssignmentTitle || !newAssignmentCourse || !newAssignmentDeadline) {
      alert('Please fill in all assignment fields (Title, Course, Deadline)!');
      return;
    }

    const deadlineDate = new Date(newAssignmentDeadline);
    deadlineDate.setUTCHours(23, 59, 59, 999); // Set to end of day, UTC
    const formattedDeadline = deadlineDate.toISOString();

    const assignmentToAdd = { // Omit 'id' as backend generates it
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
      fetchAssignments(); // Re-fetch to update the list
    } catch (error) {
      console.error("Failed to add assignment:", error);
      alert(`Failed to add assignment: ${error instanceof Error ? error.message : String(error)}. Check backend console.`);
    }
  };

  // --- Note Functions ---

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Note[] = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      alert("Failed to load notes. Ensure the backend is running and CORS is enabled.");
    }
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newNoteCourse || !newNoteTitle || !newNoteContent) {
      alert('Please fill in course, title, and content for the note!');
      return;
    }

    const noteToAdd = { // Omit 'id' and 'createdAt' as backend generates them
      course: newNoteCourse,
      title: newNoteTitle,
      content: newNoteContent,
      link: newNoteLink || undefined, // Send undefined if link is empty
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
      fetchNotes(); // Re-fetch to update the list
    } catch (error) {
      console.error("Failed to add note:", error);
      alert(`Failed to add note: ${error instanceof Error ? error.message : String(error)}. Check backend console.`);
    }
  };

  // --- Fetch data on component mount ---
  useEffect(() => {
    fetchAssignments();
    fetchNotes();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="App">
      <h1>Academic Organizer Dashboard</h1>

      {/* --- Assignments Section --- */}
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
            type="date" // Provides a date picker
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
                <strong>{assignment.title}</strong> - Course: {assignment.course} - Due: {assignment.deadline.split('T')[0]} {/* Display only date part */}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Notes Section --- */}
      <section className="notes-section" style={{ marginTop: '40px' }}>
        <h2>Notes</h2>

        {/* Form to Add New Note */}
        <h3>Add New Note</h3>
        <form onSubmit={handleAddNote} className="add-note-form">
          <input
            type="text"
            placeholder="Course (e.g., Physics 201)"
            value={newNoteCourse}
            onChange={(e) => setNewNoteCourse(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Note Title"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Note Content"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={4}
            required
          ></textarea>
          <input
            type="url" // Use type="url" for link validation
            placeholder="Related Link (optional)"
            value={newNoteLink}
            onChange={(e) => setNewNoteLink(e.target.value)}
          />
          <button type="submit">Add Note</button>
        </form>

        {/* List of Existing Notes */}
        <h3>Your Notes</h3>
        {notes.length === 0 ? (
          <p>No notes recorded. Add one using the form above!</p>
        ) : (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note.id}>
                <strong>{note.title}</strong> (Course: {note.course})<br />
                <p>{note.content}</p>
                {note.link && (
                  <p><a href={note.link} target="_blank" rel="noopener noreferrer">View Link</a></p>
                )}
                <small>Created: {new Date(note.createdAt).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;