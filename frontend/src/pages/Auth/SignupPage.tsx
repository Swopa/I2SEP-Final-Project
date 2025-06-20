import React from 'react';
import { Link } from 'react-router-dom'; 
import '../../App.css'; 

const SignupPage: React.FC = () => {
  // Placeholder state for inputs (will be updated in a later task - B6)
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Placeholder submission handler (will be updated in a later task - B6)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    console.log('Signup form submitted (stubbed)!');
    console.log('Email:', email);
    console.log('Password:', password);
    // No API call or actual signup logic here yet
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2>Create Your Academic Hub Account</h2>
        <p className="auth-tagline">Sign up to start organizing your schoolwork.</p>

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

          <button type="submit" className="btn btn-primary auth-btn">Sign Up</button>
        </form>

        <p className="auth-link-text">
          Already have an account? <Link to="/login" className="auth-link">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;