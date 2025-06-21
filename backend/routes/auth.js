import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../data/db.js';

const router = express.Router();

// Register new voter
router.post('/register', async (req, res) => {
  const { cnp, password } = req.body;
  if (!cnp || !password) {
    return res.status(400).json({ error: 'CNP and password are required.' });
  }
  if (!/^\d{13}$/.test(cnp)) {
    return res.status(400).json({ error: 'CNP must be exactly 13 digits.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO voters (cnp, password) VALUES ($1, $2) RETURNING cnp, has_voted',
      [cnp, hashedPassword]
    );

    const token = jwt.sign({ cnp: newUser.rows[0].cnp }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: newUser.rows[0] });

  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'A user with this CNP already exists.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Login voter
router.post('/login', async (req, res) => {
  const { cnp, password } = req.body;
  if (!cnp || !password) {
    return res.status(400).json({ error: 'CNP and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM voters WHERE cnp = $1', [cnp]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid CNP or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid CNP or password.' });
    }

    const token = jwt.sign({ cnp: user.cnp }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { cnp: user.cnp, has_voted: user.has_voted } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

export default router; 