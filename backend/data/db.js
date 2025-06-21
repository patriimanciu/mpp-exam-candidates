import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

// --- Direct configuration loading ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, 'db-config.json');

let connectionString;
try {
  const configFile = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configFile);
  connectionString = config.connectionString;
} catch (error) {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('!!! ERROR: Could not read db-config.json         !!!');
  console.error('!!! Please ensure backend/data/db-config.json    !!!');
  console.error('!!! exists and contains your connection string.  !!!');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  process.exit(1);
}

if (!connectionString || connectionString === "YOUR_NEON_DATABASE_URL_HERE") {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('!!! ERROR: Database URL is not set in            !!!');
  console.error('!!! backend/data/db-config.json                  !!!');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

pool.on('connect', () => {
  console.log('✅ Successfully connected to Neon database.');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;