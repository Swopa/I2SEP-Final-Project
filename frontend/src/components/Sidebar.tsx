import React from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import '../App.css'; 

const Sidebar: React.FC = () => {
  const location = useLocation(); 

  return (
    <nav className="sidebar">
      <ul className="sidebar-nav-list">
        <li className="sidebar-nav-item">
          <Link to="/dashboard" className={`sidebar-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            Dashboard
          </Link>
        </li>
        <li className="sidebar-nav-item">
          <Link to="/assignments" className={`sidebar-nav-link ${location.pathname === '/assignments' ? 'active' : ''}`}>
            Assignments
          </Link>
        </li>
        <li className="sidebar-nav-item">
          <Link to="/notes" className={`sidebar-nav-link ${location.pathname === '/notes' ? 'active' : ''}`}>
            Notes
          </Link>
        </li>
        <li className="sidebar-nav-item">
          <Link to="/courses" className={`sidebar-nav-link ${location.pathname === '/courses' ? 'active' : ''}`}>
            Courses
          </Link>
        </li>
      </ul>
      {/* You can add a logout link here later if it's part of the sidebar */}
    </nav>
  );
};

export default Sidebar;