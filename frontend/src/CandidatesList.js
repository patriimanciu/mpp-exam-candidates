import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import PartyChart from './PartyChart';
import './CandidatesList.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const CandidatesList = ({ token, user, onVoteSuccess, loginNews }) => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [winners, setWinners] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await fetch('/api/candidates');
                if (!response.ok) throw new Error('Failed to fetch candidates.');
                const data = await response.json();
                setCandidates(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();

        const socket = io(BACKEND_URL, { auth: { token } });
        socket.on('candidates-updated', setCandidates);
        return () => socket.disconnect();
    }, [token]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this candidate?')) {
            try {
                const response = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete candidate.');
            } catch (err) {
                setError(err.message);
            }
        }
    };
    
    const handleVote = async (id) => {
        try {
            const response = await fetch(`/api/candidates/${id}/vote`, { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to vote.');
            }
            onVoteSuccess();
        } catch (err) {
            alert(err.message);
            setError(err.message);
        }
    };

    const handleSimulation = async () => {
        if (window.confirm('This will simulate 1000 random votes and determine the top two candidates. Are you sure?')) {
            try {
                const response = await fetch('/api/simulate-votes', { method: 'POST' });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Simulation failed.');
                setWinners(result.winners);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) return <div className="loading">Loading candidates...</div>;
    if (error) return <div className="error-banner">{error}</div>;

    return (
        <div className="container">
            {loginNews && (
                <div className="fake-news-alert">
                    <p>&#x1F6A8; FAKE NEWS ALERT! &#x1F6A8;</p>
                    <p className="news-text">{loginNews}</p>
                </div>
            )}

            {winners && (
                <div className="winners-announcement">
                    <h2>First Round Winners!</h2>
                    <p>Congratulations to the top two candidates who will proceed to the final round.</p>
                    <div className="winners-list">
                        <div className="winner-card">
                            <span className="winner-rank gold">🏆 1st</span>
                            <span className="winner-name">{winners[0].name}</span>
                            <span className="winner-votes">{winners[0].votes} Votes</span>
                        </div>
                        <div className="winner-card">
                            <span className="winner-rank silver">🥈 2nd</span>
                            <span className="winner-name">{winners[1].name}</span>
                            <span className="winner-votes">{winners[1].votes} Votes</span>
                        </div>
                    </div>
                    <button onClick={() => setWinners(null)} className="dismiss-btn">Dismiss</button>
                </div>
            )}

            <div className="header">
                <h1>MPP Exam - Political Candidates</h1>
                <p>Meet the candidates running for election</p>
                {user?.has_voted && <p className="voted-message">You have already cast your vote.</p>}
                <div className="header-buttons">
                    <Link to="/candidates/new" className="add-candidate-btn">+ Add New Candidate</Link>
                    <button onClick={handleSimulation} className="simulate-btn">Simulate First Round</button>
                </div>
            </div>
            
            <PartyChart candidates={candidates} />
            
            <div className="candidates-grid">
                {candidates.map((candidate) => (
                    <div key={candidate.id} className="candidate-card">
                        <img 
                            src={candidate.image || 'https://via.placeholder.com/300x400?text=No+Image'} 
                            alt={candidate.name} 
                            className="candidate-image"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'; }}
                        />
                        <div className="candidate-info">
                            <h3 className="candidate-name">{candidate.name}</h3>
                            <div className="candidate-party">{candidate.political_party}</div>
                            <p className="candidate-description">{candidate.description}</p>
                            <div className="candidate-votes">Votes: {candidate.votes}</div>
                            <div className="candidate-actions">
                                <button className="btn-edit" onClick={() => navigate(`/candidates/${candidate.id}/edit`)}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(candidate.id)}>Delete</button>
                                <button className="btn-vote" onClick={() => handleVote(candidate.id)} disabled={user?.has_voted}>
                                    {user?.has_voted ? 'Voted' : 'Vote'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {candidates.length === 0 && !loading && (
                <div className="no-candidates">
                    <p>No candidates found. Add your first candidate!</p>
                    <Link to="/candidates/new" className="add-candidate-btn">+ Add New Candidate</Link>
                </div>
            )}
        </div>
    );
};

export default CandidatesList; 