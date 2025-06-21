import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pool from './data/db.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Helper to get all candidates from DB and broadcast
const broadcastCandidates = async () => {
  try {
    const result = await pool.query('SELECT * FROM candidates ORDER BY votes DESC, name ASC');
    io.emit('candidates-updated', result.rows);
  } catch (error) {
    console.error('Error fetching/broadcasting candidates:', error);
  }
};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  broadcastCandidates(); // Send initial data
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MPP Exam Backend API' });
});

// GET all candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates ORDER BY votes DESC, name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve candidates' });
  }
});

// POST a new candidate
app.post('/api/candidates', async (req, res) => {
  const { name, image, political_party, description } = req.body;
  if (!name || !political_party) {
    return res.status(400).json({ error: 'Name and political party are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO candidates (name, image, political_party, description, votes) VALUES ($1, $2, $3, $4, 0) RETURNING *',
      [name, image, political_party, description]
    );
    broadcastCandidates(); // Update all clients
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// PUT (update) a candidate's info
app.put('/api/candidates/:id', async (req, res) => {
  const { id } = req.params;
  const { name, image, political_party, description, votes } = req.body;
  if (!name || !political_party) {
    return res.status(400).json({ error: 'Name and political party are required' });
  }
  try {
    const result = await pool.query(
      'UPDATE candidates SET name = $1, image = $2, political_party = $3, description = $4, votes = $5 WHERE id = $6 RETURNING *',
      [name, image, political_party, description, votes, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    broadcastCandidates(); // Update all clients
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// DELETE a candidate
app.delete('/api/candidates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    broadcastCandidates(); // Update all clients
    res.status(204).send(); // No content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// POST to increment a candidate's vote count
app.post('/api/candidates/:id/vote', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE candidates SET votes = votes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    broadcastCandidates(); // Update all clients
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to increment votes' });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 