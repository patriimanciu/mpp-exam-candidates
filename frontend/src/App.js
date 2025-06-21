import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CandidatesList from './CandidatesList';
import CandidateForm from './CandidateForm';
import './App.css';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationInterval, setGenerationInterval] = useState(null);

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

  const generateRandomCandidate = () => {
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomParty = randomParties[Math.floor(Math.random() * randomParties.length)];
    const randomDescription = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
    const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
    
    return {
      id: Math.max(...candidates.map(c => c.id), 0) + 1,
      name: randomName,
      image: randomImage,
      politicalParty: randomParty,
      description: randomDescription
    };
  };

  const startGenerating = () => {
    setIsGenerating(true);
    const interval = setInterval(() => {
      setCandidates(prev => [...prev, generateRandomCandidate()]);
    }, 1000); // Add a new candidate every second
    setGenerationInterval(interval);
  };

  const stopGenerating = () => {
    setIsGenerating(false);
    if (generationInterval) {
      clearInterval(generationInterval);
      setGenerationInterval(null);
    }
  };

  useEffect(() => {
    // Local candidates data array (as requested) - moved inside useEffect
    const localCandidates = [
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

    const timer = setTimeout(() => {
      setCandidates(localCandidates);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []); 

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (generationInterval) {
        clearInterval(generationInterval);
      }
    };
  }, [generationInterval]);

  const addCandidate = (candidateData) => {
    const newCandidate = {
      ...candidateData,
      id: Math.max(...candidates.map(c => c.id), 0) + 1
    };
    setCandidates([...candidates, newCandidate]);
  };

  const updateCandidate = (candidateData) => {
    setCandidates(candidates.map(c => 
      c.id === editingCandidate.id 
        ? { ...candidateData, id: c.id }
        : c
    ));
    setEditingCandidate(null);
  };

  const deleteCandidate = (id) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const handleSave = (candidateData) => {
    if (editingCandidate && editingCandidate.id) {
      updateCandidate(candidateData);
    } else {
      addCandidate(candidateData);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>MPP Exam - Political Candidates</h1>
          <p>Meet the candidates running for election</p>
        </div>
        <div className="loading">Loading candidates...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <CandidatesList 
                candidates={candidates}
                onUpdateCandidate={setEditingCandidate}
                onDeleteCandidate={deleteCandidate}
                isGenerating={isGenerating}
                onStartGenerating={startGenerating}
                onStopGenerating={stopGenerating}
              />
            } 
          />
          <Route 
            path="/form" 
            element={
              <CandidateForm 
                candidate={editingCandidate}
                onSave={handleSave}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 