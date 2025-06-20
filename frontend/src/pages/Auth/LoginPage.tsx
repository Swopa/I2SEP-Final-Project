import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import '../../App.css'; 
import { login } from '../../services/AuthService'; 
import { useAuth } from '../../context/AuthContext'; 

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>(''); 
  const [password, setPassword] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null); 

  const navigate = useNavigate(); 
  const { login: authContextLogin } = useAuth(); 

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 

    setError(null); 
    setIsLoading(true); 

    try {
      const response = await login(email, password);
      if (response.success && response.user && response.token) {
        console.log('Login successful!', response.message);
        await authContextLogin(email, password); 

        navigate('/dashboard'); 
      } else {
        // If login failed, set the error message
        setError(response.message || 'Login failed. Please check your credentials.');
        console.error('Login failed:', response.message);
      }
    } catch (err) {
      console.error('An unexpected error occurred during login:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
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
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p className="auth-link-text">
          Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;