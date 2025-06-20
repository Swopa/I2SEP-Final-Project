import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { signup } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext';
import '../../App.css'; 

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState<string>(''); // Explicitly type useState
  const [password, setPassword] = useState<string>(''); // Explicitly type useState
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for error messages

  const navigate = useNavigate(); // Get the navigate function
  const { login: authContextLogin } = useAuth(); // Get the login function from AuthContext



  // Placeholder submission handler (will be updated in a later task - B6)
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors
    setIsLoading(true); // Set loading state

    try {
      // Call the stubbed signup function from authService
      const response = await signup(email, password);

      if (response.success && response.user && response.token) {
        console.log('Signup successful!', response.message);
        // If signup is successful, also "log in" the user via the AuthContext
        // For the stub, we just simulate the login effect.
        // In a real app, successful signup might directly return a token to log in.
        // For now, AuthContext's login stub will also set isAuthenticated.
        // We pass the credentials even though authContextLogin is also a stub.
        await authContextLogin(email, password); // Use the AuthContext's login stub

        navigate('/dashboard'); // Redirect to dashboard on successful signup
      } else {
        setError(response.message || 'Signup failed. Please try again.');
        console.error('Signup failed:', response.message);
      }
    } catch (err) {
      console.error('An unexpected error occurred during signup:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
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
              disabled={isLoading} // Disable inputs when loading
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
              disabled={isLoading} // Disable inputs when loading
            />
          </div>

          {error && <p className="error-message">{error}</p>} {/* Display error message */}

          <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-link-text">
          Already have an account? <Link to="/login" className="auth-link">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;