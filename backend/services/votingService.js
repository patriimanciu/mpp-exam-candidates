import pool from '../data/db.js';

const TOTAL_VOTES_TO_SIMULATE = 1000;

export async function runVoteSimulation() {
    console.log('Starting voting simulation via API...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const candidatesResult = await client.query('SELECT id, name FROM candidates');
        const candidates = candidatesResult.rows;

        if (candidates.length < 2) {
            throw new Error('Simulation requires at least two candidates.');
        }

        const voteCounts = {};
        for (let i = 0; i < TOTAL_VOTES_TO_SIMULATE; i++) {
            const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
            voteCounts[randomCandidate.id] = (voteCounts[randomCandidate.id] || 0) + 1;
        }

        for (const candidateId in voteCounts) {
            const votes = voteCounts[candidateId];
            await client.query('UPDATE candidates SET votes = votes + $1 WHERE id = $2', [votes, candidateId]);
        }

        const winnersResult = await client.query('SELECT name, votes FROM candidates ORDER BY votes DESC LIMIT 2');
        
        await client.query('COMMIT');
        
        return winnersResult.rows;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('An error occurred during the simulation:', err);
        throw err; // Re-throw the error to be handled by the API endpoint
    } finally {
        client.release();
    }
} 