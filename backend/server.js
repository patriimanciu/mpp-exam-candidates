import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Sample candidates data (in a real app, this would come from a database)
let candidates = [
  {
    id: 1,
    name: "Nicușor Dan",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAwrXV1JzLbld7Blw7jtHu_sKIEy-OaTI2vg&s",
    politicalParty: "Independent",
    description: "Mathematician and civic activist, served as Mayor of Bucharest (2020–2025), now President of Romania (since May 26, 2025), focuses on anti‑corruption, European integration, and public finance reform."
  },
  {
    id: 2,
    name: "Ilie Bolojan",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTPAy398wllLo01_Ff24cX9Q8riNzyR_fQNg&s",
    politicalParty: "PNL",
    description: "Former mayor of Oradea and Senate President, designated Prime Minister (June 20, 2025), centre‑right, pro‑EU, committed to fiscal responsibility and good governance."
  },
  {
    id: 3,
    name: "Cătălin Predoiu",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeU4IgGbj3QRiUjWAkFLgPL4PlIrNJ-9Ahxg&s",
    politicalParty: "PNL",
    description: "Lawyer and veteran politician, served multiple times as Minister of Justice and interim Prime Minister (May–June 2025), focuses on judicial reform and rule of law."
  },
  {
    id: 4,
    name: "George Simion",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST8V3uLPYWri7iLi_Wr0z1iQHqVg4RqL6byA&s",
    politicalParty: "AUR",
    description: "Co‑founder and leader of AUR, far‑right nationalist, runner-up in the 2025 presidential election, emphasizes national sovereignty and conservative values."
  },
  {
    id: 5,
    name: "Diana Șoșoacă",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWBcksKUGWRF_3IURfoHKqV8mi1JBsW9-33g&s",
    politicalParty: "S.O.S.",
    description: "Controversial lawyer and MEP known for anti‑vaccine activism, far‑right populist, currently serving in the European Parliament."
  },
  {
    id: 6,
    name: "Călin Georgescu",
    image: "https://i0.1616.ro/media/2/2621/33238/21848288/15/calin-georgescu.jpg?width=1200",
    politicalParty: "Independent",
    description: "Radical nationalist who attempted to run for president in 2024 and 2025 but was barred by the Constitutional Court, noted for promoting nationalist and sovereigntist policies."
  },
  {
    id: 7,
    name: "Anamaria Gavrilă",
    image: "https://www.cdep.ro/parlamentari/l2020/mari/GavrilaAnamaria.JPG",
    politicalParty: "POT",
    description: "Founder and president of POT, right‑wing populist and youth‑focused, anti‑abortion, anti‑vaccine, promoting Romanian nationalism."
  }
];

// Random candidate data for generation
const randomNames = [
  "Alexandru Popescu", "Maria Ionescu", "Ion Vasilescu", "Elena Dumitrescu",
  "Vasile Marin", "Ana Stoica", "Mihai Radu", "Cristina Munteanu",
  "Gheorghe Dinu", "Laura Bălan", "Andrei Cojocaru", "Roxana Neagu",
  "Florin Toma", "Diana Popa", "Cătălin Mocanu", "Simona Gheorghe",
  "Bogdan Stan", "Adriana Marin", "Radu Ionescu", "Gabriela Dumitru"
];

const randomParties = [
  "PNL",
  "PSD", 
  "USR",
  "AUR",
  "PMP",
  "REPER",
  "Independent",
  "POT",
  "S.O.S."
];

const randomDescriptions = [
  "Experienced politician with focus on economic reform and European integration.",
  "Young activist advocating for transparency and anti-corruption measures.",
  "Former business executive promoting free market policies and entrepreneurship.",
  "Environmental advocate campaigning for sustainable development and green energy.",
  "Legal expert dedicated to judicial reform and rule of law enforcement.",
  "Community leader working on social welfare and education improvements.",
  "Veteran politician with extensive experience in foreign policy and diplomacy.",
  "Healthcare professional advocating for public health reforms and medical access.",
  "Technology entrepreneur promoting digital transformation and innovation.",
  "Academic researcher focused on scientific advancement and research funding."
];

const randomImages = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAwrXV1JzLbld7Blw7jtHu_sKIEy-OaTI2vg&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTPAy398wllLo01_Ff24cX9Q8riNzyR_fQNg&s", 
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeU4IgGbj3QRiUjWAkFLgPL4PlIrNJ-9Ahxg&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST8V3uLPYWri7iLi_Wr0z1iQHqVg4RqL6byA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWBcksKUGWRF_3IURfoHKqV8mi1JBsW9-33g&s",
  "https://i0.1616.ro/media/2/2621/33238/21848288/15/calin-georgescu.jpg?width=1200"
];

// Helper function to generate new ID
const generateId = () => {
  return Math.max(...candidates.map(c => c.id), 0) + 1;
};

// Generate random candidate
const generateRandomCandidate = () => {
  const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
  const randomParty = randomParties[Math.floor(Math.random() * randomParties.length)];
  const randomDescription = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
  const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
  
  return {
    id: generateId(),
    name: randomName,
    image: randomImage,
    politicalParty: randomParty,
    description: randomDescription
  };
};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current candidates to new client
  socket.emit('candidates-updated', candidates);
  
  // Handle start generation request
  socket.on('start-generation', () => {
    console.log('Starting random generation for client:', socket.id);
    
    const generationInterval = setInterval(() => {
      const newCandidate = generateRandomCandidate();
      candidates.push(newCandidate);
      
      // Emit to all connected clients
      io.emit('candidate-added', newCandidate);
      io.emit('candidates-updated', candidates);
    }, 500);
    
    // Store interval reference for this socket
    socket.generationInterval = generationInterval;
  });
  
  // Handle stop generation request
  socket.on('stop-generation', () => {
    console.log('Stopping random generation for client:', socket.id);
    
    if (socket.generationInterval) {
      clearInterval(socket.generationInterval);
      socket.generationInterval = null;
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up any running generation for this client
    if (socket.generationInterval) {
      clearInterval(socket.generationInterval);
    }
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to MPP Exam Backend API - Political Candidates',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    candidatesCount: candidates.length
  });
});

// GET all candidates
app.get('/api/candidates', (req, res) => {
  res.json(candidates);
});

// GET single candidate by ID
app.get('/api/candidates/:id', (req, res) => {
  const candidate = candidates.find(c => c.id === parseInt(req.params.id));
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found' });
  }
  res.json(candidate);
});

// POST create new candidate
app.post('/api/candidates', (req, res) => {
  const { name, image, politicalParty, description } = req.body;
  
  // Validation
  if (!name || !politicalParty || !description) {
    return res.status(400).json({ 
      message: 'Name, political party, and description are required' 
    });
  }

  const newCandidate = {
    id: generateId(),
    name,
    image: image || 'https://via.placeholder.com/300x400?text=No+Image',
    politicalParty,
    description
  };

  candidates.push(newCandidate);
  
  // Emit to all connected clients
  io.emit('candidate-added', newCandidate);
  io.emit('candidates-updated', candidates);
  
  res.status(201).json(newCandidate);
});

// PUT update candidate
app.put('/api/candidates/:id', (req, res) => {
  const { name, image, politicalParty, description } = req.body;
  const candidateId = parseInt(req.params.id);
  
  const candidateIndex = candidates.findIndex(c => c.id === candidateId);
  if (candidateIndex === -1) {
    return res.status(404).json({ message: 'Candidate not found' });
  }

  // Validation
  if (!name || !politicalParty || !description) {
    return res.status(400).json({ 
      message: 'Name, political party, and description are required' 
    });
  }

  candidates[candidateIndex] = {
    ...candidates[candidateIndex],
    name,
    image: image || candidates[candidateIndex].image,
    politicalParty,
    description
  };

  // Emit to all connected clients
  io.emit('candidate-updated', candidates[candidateIndex]);
  io.emit('candidates-updated', candidates);
  
  res.json(candidates[candidateIndex]);
});

// DELETE candidate
app.delete('/api/candidates/:id', (req, res) => {
  const candidateId = parseInt(req.params.id);
  const candidateIndex = candidates.findIndex(c => c.id === candidateId);
  
  if (candidateIndex === -1) {
    return res.status(404).json({ message: 'Candidate not found' });
  }

  const deletedCandidate = candidates[candidateIndex];
  candidates = candidates.filter(c => c.id !== candidateId);
  
  // Emit to all connected clients
  io.emit('candidate-deleted', deletedCandidate);
  io.emit('candidates-updated', candidates);
  
  res.json({ 
    message: 'Candidate deleted successfully',
    deletedCandidate 
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/candidates`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 