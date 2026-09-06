import React, { useState, useMemo } from 'react';

export default function Dashboard({ data }) {
  const [bracketMode, setBracketMode] = useState('1-1000');

  const { topSpecialties, bracketData, scatterData, maxMedianRank, maxBracketValue } = useMemo(() => {
    if (!data || data.length === 0) {
      return { topSpecialties: [], bracketData: [], scatterData: [] };
    }

    // 1. Top 10 Most Competitive Specialties
    const specialtyMap = {};
    let totalMatched = 0;
    
    data.forEach(a => {
      if (a.rank) {
        if (!specialtyMap[a.specialty]) {
          specialtyMap[a.specialty] = [];
        }
        specialtyMap[a.specialty].push(a.rank);
        totalMatched++;
      }
    });

    // Dynamic threshold: A specialty must have at least 1% of the total seats in this filter (or 10 seats minimum) 
    // to be considered a "major" specialty, preventing ultra-niche branches with 5 seats from dominating the Top 10.
    const inclusionThreshold = Math.max(10, totalMatched * 0.01);

    const specialtyStats = Object.keys(specialtyMap).map(spec => {
      const ranks = specialtyMap[spec].sort((a, b) => a - b);
      const median = ranks[Math.floor(ranks.length / 2)] || 0;
      return { specialty: spec, medianRank: median, count: ranks.length };
    }).filter(s => s.count >= inclusionThreshold);

    specialtyStats.sort((a, b) => a.medianRank - b.medianRank);
    const topSpecialties = specialtyStats.slice(0, 10);
    const maxMedianRank = Math.max(...topSpecialties.map(s => s.medianRank), 1);

    // 2. Rank Bracket Choices
    let minR = 1, maxR = 1000;
    if (bracketMode === '1001-5000') { minR = 1001; maxR = 5000; }
    if (bracketMode === '5001-15000') { minR = 5001; maxR = 15000; }

    const bracketMap = {};
    let totalInBracket = 0;
    data.forEach(a => {
      if (a.rank >= minR && a.rank <= maxR && a.specialty) {
        // Clean up specialty names (e.g. remove long suffixes)
        const cleanName = a.specialty.replace(/\(Direct 6 Years Course\)/gi, '').trim();
        bracketMap[cleanName] = (bracketMap[cleanName] || 0) + 1;
        totalInBracket++;
      }
    });

    const bracketData = Object.keys(bracketMap)
      .map(spec => ({ name: spec, value: bracketMap[spec] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
      
    bracketData.forEach(item => {
      item.percentage = (item.value / totalInBracket) * 100;
    });
    const maxBracketValue = Math.max(...bracketData.map(b => b.value), 1);

    // 3. Safe Zone Scatter Plot
    const collegeGroup = {};
    data.forEach(a => {
      if (a.rank) {
        // Exclude massive generic buckets to prevent axis skew
        const cName = a.college_name ? a.college_name.toLowerCase() : '';
        if (cName && !cName.includes('unknown') && !cName.includes('nbems accredited') && !cName.includes('all india')) {
          const key = a.college_name;
          if (!collegeGroup[key]) {
            collegeGroup[key] = { college: a.college_name, seats: 0, closingRank: 0, sumRank: 0 };
          }
          collegeGroup[key].seats += 1;
          collegeGroup[key].sumRank += a.rank;
          if (a.rank > collegeGroup[key].closingRank) {
            collegeGroup[key].closingRank = a.rank;
          }
        }
      }
    });
    
    let scatterDataPre = Object.values(collegeGroup).filter(x => x.seats > 0);
    
    // Dynamic Percentile Scaling for Axes
    let maxVisualSeats = 10; 
    let maxVisualRank = 10000; 
    
    if (scatterDataPre.length > 0) {
      const sortedBySeats = [...scatterDataPre].sort((a, b) => a.seats - b.seats);
      const sortedByRank = [...scatterDataPre].sort((a, b) => (a.sumRank/a.seats) - (b.sumRank/b.seats));
      
      // Calculate 95th Percentile
      const p95SeatsIndex = Math.floor(sortedBySeats.length * 0.95);
      const p95RankIndex = Math.floor(sortedByRank.length * 0.95);
      
      maxVisualSeats = sortedBySeats[p95SeatsIndex]?.seats || 10;
      maxVisualRank = Math.round((sortedByRank[p95RankIndex]?.sumRank / sortedByRank[p95RankIndex]?.seats)) || 10000;
      
      // Ensure minimum limits so it doesn't look weird on tiny datasets
      maxVisualSeats = Math.max(maxVisualSeats, 5);
      maxVisualRank = Math.max(maxVisualRank, 5000);
    }
      
    const scatterData = scatterDataPre.map(x => {
      const avgRank = Math.round(x.sumRank / x.seats);
      const displayRank = Math.min(avgRank, maxVisualRank);
      const displaySeats = Math.min(x.seats, maxVisualSeats);
      
      return { 
        ...x, 
        id: x.college,
        avgRank,
        xPercent: (displayRank / maxVisualRank) * 100,
        yPercent: (displaySeats / maxVisualSeats) * 100,
        isClampedX: avgRank > maxVisualRank,
        isClampedY: x.seats > maxVisualSeats
      };
    });

    return { topSpecialties, bracketData, scatterData, maxMedianRank, maxBracketValue };
  }, [data, bracketMode]);

  if (!data || data.length === 0) {
    return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Dashboard Data...</div>;
  }

  return (
    <div style={{ padding: '1rem 2rem', width: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Visual Analytics Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Gain insights from over {data.length.toLocaleString()} individual admission records.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Chart 1 */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Top 10 Most Competitive Specialties</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', marginBottom: 0 }}>Lowest median rank among admitted candidates</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topSpecialties.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem' }}>No data available for this specific combination.</div>
            ) : topSpecialties.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '140px', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem', textAlign: 'right' }} title={item.specialty}>
                  {item.specialty}
                </div>
                <div style={{ flex: 1, height: '24px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, height: '100%', 
                    width: `${(item.medianRank / maxMedianRank) * 100}%`, 
                    background: 'var(--accent)', opacity: 0.8, borderRadius: '4px' 
                  }}></div>
                  <div style={{ position: 'absolute', top: 0, left: '8px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                    {item.medianRank.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Rank Bracket Choices */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>What Top Rankers Chose</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', marginBottom: 0 }}>Distribution of top bracket seats</p>
            </div>
            <select 
              value={bracketMode} 
              onChange={e => setBracketMode(e.target.value)}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
            >
              <option value="1-1000">Ranks 1 - 1,000</option>
              <option value="1001-5000">Ranks 1,001 - 5,000</option>
              <option value="5001-15000">Ranks 5,001 - 15,000</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bracketData.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem' }}>No data available for this bracket.</div>
            ) : bracketData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '140px', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem', textAlign: 'right' }} title={item.name}>
                  {item.name}
                </div>
                <div style={{ flex: 1, height: '24px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, height: '100%', 
                    width: `${(item.value / maxBracketValue) * 100}%`, 
                    background: 'var(--accent)', opacity: 0.6, borderRadius: '4px' 
                  }}></div>
                  <div style={{ position: 'absolute', top: 0, left: '8px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {item.value} seats ({item.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Chart 3: Scatter Plot */}
      <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>The "Safe Zone" College Plot (Beta)</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Finding opportunities: Dots represent Colleges. Look for dots higher up (more seats) and further right (higher average closing rank). 
          Hover over dots to see details. (Graph axes automatically scale to the 95th percentile of your filtered data for best readability).
        </p>
        
        <div style={{ width: '100%', height: '400px', background: 'var(--bg-primary)', position: 'relative', borderLeft: '2px solid var(--border-color)', borderBottom: '2px solid var(--border-color)', borderRadius: '0 0 0 4px', marginBottom: '1.5rem' }}>
          
          {/* Axis Labels */}
          <div style={{ position: 'absolute', bottom: '-25px', width: '100%', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Average Closing Rank (Higher = Easier) →</div>
          <div style={{ position: 'absolute', left: '-35px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Seats Available (Higher = Safer) →</div>
          
          {/* Scatter Points */}
          {scatterData.map(item => (
            <div 
              key={item.id} 
              style={{
                position: 'absolute',
                left: `${item.xPercent}%`,
                bottom: `${item.yPercent}%`,
                width: '8px',
                height: '8px',
                background: item.isClampedX || item.isClampedY ? '#ef4444' : 'var(--accent)',
                borderRadius: '50%',
                transform: 'translate(-50%, 50%)',
                cursor: 'pointer',
                opacity: 0.6
              }}
              title={`${item.college}\nSeats: ${item.seats}\nAvg Closing Rank: ${item.avgRank.toLocaleString()}`}
            ></div>
          ))}
          
        </div>
      </div>
    </div>
  );
}
