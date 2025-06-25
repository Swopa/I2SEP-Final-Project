// frontend/src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';
import type { Assignment, Note } from '../types'; 
import { getDashboardAssignmentsSummary, getDashboardNotesSummary } from '../services/dataService'; // <--- Import stubbed data services

const DashboardPage: React.FC = () => {
  const { user } = useAuth(); // Access user info from AuthContext

  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);
  const [errorDashboard, setErrorDashboard] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoadingDashboard(true);
      setErrorDashboard(null);
      try {
        const [assignmentsData, notesData] = await Promise.all([
          getDashboardAssignmentsSummary(),
          getDashboardNotesSummary(),
        ]);
        setUpcomingAssignments(assignmentsData);
        setRecentNotes(notesData);
      } catch (err) {
        console.error("Failed to load dashboard summaries:", err);
        setErrorDashboard('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    loadDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <section className="dashboard-section section-card">
      <h2>Dashboard</h2>
      <p className="section-subtitle">Welcome back, {user?.email || 'Guest'}!</p>

      {isLoadingDashboard ? (
        <p className="empty-message">Loading your dashboard insights...</p>
      ) : errorDashboard ? (
        <p className="error-message">{errorDashboard}</p>
      ) : (
        <>
          <div className="dashboard-summary-grid"> {/* New Grid container */}
            {/* Upcoming Assignments Summary */}
            <div className="summary-card"> {/* New card for summaries */}
              <h3 className="section-subtitle">Upcoming Assignments</h3>
              {upcomingAssignments.length === 0 ? (
                <p>No upcoming assignments.</p>
              ) : (
                <ul className="summary-list">
                  {upcomingAssignments.slice(0, 3).map(assignment => ( // Show top 3
                    <li key={assignment.id}>
                      <strong>{assignment.title}</strong> ({assignment.course}) - Due: {assignment.deadline.split('T')[0]}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Notes Summary */}
            <div className="summary-card"> {/* New card for summaries */}
              <h3 className="section-subtitle">Recent Notes</h3>
              {recentNotes.length === 0 ? (
                <p>No recent notes.</p>
              ) : (
                <ul className="summary-list">
                  {recentNotes.slice(0, 3).map(note => ( // Show top 3
                    <li key={note.id}>
                      <strong>{note.title}</strong> ({note.course}) - Created: {new Date(note.createdAt).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div> {/* End dashboard-summary-grid */}

          <p style={{ marginTop: 'calc(var(--spacing-unit) * 2)', textAlign: 'center', color: 'var(--light-text-color)' }}>
            Your academic success starts here!
            <span role="img" aria-label="Star" style={{fontSize: '3em', display: 'block', margin: '10px auto'}}>✨</span>
          </p>
        </>
      )}
    </section>
  );
};

export default DashboardPage;