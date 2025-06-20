import React from 'react';
import { Link } from 'react-router-dom'; 
import '../../App.css'; 

const LoginPage: React.FC = () => {
  // Placeholder state for inputs (will be updated in a later task - B7)
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Placeholder submission handler (will be updated in a later task - B7)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    console.log('Login form submitted (stubbed)!');
    console.log('Email:', email);
    console.log('Password:', password);
    // No API call or actual login logic here yet
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2>Welcome Back!</h2>
        <p className="auth-tagline">Log in to your Academic Hub account.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-btn">Log In</button>
        </form>

        <p className="auth-link-text">
          Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;