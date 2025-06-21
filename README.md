# MPP Exam - Political Candidates App

A full-stack application for managing political candidates with real-time charts and WebSocket functionality.

## Features

- ✅ **CRUD Operations**: Create, Read, Update, Delete candidates
- ✅ **Real-time Charts**: Dynamic bar charts showing candidates per party
- ✅ **WebSocket Integration**: Real-time updates across multiple clients
- ✅ **Random Data Generation**: Automated candidate generation for testing
- ✅ **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with Express
- **Socket.io** for WebSocket functionality
- **CORS** enabled for cross-origin requests

### Frontend
- **React** with hooks
- **Socket.io-client** for real-time communication
- **Custom CSS** for styling
- **React Router** for navigation

## Railway Deployment Instructions

### Prerequisites
1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login to Railway: `railway login`

### Backend Deployment

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Initialize Railway project:**
   ```bash
   railway init
   ```

3. **Set environment variables:**
   ```bash
   railway variables set FRONTEND_URL=https://your-frontend-url.railway.app
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Get the backend URL:**
   ```bash
   railway domain
   ```

### Frontend Deployment

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Initialize Railway project:**
   ```bash
   railway init
   ```

3. **Set environment variables:**
   ```bash
   railway variables set REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Get the frontend URL:**
   ```bash
   railway domain
   ```

### Environment Variables

#### Backend (.env)
```env
PORT=5001
FRONTEND_URL=https://your-frontend-url.railway.app
NODE_ENV=production
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
```

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/:id` - Get single candidate
- `POST /api/candidates` - Create new candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

## WebSocket Events

- `candidates-updated` - Full candidate list update
- `candidate-added` - New candidate notification
- `candidate-updated` - Candidate edit notification
- `candidate-deleted` - Candidate deletion notification
- `start-generation` - Begin random generation
- `stop-generation` - Stop random generation

## Project Structure

```
mpp-exam/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── railway.toml
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── CandidatesList.js
│   │   ├── CandidateForm.js
│   │   ├── PartyChart.js
│   │   └── *.css
│   ├── package.json
│   └── railway.toml
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