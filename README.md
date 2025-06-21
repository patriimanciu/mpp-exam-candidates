# MPP Exam - Political Candidates App

A full-stack application for managing and viewing political candidates, with data served from a central database and real-time updates via WebSockets.

## Features

- ✅ **Database Integration**: Candidate data is managed in a PostgreSQL database.
- ✅ **CRUD Operations**: Create, Read, Update, and Delete candidates.
- ✅ **Voting System**: Increment vote counts for candidates.
- ✅ **Real-time Updates**: WebSocket integration ensures all connected clients see changes instantly.
- ✅ **Dynamic Sorting**: Candidates are automatically sorted by vote count.
- ✅ **Responsive Design**: Works on desktop and mobile devices.

## Tech Stack

### Backend
- **Node.js** with **Express**
- **PostgreSQL** (e.g., on Neon)
- **Socket.io** for WebSocket functionality
- **CORS** enabled for cross-origin requests

### Frontend
- **React** with hooks
- **Socket.io-client** for real-time communication
- **React Router** for navigation
- **Custom CSS** for styling

## Database Schema

The application requires a PostgreSQL database with a `Candidates` table. Use the following SQL command to create it:

```sql
CREATE TABLE "Candidates" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    political_party TEXT,
    description TEXT,
    votes INTEGER DEFAULT 0
);
```
*Note: The table name "Candidates" is case-sensitive and must be quoted.*

## Environment Variables

To run this project, you need a `.env` file in the `backend` directory with your database connection details.

### Backend (`backend/.env`)
```env
# Full connection string from your Neon (or other PostgreSQL) provider
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require

# The URL of your running frontend application
FRONTEND_URL=http://localhost:3000
```

## Local Development

### Prerequisites
1. **Node.js 18+** installed.
2. A running **PostgreSQL** database.
3. The `Candidates` table created in your database using the schema above.
4. The `backend/.env` file configured with your database URL.

### Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The server will start on `http://localhost:5001`.

### Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```
The application will be available at `http://localhost:3000`.

## API Endpoints

-   `GET /api/candidates`: Get a list of all candidates.
-   `POST /api/candidates`: Create a new candidate.
-   `PUT /api/candidates/:id`: Update an existing candidate.
-   `DELETE /api/candidates/:id`: Delete a candidate.
-   `POST /api/candidates/:id/vote`: Increment the vote count for a candidate.

## Project Structure
```
mpp-exam/
├── backend/
│   ├── data/
│   │   └── db.js         # Database connection
│   ├── server.js         # Main Express server
│   ├── package.json
│   └── .env              # (You must create this)
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── CandidatesList.js
│   │   ├── CandidateForm.js
│   │   └── ...
│   └── package.json
└── README.md
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is set correctly in backend environment variables
2. **WebSocket Connection Failed**: Check that the backend URL is correct in frontend environment variables
3. **Build Failures**: Make sure all dependencies are properly installed

### Railway Specific

1. **Health Check Failures**: The backend includes a `/health` endpoint for Railway health checks
2. **Port Issues**: Railway automatically sets the `PORT` environment variable
3. **Environment Variables**: Use Railway's dashboard to set environment variables

## License

MIT License 