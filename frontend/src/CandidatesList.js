import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PartyChart from './PartyChart';
import './CandidatesList.css';

function CandidatesList({ 
  candidates, 
  onUpdateCandidate, 
  onDeleteCandidate, 
  isGenerating, 
  onStartGenerating, 
  onStopGenerating 
}) {
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const handleEdit = (candidate) => {
    setEditingId(candidate.id);
    onUpdateCandidate(candidate);
    navigate('/form');
  };

  const handleAdd = () => {
    onUpdateCandidate({});
    navigate('/form');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      onDeleteCandidate(id);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>MPP Exam - Political Candidates</h1>
        <p>Meet the candidates running for election</p>
        <div className="header-buttons">
          <button 
            className="add-candidate-btn"
            onClick={handleAdd}
          >
            + Add New Candidate
          </button>
          <button 
            className={`generate-btn ${isGenerating ? 'generating' : ''}`}
            onClick={isGenerating ? onStopGenerating : onStartGenerating}
          >
            {isGenerating ? '🛑 Stop Generating' : '🎲 Start Generating Random Data'}
          </button>
        </div>
      </div>
      
      {/* Party Statistics Chart */}
      <PartyChart candidates={candidates} />
      
      <div className="candidates-grid">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="candidate-card">
            <img 
              src={candidate.image} 
              alt={candidate.name} 
              className="candidate-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
              }}
            />
            <div className="candidate-info">
              <h3 className="candidate-name">{candidate.name}</h3>
             <div className="candidate-party">{candidate.political_party}</div>
              <p className="candidate-description">{candidate.description}</p>
              <div className="candidate-votes">Votes: {candidate.votes}</div>
              
              <div className="candidate-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEdit(candidate)}
                >
                  Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(candidate.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {candidates.length === 0 && (
        <div className="no-candidates">
          <p>No candidates found. Add your first candidate!</p>
          <button 
            className="add-candidate-btn"
            onClick={handleAdd}
          >
            + Add New Candidate
          </button>
        </div>
      )}
    </div>
  );
}

export default CandidatesList; 