import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import CandidatesList from './CandidatesList';
import CandidateForm from './CandidateForm';
import './App.css';

// Get backend URL from environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [socket, setSocket] = useState(null);

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

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>MPP Exam - Political Candidates</h1>
          <p>Meet the candidates running for election</p>
        </div>
        <div className="loading">Loading candidates...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        <Routes>
          <Route 
            path="/" 
            element={
              <CandidatesList 
                candidates={candidates}
                onUpdateCandidate={setEditingCandidate}
                onDeleteCandidate={handleDelete}
                isGenerating={isGenerating}
                onStartGenerating={startGenerating}
                onStopGenerating={stopGenerating}
              />
            } 
          />
          <Route 
            path="/form" 
            element={
              <CandidateForm 
                candidate={editingCandidate}
                onSave={handleSave}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 