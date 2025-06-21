import React, { useState } from 'react';
import './Auth.css';

const Register = ({ onRegister, onSwitch }) => {
  const [cnp, setCnp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cnp.length !== 13 || !/^\d+$/.test(cnp)) {
      setError('CNP must be exactly 13 digits.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnp, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }
      onRegister(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h2>Create Account</h2>
        <p>Join the platform by creating a new account.</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="cnp">CNP (13 digits)</label>
            <input
              type="text"
              id="cnp"
              value={cnp}
              onChange={(e) => setCnp(e.target.value)}
              required
              maxLength="13"
              pattern="\d{13}"
              title="CNP must be exactly 13 digits."
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
              minLength="6"
              placeholder="Minimum 6 characters"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="switch-auth-mode">
          Already have an account?
          <button onClick={onSwitch}>Log in</button>
        </div>
      </div>
    </div>
  );
};

export default Register; 