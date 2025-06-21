import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { signup } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext';
import '../../App.css'; 

const SignupPage: React.FC = () => {
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
      const response = await signup(email, password);

      if (response.success && response.user && response.token) {
        console.log('Signup successful!', response.message);
        await authContextLogin(email, password); 

        navigate('/dashboard'); 
      } else {
        setError(response.message || 'Signup failed. Please try again.');
        console.error('Signup failed:', response.message);
      }
    } catch (err) {
      console.error('An unexpected error occurred during signup:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false); 
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
              disabled={isLoading} 
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
              disabled={isLoading}
            />
          </div>

          {error && <p className="error-message">{error}</p>} 

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