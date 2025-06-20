import React, { useState, useEffect } from 'react';
import type { Assignment, Note } from './types'; // Import types using 'type-only' import
import './App.css'; // Import the CSS file
import { useAuth } from './context/AuthContext';

// Base URL for your backend API - IMPORTANT: No '/api' prefix, as per your backend
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
      // alert("Failed to load assignments. Ensure the backend is running and CORS is enabled."); // Removed for cleaner UX
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
      // alert("Failed to load notes. Ensure the backend is running and CORS is enabled."); // Removed for cleaner UX
    }
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newNoteCourse || !newNoteTitle || !newNoteContent) {
      alert('Please fill in course, title, and content for the note!');
      return;
    }

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
      alert(`Failed to add note: ${error instanceof Error ? error.message : String(error)}. Check backend console.`);
    }
  };

  const { isAuthenticated, user, login, logout } = useAuth();

   const handleTestLogin = async () => {
    await login('test@example.com', 'password123');
  };

  const handleTestLogout = () => {
    logout();
  };
  // --- End Temporary Test ---

  // --- Fetch data on component mount ---
  useEffect(() => {
    fetchAssignments();
    fetchNotes();
  }, []);

  

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1>
            <span role="img" aria-label="Books">📚</span> Academic Hub
          </h1>
          <p className="app-tagline">Your personal dashboard for schoolwork & notes.</p>
          <div style={{ marginTop: '10px', fontSize: '0.9em', color: 'rgba(255,255,255,0.9)' }}>
            {isAuthenticated ? (
              <>
                Logged in as: {user?.email}
                <button onClick={handleTestLogout} style={{ marginLeft: '10px', padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
              </>
            ) : (
              <>
                Not logged in
                <button onClick={handleTestLogin} style={{ marginLeft: '10px', padding: '5px 10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Test Login</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content container">
        {/* --- Assignments Section --- */}
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
            />
            <input
              type="text"
              placeholder="Course (e.g., Math 101)"
              value={newAssignmentCourse}
              onChange={(e) => setNewAssignmentCourse(e.target.value)}
              required
            />
            <input
              type="date"
              value={newAssignmentDeadline}
              onChange={(e) => setNewAssignmentDeadline(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Add Assignment</button>
          </form>

          {/* List of Existing Assignments */}
          <h3 className="section-subtitle">Your Assignments</h3>
          {assignments.length === 0 ? (
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

        {/* --- Notes Section --- */}
        <section className="notes-section section-card">
          <h2>Notes</h2>

          {/* Form to Add New Note */}
          <h3 className="section-subtitle">Add New Note</h3>
          <form onSubmit={handleAddNote} className="add-item-form">
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
              type="url"
              placeholder="Related Link (optional)"
              value={newNoteLink}
              onChange={(e) => setNewNoteLink(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Add Note</button>
          </form>

          {/* List of Existing Notes */}
          <h3 className="section-subtitle">Your Notes</h3>
          {notes.length === 0 ? (
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
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Academic Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;