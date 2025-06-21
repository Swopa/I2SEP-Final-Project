import React, {useState , useEffect} from 'react';
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
          setError("Failed to load assignments. Please try again.");
          // alert("Failed to load assignments. Ensure the backend is running and CORS is enabled."); // Removed for cleaner UX
        }finally{
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
        }finally{
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

      // Simulate potential API error (uncomment to test error path)
      // throw new Error('Simulated API deletion error.');

    } catch (err) {
      console.error(`Error deleting assignment ${id}:`, err);
      setError(`Failed to delete assignment: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []); 
 

  return   (
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
                  <div className="item-header">
                    <strong>{assignment.title}</strong>
                    <span className="item-tag">{assignment.course}</span>
                  </div>
                  <p className="item-meta">Due: {assignment.deadline.split('T')[0]}</p>
                  <button
                onClick={() => handleDeleteAssignment(assignment.id)} 
                className="btn btn-danger delete-btn" 
                disabled={isLoading}
              >
                Delete
              </button>
                </li>
              ))}
            </ul>
          )}
        </section>
  );   
};

export default AssignmentsPage;