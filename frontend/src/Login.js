import React, { useState } from 'react';
import './Auth.css';

const Login = ({ onLogin, onSwitch }) => {
  const [cnp, setCnp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnp, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
      }
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h2>Welcome Back</h2>
        <p>Please enter your credentials to log in.</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="cnp">CNP</label>
            <input
              type="text"
              id="cnp"
              value={cnp}
              onChange={(e) => setCnp(e.target.value)}
              required
              maxLength="13"
              placeholder="Your 13-digit CNP"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <div className="switch-auth-mode">
          Don't have an account?
          <button onClick={onSwitch}>Sign up</button>
        </div>
      </div>
    </div>
  );
};

export default Login; 