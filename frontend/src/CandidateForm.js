import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandidateForm.css';

function CandidateForm({ candidate, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    political_party: '',
    description: '',
    votes: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (candidate && candidate.id) {
      setFormData({
        name: candidate.name || '',
        image: candidate.image || '',
        political_party: candidate.political_party || '',
        description: candidate.description || '',
        votes: candidate.votes || 0
      });
    } else {
      setFormData({
        name: '',
        image: '',
        political_party: '',
        description: '',
        votes: 0
      });
    }
  }, [candidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.political_party.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="candidate-form-container">
      <div className="candidate-form">
        <h2>{candidate && candidate.id ? 'Edit Candidate' : 'Add New Candidate'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter candidate name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
          </div>

          <div className="form-group">
            <label htmlFor="political_party">Political Party *</label>
            <input
              type="text"
              id="political_party"
              name="political_party"
              value={formData.political_party}
              onChange={handleChange}
              placeholder="Enter political party"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter candidate description"
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {candidate && candidate.id ? 'Update' : 'Add'} Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CandidateForm; 