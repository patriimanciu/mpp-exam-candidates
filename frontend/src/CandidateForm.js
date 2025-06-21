import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CandidateForm.css';

const CandidateForm = ({ token }) => {
    const [candidate, setCandidate] = useState({
        name: '',
        image: '',
        political_party: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            const fetchCandidate = async () => {
                try {
                    const response = await fetch(`/api/candidates/${id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch candidate data.');
                    }
                    const data = await response.json();
                    setCandidate(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchCandidate();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCandidate(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = isEditing ? `/api/candidates/${id}` : '/api/candidates';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(candidate),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save candidate.');
            }
            navigate('/candidates');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <div className="loading">Loading...</div>;

    return (
        <div className="form-container">
            <h2>{isEditing ? 'Edit Candidate' : 'Add New Candidate'}</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="candidate-form">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={candidate.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="political_party">Political Party</label>
                    <input
                        type="text"
                        id="political_party"
                        name="political_party"
                        value={candidate.political_party}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image">Image URL</label>
                    <input
                        type="url"
                        id="image"
                        name="image"
                        value={candidate.image}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={candidate.description}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={loading} className="button-save">
                        {loading ? 'Saving...' : 'Save Candidate'}
                    </button>
                    <button type="button" onClick={() => navigate('/candidates')} className="button-cancel">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CandidateForm; 