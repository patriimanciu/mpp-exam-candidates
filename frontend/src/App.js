import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import CandidatesList from './CandidatesList';
import CandidateForm from './CandidateForm';
import Login from './Login';
import Register from './Register';
import './App.css';

// Get backend URL from environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [isRegister, setIsRegister] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [socket, setSocket] = useState(null);

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const markUserAsVoted = () => {
    const updatedUser = { ...user, has_voted: true };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // This effect hook is designed to automatically log out the user if an API call
  // returns a 401 (Unauthorized) or 403 (Forbidden) status, which indicates an
  // invalid or expired token. It works by "monkey-patching" the global fetch function.
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (url, options) => {
      // Add the Authorization header to all outgoing API requests
      const augmentedOptions = {
        ...options,
        headers: {
          ...options?.headers,
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      };
      
      const response = await originalFetch(url, augmentedOptions);

      if ((response.status === 401 || response.status === 403) && url.startsWith('/api/')) {
        console.error('Authentication error, logging out.');
        handleLogout();
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [handleLogout]);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // WebSocket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setError('Connection lost. Trying to reconnect...');
    });

    newSocket.on('candidates-updated', (updatedCandidates) => {
      setCandidates(updatedCandidates);
      setLoading(false);
    });

    newSocket.on('candidate-added', (newCandidate) => {
      console.log('New candidate added:', newCandidate);
    });

    newSocket.on('candidate-updated', (updatedCandidate) => {
      console.log('Candidate updated:', updatedCandidate);
    });

    newSocket.on('candidate-deleted', (deletedCandidate) => {
      console.log('Candidate deleted:', deletedCandidate);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setError('Failed to connect to server. Please check if the backend is running.');
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // API functions for CRUD operations
  const createCandidate = async (candidateData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create candidate');
      }
      
      const newCandidate = await response.json();
      return newCandidate;
    } catch (err) {
      setError('Failed to create candidate: ' + err.message);
      console.error('Error creating candidate:', err);
      throw err;
    }
  };

  const updateCandidate = async (id, candidateData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/candidates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update candidate');
      }
      
      const updatedCandidate = await response.json();
      return updatedCandidate;
    } catch (err) {
      setError('Failed to update candidate: ' + err.message);
      console.error('Error updating candidate:', err);
      throw err;
    }
  };

  const deleteCandidate = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/candidates/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete candidate');
      }
    } catch (err) {
      setError('Failed to delete candidate: ' + err.message);
      console.error('Error deleting candidate:', err);
      throw err;
    }
  };

  // WebSocket-based generation control
  const startGenerating = () => {
    if (socket) {
      socket.emit('start-generation');
      setIsGenerating(true);
    }
  };

  const stopGenerating = () => {
    if (socket) {
      socket.emit('stop-generation');
      setIsGenerating(false);
    }
  };

  const handleSave = async (candidateData) => {
    try {
      if (editingCandidate && editingCandidate.id) {
        await updateCandidate(editingCandidate.id, candidateData);
      } else {
        await createCandidate(candidateData);
      }
      setEditingCandidate(null);
    } catch (err) {
      // Error is already handled in the API functions
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await deleteCandidate(id);
      } catch (err) {
        // Error is already handled in the API function
      }
    }
  };

  if (!token) {
    return isRegister ? (
      <Register onRegister={handleLogin} onSwitch={() => setIsRegister(false)} />
    ) : (
      <Login onLogin={handleLogin} onSwitch={() => setIsRegister(true)} />
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Welcome, {user.cnp}</h1>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/candidates" />} />
            <Route path="/candidates" element={<CandidatesList token={token} user={user} onVoteSuccess={markUserAsVoted} />} />
            <Route path="/candidates/new" element={<CandidateForm token={token} onSave={() => {}} />} />
            <Route path="/candidates/:id/edit" element={<CandidateForm token={token} onSave={() => {}} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 