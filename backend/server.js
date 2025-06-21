import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import pool from './data/db.js';
import authRoutes from './routes/auth.js';
import authenticateToken from './middleware/auth.js';

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

// Routes
// Public route for authentication
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MPP Exam Backend API' });
});

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
  // Protected broadcast - ideally, you'd check a token here too
  // For now, we'll keep it simple and allow connections.
  broadcastCandidates(); 
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Protected Candidate Routes
app.get('/api/candidates', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates ORDER BY votes DESC, name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve candidates' });
  }
});

app.post('/api/candidates', authenticateToken, async (req, res) => {
  const { name, image, political_party, description } = req.body;
  if (!name || !political_party) {
    return res.status(400).json({ error: 'Name and political party are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO candidates (name, image, political_party, description, votes) VALUES ($1, $2, $3, $4, 0) RETURNING *',
      [name, image, political_party, description]
    );
    broadcastCandidates();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

app.put('/api/candidates/:id', authenticateToken, async (req, res) => {
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
    broadcastCandidates();
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

app.delete('/api/candidates/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    broadcastCandidates();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

app.post('/api/candidates/:id/vote', authenticateToken, async (req, res) => {
  const { id: candidateId } = req.params;
  const { cnp: voterCnp } = req.user;

  if (!voterCnp) {
    return res.status(401).json({ error: 'User not identified.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if voter has already voted
    const voterResult = await client.query('SELECT has_voted FROM voters WHERE cnp = $1', [voterCnp]);
    const voter = voterResult.rows[0];

    if (voter && voter.has_voted) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'You have already voted.' });
    }

    // Increment candidate's vote
    const candidateResult = await client.query(
      'UPDATE candidates SET votes = votes + 1 WHERE id = $1 RETURNING *',
      [candidateId]
    );

    if (candidateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    // Mark voter as having voted
    await client.query('UPDATE voters SET has_voted = true WHERE cnp = $1', [voterCnp]);

    await client.query('COMMIT');

    broadcastCandidates(); // Broadcast updated list to all clients
    res.json(candidateResult.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction Error:', err);
    res.status(500).json({ error: 'Failed to process vote.' });
  } finally {
    client.release();
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 