import React from 'react';
import './App.css';
import { useAuth } from './context/AuthContext';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Sidebar from './components/Sidebar'; 
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import NotesPage from './pages/NotesPage';
import CoursesPage from './pages/CoursesPage';

function App() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const navigate = useNavigate();

  // --- Temporary Test Buttons/Display ---
  // (Keeping these for now for quick auth state manipulation during development)
  const handleTestLogin = async () => {
    await login('test@example.com', 'password123');
    navigate('/dashboard');
  };

  const handleTestLogout = () => {
    logout();
    navigate('/login');
  };
  // --- End Temporary Test ---

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
                <button onClick={handleTestLogout} className="btn-inline">Logout</button> {/* Used new class */}
              </>
            ) : (
              <>
                Not logged in
                <button onClick={handleTestLogin} className="btn-inline">Test Login</button> {/* Used new class */}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-layout-container container"> 
        {isAuthenticated && <Sidebar />} 
        <div className="main-content-view"> 
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />

            {/* Default route - redirect based on auth status */}
            <Route path="/" element={isAuthenticated ? <ProtectedRoute><DashboardPage /></ProtectedRoute> : <LoginPage />} />

            {/* Fallback for unmatched routes */}
            <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}><h2>404 - Page Not Found</h2><p>The page you are looking for does not exist.</p></div>} />
          </Routes>
        </div>
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