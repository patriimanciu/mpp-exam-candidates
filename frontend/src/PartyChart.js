import React, { useMemo } from 'react';
import './PartyChart.css';

function PartyChart({ candidates }) {
  if (candidates && candidates.length > 0) {
    console.log("Inspecting the first candidate object received by the chart:", candidates[0]);
  }

  const chartData = useMemo(() => {
    // Count candidates per party
    const partyCounts = candidates.reduce((acc, candidate) => {
      const party = candidate.political_party;
      acc[party] = (acc[party] || 0) + 1;
      return acc;
    }, {});

    const parties = Object.keys(partyCounts);
    const counts = Object.values(partyCounts);
    const maxCount = Math.max(...counts, 1);

    return {
      parties,
      counts,
      maxCount,
      totalCandidates: candidates.length,
      totalParties: parties.length
    };
  }, [candidates]);

  // Generate colors for each party
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
  ];

  // Calculate height in pixels (each candidate = 50px, max height = 250px)
  const getBarHeight = (count) => {
    const baseHeight = 50; // 50px per candidate
    const maxHeight = 250; // Maximum height in pixels
    return Math.min(count * baseHeight, maxHeight);
  };

  return (
    <div className="party-chart-container">
      <h2 className="chart-title">Candidates by Political Party</h2>
      
      <div className="chart-wrapper">
        <div className="chart-bars">
          {chartData.parties.map((party, index) => {
            const count = chartData.counts[index];
            const height = getBarHeight(count);
            const color = colors[index % colors.length];
            
            return (
              <div key={party} className="bar-item">
                <div className="bar-container">
                  <div 
                    className="bar"
                    style={{
                      height: `${height}px`,
                      backgroundColor: color
                    }}
                  >
                    <span className="bar-value">{count}</span>
                  </div>
                </div>
                <div className="bar-label">{party}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total Candidates:</span>
          <span className="summary-value">{chartData.totalCandidates}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Parties:</span>
          <span className="summary-value">{chartData.totalParties}</span>
        </div>
      </div>
    </div>
  );
}

export default PartyChart; 