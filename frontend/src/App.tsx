import React from 'react';
import './App.css'; // Import the CSS file
import { useAuth } from './context/AuthContext';
import { Routes, Route, useNavigate } from 'react-router-dom';


import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import NotesPage from './pages/NotesPage';
import CoursesPage from './pages/CoursesPage';

//const API_BASE_URL = 'http://localhost:3001';

function App() {


  const { isAuthenticated, user, login, logout } = useAuth();
  const navigate = useNavigate();

   const handleTestLogin = async () => {
    await login('test@example.com', 'password123');
    navigate('/dashboard');
  };

  const handleTestLogout = () => {
    logout();
    navigate('/login');
  };

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
        {/* Define your routes here */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes (we'll implement ProtectedRoute wrapper in Task 10) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/courses" element={<CoursesPage />} />

          {/* Default route - redirect based on auth status */}
          <Route path="/" element={isAuthenticated ? <DashboardPage /> : <LoginPage />} />

          {/* Fallback for unmatched routes */}
          <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}><h2>404 - Page Not Found</h2><p>The page you are looking for does not exist.</p></div>} />
        </Routes>
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