import pool from '../data/db.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const TOTAL_VOTERS_TO_GENERATE = 100;

// Function to generate a random 13-digit CNP as a string
function generateCnp() {
    let cnp = '';
    for (let i = 0; i < 13; i++) {
        cnp += Math.floor(Math.random() * 10);
    }
    return cnp;
}

async function generateVoters() {
    console.log(`Starting generation of ${TOTAL_VOTERS_TO_GENERATE} voters...`);
    const client = await pool.connect();
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    try {
        await client.query('BEGIN');
        
        const existingCnpsResult = await client.query('SELECT cnp FROM voters');
        const existingCnps = new Set(existingCnpsResult.rows.map(r => r.cnp));
        
        let votersGenerated = 0;
        // Limit attempts to prevent an infinite loop if CNP generation is unlucky
        let attempts = 0; 
        const maxAttempts = TOTAL_VOTERS_TO_GENERATE * 2;

        while (votersGenerated < TOTAL_VOTERS_TO_GENERATE && attempts < maxAttempts) {
            const cnp = generateCnp();
            if (!existingCnps.has(cnp)) {
                await client.query(
                    'INSERT INTO voters (cnp, password, has_voted) VALUES ($1, $2, false)',
                    [cnp, hashedPassword]
                );
                existingCnps.add(cnp); // Add to set to prevent duplicates within this run
                votersGenerated++;
                console.log(`Generated voter ${votersGenerated}/${TOTAL_VOTERS_TO_GENERATE}`);
            }
            attempts++;
        }

        if (votersGenerated < TOTAL_VOTERS_TO_GENERATE) {
            console.log(`\nWarning: Could only generate ${votersGenerated} unique voters after ${maxAttempts} attempts.`);
        }
        
        await client.query('COMMIT');
        
        console.log('\n--- Voter Generation Complete ---');
        console.log(`${votersGenerated} new voters have been added to the database.`);
        console.log(`Default password for all new voters is: "${defaultPassword}"`);
        console.log('--------------------------------\n');
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('An error occurred during voter generation:', err);
    } finally {
        client.release();
        pool.end();
    }
}

generateVoters(); 