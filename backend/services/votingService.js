import pool from '../data/db.js';

export async function runVoteSimulation() {
    console.log('Starting score-based voting simulation...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Reset all candidate votes to 0 for a clean simulation
        await client.query('UPDATE candidates SET votes = 0');

        const votersResult = await client.query('SELECT cnp FROM voters');
        const voters = votersResult.rows;

        if (voters.length === 0) {
            throw new Error('No voters found to simulate voting.');
        }

        const candidatesResult = await client.query('SELECT id, name FROM candidates');
        const candidates = candidatesResult.rows;
        const candidateIdMap = new Map(candidates.map(c => [c.name, c.id]));
        
        const voteCounts = {};
        candidates.forEach(c => { voteCounts[c.id] = 0; });

        for (const voter of voters) {
            const newsResult = await client.query(
                'SELECT candidate, is_positive FROM FakeNews WHERE voter_cnp = $1',
                [voter.cnp]
            );
            
            if (newsResult.rows.length === 0) continue; // Voter has no news, does not vote

            const scores = {};
            for (const news of newsResult.rows) {
                scores[news.candidate] = (scores[news.candidate] || 0) + (news.is_positive ? 1 : -1);
            }

            let topScore = -Infinity;
            let winners = [];
            for (const candidateName in scores) {
                if (scores[candidateName] > topScore) {
                    topScore = scores[candidateName];
                    winners = [candidateName];
                } else if (scores[candidateName] === topScore) {
                    winners.push(candidateName);
                }
            }

            if (topScore > 0 && winners.length > 0) {
                const winningCandidateName = winners[Math.floor(Math.random() * winners.length)];
                const winningCandidateId = candidateIdMap.get(winningCandidateName);
                if (winningCandidateId) {
                    voteCounts[winningCandidateId]++;
                }
            }
        }
        
        for (const candidateId in voteCounts) {
            if (voteCounts[candidateId] > 0) {
                await client.query('UPDATE candidates SET votes = $1 WHERE id = $2', [voteCounts[candidateId], candidateId]);
            }
        }

        const finalResult = await client.query('SELECT name, votes FROM candidates ORDER BY votes DESC, name ASC LIMIT 2');
        
        await client.query('COMMIT');
        
        return finalResult.rows;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('An error occurred during the score-based simulation:', err);
        throw err;
    } finally {
        client.release();
    }
} 