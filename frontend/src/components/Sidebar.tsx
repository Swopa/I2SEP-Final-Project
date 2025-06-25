import React from 'react';
import { Link, useLocation, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import '../App.css'; 

const Sidebar: React.FC = () => {
  const location = useLocation(); 
  const { logout } = useAuth(); // Get the logout function from AuthContext
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call the logout function from the AuthContext
    navigate('/login'); // Redirect to the login page after logout
  };

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
        <li className="sidebar-nav-item sidebar-logout-item"> {/* Added a class for specific styling */}
          <button onClick={handleLogout} className="sidebar-logout-btn">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;