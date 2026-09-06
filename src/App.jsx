import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, BookOpen, MapPin, Building, GraduationCap, Sun, Moon, ChevronLeft, ChevronRight, Users, ChevronDown, ChevronUp, Table as TableIcon, LayoutGrid, Layers, User, Filter, BarChart2, Download } from 'lucide-react';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './App.css';
import Dashboard from './Dashboard';

const formatQuota = (q) => {
  if (!q) return '';
  return q.replace(/\s+Quota$/i, '');
};

function ResultCard({ item, getRankBadge, viewMode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isGrouped = viewMode === 'grouped';
  const displayRank = isGrouped ? item.closing_rank : item.rank;

  return (
    <div className="result-card">
      <div className="result-info">
        <div className="result-course">
          {item.course} <span style={{fontSize:'0.875rem', color: 'var(--text-tertiary)', fontWeight:'normal'}}>({item.category})</span>
        </div>
        <div className="result-college">
          <Building size={14} style={{display:'inline', marginRight: '6px', verticalAlign: 'text-bottom'}}/>
          {item.college_name}
        </div>
        <div className="result-meta">
          <span>
            <MapPin size={14} /> {item.college_state}
          </span>
          <span>
            <BookOpen size={14} /> {item.admitted_by}
          </span>
          <span>
            <GraduationCap size={14} /> {item._program} ({item.admission_phase})
          </span>
          {isGrouped && (
            <span 
              style={{color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Users size={14} style={{marginRight: '4px'}}/> 
              {item.seats_filled} {item.seats_filled === 1 ? 'Seat' : 'Seats'}
              {isExpanded ? <ChevronUp size={14} style={{marginLeft: '2px'}}/> : <ChevronDown size={14} style={{marginLeft: '2px'}}/>}
            </span>
          )}
        </div>
      </div>
      
      <div className="result-stats">
        {getRankBadge(displayRank)}
        <div style={{color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
          {isGrouped ? 'Closing Rank' : 'Candidate Rank'}
        </div>
        <div className="rank-display">{displayRank.toLocaleString()}</div>
      </div>

      {isGrouped && isExpanded && (
        <div style={{ width: '100%', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <h4 style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase'}}>Admitted Candidates</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
            {item.individuals.map((ind, idx) => (
              <div key={idx} style={{backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', border: '1px solid var(--border-color)'}}>
                <strong>AIR {ind.rank.toLocaleString()}</strong> 
                {ind.gender && <span style={{color: 'var(--text-tertiary)', marginLeft: '4px'}}>({ind.gender})</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState({ admissionsIndividual: [], admissionsGrouped: [], colleges: {} });
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  // View States
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState('individual'); 
  const [displayStyle, setDisplayStyle] = useState('table'); 
  const [isFiltersExpandedMobile, setIsFiltersExpandedMobile] = useState(false);

  // Filter States
  const [rankRange, setRankRange] = useState([1, 585895]);
  const [sliderRange, setSliderRange] = useState([1, 585895]);
  const [minRankInput, setMinRankInput] = useState('1');
  const [maxRankInput, setMaxRankInput] = useState('585895');
  const [rank, setRank] = useState('');
  const [domicileState, setDomicileState] = useState(null);
  const [category, setCategory] = useState('');
  const [specialty, setSpecialty] = useState(null);
  const [course, setCourse] = useState(null); 
  const [degreeType, setDegreeType] = useState('');
  const [college, setCollege] = useState(null); 
  const [quota, setQuota] = useState('');
  const [state, setState] = useState(null);
  const [round, setRound] = useState('');
  const [management, setManagement] = useState('');
  const [programType, setProgramType] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [resultsPerPage, setResultsPerPage] = useState(25);

  const [options, setOptions] = useState({
    courses: [],
    categories: [],
    colleges: [],
    quotas: [],
    states: [],
    rounds: [],
    managements: [],
  });

  // Theme Toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Reset pagination when filters or view mode change
  useEffect(() => {
    setCurrentPage(1);
    setPageInput('1');
  }, [category, specialty, course, degreeType, college, quota, state, domicileState, round, management, programType, rankRange, viewMode]);

  // Sync typed inputs with slider
  useEffect(() => {
    setMinRankInput(rankRange[0].toString());
    setMaxRankInput(rankRange[1].toString());
    setSliderRange(rankRange);
  }, [rankRange]);

  // URL Syncing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('rankMin') && params.get('rankMax')) {
      setRankRange([parseInt(params.get('rankMin'), 10), parseInt(params.get('rankMax'), 10)]);
    }
    if (params.get('rank')) setRank(params.get('rank'));
    if (params.get('category')) setCategory(params.get('category'));
    if (params.get('degreeType')) setDegreeType(params.get('degreeType'));
    if (params.get('quota')) setQuota(params.get('quota'));
    if (params.get('round')) setRound(params.get('round'));
    if (params.get('management')) setManagement(params.get('management'));
    if (params.get('programType')) setProgramType(params.get('programType'));
    if (params.get('domicileState')) setDomicileState({ value: params.get('domicileState'), label: params.get('domicileState') });
    if (params.get('specialty')) setSpecialty({ value: params.get('specialty'), label: params.get('specialty') });
    if (params.get('course')) setCourse({ value: params.get('course'), label: params.get('course') });
    if (params.get('college')) setCollege({ value: params.get('college'), label: params.get('college') });
    if (params.get('state')) setState({ value: params.get('state'), label: params.get('state') });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (rankRange[0] !== 1 || rankRange[1] !== 585895) {
      params.set('rankMin', rankRange[0]);
      params.set('rankMax', rankRange[1]);
    }
    if (rank) params.set('rank', rank);
    if (category) params.set('category', category);
    if (degreeType) params.set('degreeType', degreeType);
    if (quota) params.set('quota', quota);
    if (round) params.set('round', round);
    if (management) params.set('management', management);
    if (programType) params.set('programType', programType);
    if (domicileState) params.set('domicileState', domicileState.value);
    if (specialty) params.set('specialty', specialty.value);
    if (course) params.set('course', course.value);
    if (college) params.set('college', college.value);
    if (state) params.set('state', state.value);

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [rankRange, rank, category, degreeType, quota, round, management, programType, domicileState, specialty, course, college, state]);

  useEffect(() => {
    async function loadData() {
      try {
        const [admNMCRes, admDNBRes, collRes] = await Promise.all([
          fetch('/admissions_2025_26.json'),
          fetch('/admissions_dnb_2025_26.json'),
          fetch('/colleges.json')
        ]);

        const admNMC = await admNMCRes.json();
        const admDNB = await admDNBRes.json();
        const collegesArr = await collRes.json();

        const collMap = {};
        const stateSet = new Set();
        const managementSet = new Set();
        
        collegesArr.forEach(c => {
          if (c.college_code) collMap[c.college_code] = c;
          if (c.college_state) stateSet.add(c.college_state);
          if (c.college_management) managementSet.add(c.college_management);
        });

        admDNB.forEach(a => {
          if (a.college_state) stateSet.add(a.college_state);
        });

        const rawAdmissions = [
          ...admNMC.map(a => ({ ...a, _program: 'NMC (MD/MS/Diploma)' })),
          ...admDNB.map(a => ({ ...a, _program: 'DNB/NBEMS' }))
        ];

        const formattedIndividuals = rawAdmissions.map(a => {
          const col = collMap[a.college_code] || {};
          return {
            ...a,
            college_name: col.college_name || a.college_name || 'NBEMS Accredited Hospital / Unknown',
            college_state: col.college_state || a.college_state || 'All India',
            college_management: col.college_management || ''
          };
        });

        const grouped = {};
        formattedIndividuals.forEach(a => {
          const key = `${a.college_name}|${a.course}|${a.category}|${a.admitted_by}|${a.admission_phase}|${a._program}`;
          if (!grouped[key]) {
            grouped[key] = {
              ...a,
              closing_rank: a.rank,
              seats_filled: 1,
              individuals: [a]
            };
          } else {
            grouped[key].seats_filled += 1;
            grouped[key].individuals.push(a);
            if (a.rank > grouped[key].closing_rank) {
              grouped[key].closing_rank = a.rank;
            }
          }
        });

        const aggregatedAdmissions = Object.values(grouped);
        aggregatedAdmissions.forEach(cohort => {
          cohort.individuals.sort((a, b) => a.rank - b.rank);
        });

        const courseSet = new Set();
        const specialtySet = new Set();
        const degreeTypeSet = new Set();
        const collegeSet = new Set();
        const categorySet = new Set();
        const quotaSet = new Set();
        const roundSet = new Set();

        formattedIndividuals.forEach(a => {
          if (a.course) courseSet.add(a.course);
          if (a.specialty) specialtySet.add(a.specialty);
          if (a.degree_type) degreeTypeSet.add(a.degree_type);
          if (a.college_name) collegeSet.add(a.college_name);
          if (a.category) categorySet.add(a.category);
          if (a.admitted_by) quotaSet.add(a.admitted_by);
          if (a.admission_phase) roundSet.add(a.admission_phase);
        });

        setOptions({
          courses: Array.from(courseSet).sort().map(c => ({ value: c, label: c })),
          specialties: Array.from(specialtySet).sort().map(s => ({ value: s, label: s })),
          degreeTypes: Array.from(degreeTypeSet).sort(),
          colleges: Array.from(collegeSet).sort().map(c => ({ value: c, label: c })),
          categories: Array.from(categorySet).sort(),
          quotas: Array.from(quotaSet).sort(),
          states: Array.from(stateSet).sort().map(s => ({ value: s, label: s })),
          rounds: Array.from(roundSet).sort(),
          managements: Array.from(managementSet).sort(),
        });

        setData({ 
          admissionsIndividual: formattedIndividuals, 
          admissionsGrouped: aggregatedAdmissions, 
          colleges: collMap 
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    }
    loadData();
  }, []);

  const currentDataset = viewMode === 'grouped' ? data.admissionsGrouped : data.admissionsIndividual;

  const filteredResults = useMemo(() => {
    if (loading) return [];
    
    return currentDataset.filter(a => {
      if (category && a.category !== category) return false;
      if (specialty && specialty.value && a.specialty !== specialty.value) return false;
      if (course && course.value && a.course !== course.value) return false;
      if (degreeType && a.degree_type !== degreeType) return false;
      if (college && college.value && a.college_name !== college.value) return false;
      if (quota && a.admitted_by !== quota) return false;
      if (state && state.value && a.college_state !== state.value) return false;
      if (round && a.admission_phase !== round) return false;
      if (management && a.college_management !== management) return false;
      if (programType && a._program !== programType) return false;

      // Smart Domicile Filter: Keep AIQ nationwide + State Quota in candidate's Domicile state
      if (domicileState && domicileState.value) {
        if (a.admitted_by === 'State Quota' && a.college_state !== domicileState.value) {
          return false;
        }
      }

      const testRank = viewMode === 'grouped' ? a.closing_rank : a.rank;
      if (testRank < rankRange[0] || testRank > rankRange[1]) return false;
      
      return true;
    }).sort((a, b) => {
      const rankA = viewMode === 'grouped' ? a.closing_rank : a.rank;
      const rankB = viewMode === 'grouped' ? b.closing_rank : b.rank;
      return rankA - rankB; 
    });
  }, [currentDataset, loading, category, specialty, course, degreeType, college, quota, state, domicileState, round, management, programType, viewMode, rankRange]);

  const getRankBadge = (testRank) => {
    if (!rank) return null;
    const userRank = parseInt(rank, 10);
    if (isNaN(userRank)) return null;

    const diff = testRank - userRank;
    if (diff > 5000) return <span className="badge badge-safe">Safe</span>;
    if (diff > -2000) return <span className="badge badge-borderline">Borderline</span>;
    return <span className="badge badge-stretch">Stretch</span>;
  };

  const exportToCSV = () => {
    if (!filteredResults || filteredResults.length === 0) return;
    
    const headers = viewMode === 'grouped' 
      ? ['Closing Rank', 'Course', 'Category', 'College', 'Quota', 'State', 'Round', 'Seats']
      : ['AIR', 'Course', 'Category', 'College', 'Quota', 'State', 'Round'];
      
    const rows = filteredResults.map(a => {
      const r = viewMode === 'grouped' ? a.closing_rank : a.rank;
      if (viewMode === 'grouped') {
        return [r, a.course, a.category, a.college_name, formatQuota(a.admitted_by), a.college_state, a.admission_phase, a.seats_filled];
      } else {
        return [r, a.course, a.category, a.college_name, formatQuota(a.admitted_by), a.college_state, a.admission_phase];
      }
    });

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `neet_pg_cutoffs_${viewMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageJump = (e) => {
    e.preventDefault();
    let p = parseInt(pageInput, 10);
    const total = Math.ceil(filteredResults.length / resultsPerPage);
    if (isNaN(p) || p < 1) p = 1;
    if (p > total) p = total;
    setCurrentPage(p);
    setPageInput(p.toString());
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'var(--bg-primary)',
      borderColor: state.isFocused ? 'var(--accent)' : 'var(--border-color)',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
      padding: '0.1rem',
      borderRadius: 'var(--radius-md)',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--accent)' : 'var(--text-tertiary)'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--text-primary)',
      fontWeight: 500
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--text-tertiary)',
      fontStyle: 'italic'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 50
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'var(--accent)' 
        : state.isFocused ? 'var(--bg-primary)' : 'transparent',
      color: state.isSelected ? '#fff' : 'var(--text-primary)',
      cursor: 'pointer'
    }),
    input: (base) => ({
      ...base,
      color: 'var(--text-primary)'
    })
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={48} />
        <h2>Loading 2025-26 Seat Matrix...</h2>
        <p>Crunching over 60,000 records</p>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const displayedResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <div className="app-layout">
      {/* LEFT SIDEBAR */}
      <div className="app-sidebar">
        <div className="sidebar-header">
          <h1 style={{fontSize: '1.25rem', margin: 0, whiteSpace: 'nowrap'}}>NEET PG '25 Cutoffs</h1>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <button 
              className="toggle-btn desktop-hide"
              onClick={() => setIsFiltersExpandedMobile(!isFiltersExpandedMobile)}
            >
              <Filter size={16} /> 
            </button>
            <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', padding: '0 1rem 1rem 1rem', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button 
            style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: activeTab === 'search' ? 'var(--accent)' : 'var(--bg-secondary)', color: activeTab === 'search' ? '#fff' : 'var(--text-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
            onClick={() => setActiveTab('search')}
          >
            <Search size={16} /> Search
          </button>
          <button 
            style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: activeTab === 'dashboard' ? 'var(--accent)' : 'var(--bg-secondary)', color: activeTab === 'dashboard' ? '#fff' : 'var(--text-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart2 size={16} /> Dashboard
          </button>
        </div>

        {/* Filters Grid */}
        <div className={`sidebar-scroll-area ${isFiltersExpandedMobile ? 'flex' : 'mobile-hide'}`}>
          <div className="filter-group">
            <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem'}}>
              <span>Closing Rank Range</span>
              <span style={{display: 'flex', gap: '0.25rem', alignItems: 'center'}}>
                <input 
                  type="number"
                  className="rank-range-input"
                  style={{width: '72px', padding: '0.15rem 0.25rem', fontSize: '0.8rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--accent)', fontWeight: 600, outline: 'none'}}
                  value={minRankInput}
                  onChange={e => setMinRankInput(e.target.value)}
                  onBlur={() => {
                    let val = parseInt(minRankInput, 10);
                    if (isNaN(val) || val < 1) val = 1;
                    setRankRange([val, Math.max(val, rankRange[1])]);
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                />
                -
                <input 
                  type="number"
                  className="rank-range-input"
                  style={{width: '72px', padding: '0.15rem 0.25rem', fontSize: '0.8rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--accent)', fontWeight: 600, outline: 'none'}}
                  value={maxRankInput}
                  onChange={e => setMaxRankInput(e.target.value)}
                  onBlur={() => {
                    let val = parseInt(maxRankInput, 10);
                    if (isNaN(val) || val > 585895) val = 585895;
                    setRankRange([Math.min(val, rankRange[0]), val]);
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                />
              </span>
            </label>
            <div style={{padding: '0.5rem 0.5rem 1rem 0.5rem'}}>
              <Slider 
                range 
                min={1} 
                max={585895} 
                step={500}
                defaultValue={[1, 585895]}
                value={sliderRange}
                onChange={setSliderRange}
                onChangeComplete={setRankRange}
                allowCross={false}
                trackStyle={[{ backgroundColor: 'var(--accent)' }]}
                handleStyle={[{ borderColor: 'var(--accent)', backgroundColor: '#fff', opacity: 1 }, { borderColor: 'var(--accent)', backgroundColor: '#fff', opacity: 1 }]}
                railStyle={{ backgroundColor: 'var(--border-color)' }}
              />
            </div>
          </div>

          {activeTab !== 'dashboard' && (
            <div className="filter-group">
              <label>Your AIR Rank <span style={{fontWeight: 400, color: 'var(--text-tertiary)', textTransform: 'none'}}>(For Status Badges)</span></label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="e.g. 50000" 
                value={rank} 
                onChange={e => setRank(e.target.value)} 
              />
            </div>
          )}

          <div className="filter-group" style={{borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem'}}>
            <label style={{color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
              🎯 My Domicile State
            </label>
            <Select 
              options={options.states}
              value={domicileState}
              onChange={setDomicileState}
              isClearable
              placeholder="Select your Home State..."
              styles={selectStyles}
            />
            {domicileState && (
              <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem', lineHeight: '1.3'}}>
                Showing <strong>All India Quota</strong> (nationwide) + <strong>State Quota</strong> in <strong>{domicileState.label}</strong>.
              </p>
            )}
          </div>

          {activeTab !== 'dashboard' && (
            <>
              <div className="filter-group">
                <label>College / Hospital</label>
                <Select 
                  options={options.colleges}
                  value={college}
                  onChange={setCollege}
                  isClearable
                  placeholder="Search for any College..."
                  styles={selectStyles}
                />
              </div>

              <div className="filter-group">
                <label>Specialty / Subject</label>
                <Select 
                  options={options.specialties}
                  value={specialty}
                  onChange={setSpecialty}
                  isClearable
                  placeholder="e.g. General Medicine, Pediatrics..."
                  styles={selectStyles}
                />
              </div>

              <div className="filter-group">
                <label>Specific Course / Degree</label>
                <Select 
                  options={options.courses}
                  value={course}
                  onChange={setCourse}
                  isClearable
                  placeholder="Search for exact program..."
                  styles={selectStyles}
                />
              </div>
            </>
          )}

          <div className="filter-group">
            <label>Degree Type</label>
            <select className={`input-field ${!degreeType ? 'is-default' : ''}`} value={degreeType} onChange={e => setDegreeType(e.target.value)}>
              <option value="">All Degrees (MD, MS, DNB, Diploma)</option>
              {options.degreeTypes && options.degreeTypes.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select className={`input-field ${!category ? 'is-default' : ''}`} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>State</label>
            <Select 
              options={options.states}
              value={state}
              onChange={setState}
              isClearable
              placeholder="All States"
              styles={selectStyles}
            />
          </div>

          <div className="filter-group">
            <label>Program Type</label>
            <select className={`input-field ${!programType ? 'is-default' : ''}`} value={programType} onChange={e => setProgramType(e.target.value)}>
              <option value="">All (MD/MS/DNB)</option>
              <option value="NMC (MD/MS/Diploma)">NMC (MD/MS/Diploma)</option>
              <option value="DNB/NBEMS">DNB/NBEMS</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Counseling Quota</label>
            <select className={`input-field ${!quota ? 'is-default' : ''}`} value={quota} onChange={e => setQuota(e.target.value)}>
              <option value="">All Quotas</option>
              {options.quotas.map(c => <option key={c} value={c}>{formatQuota(c)}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Admission Phase (Round)</label>
            <select className={`input-field ${!round ? 'is-default' : ''}`} value={round} onChange={e => setRound(e.target.value)}>
              <option value="">All Rounds</option>
              {options.rounds.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>College Management</label>
            <select className={`input-field ${!management ? 'is-default' : ''}`} value={management} onChange={e => setManagement(e.target.value)}>
              <option value="">All (Govt / Pvt)</option>
              {options.managements.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="app-main">
        
        {activeTab === 'dashboard' ? (
          <Dashboard data={filteredResults} />
        ) : (
          <>
            {/* FIXED TOP HEADER */}
            <div className="results-header">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h2 style={{margin: 0}}>Results ({filteredResults.length})</h2>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <p style={{fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0}}>
                    {viewMode === 'grouped' ? 'Showing aggregated seat cutoffs.' : 'Showing raw individual admissions.'}
                  </p>
                  <button 
                    onClick={exportToCSV}
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                  >
                    <Download size={12} /> Export CSV
                  </button>
                </div>
              </div>

              <div className="view-toggles-container">
            <div className="toggle-group">
              <button 
                className={`toggle-group-btn ${viewMode === 'grouped' ? 'active' : ''}`} 
                onClick={() => setViewMode('grouped')}
                title="Merge candidates by college & course to display the final Closing Rank"
              >
                <Layers size={14} /> Grouped
              </button>
              <button 
                className={`toggle-group-btn ${viewMode === 'individual' ? 'active' : ''}`} 
                onClick={() => setViewMode('individual')}
                title="Show every candidate's raw admission data row-by-row"
              >
                <User size={14} /> Individual
              </button>
            </div>

            <div className="toggle-group">
              <button 
                className={`toggle-group-btn ${displayStyle === 'table' ? 'active' : ''}`} 
                onClick={() => setDisplayStyle('table')}
              >
                <TableIcon size={14} /> Table
              </button>
              <button 
                className={`toggle-group-btn ${displayStyle === 'cards' ? 'active' : ''}`} 
                onClick={() => setDisplayStyle('cards')}
              >
                <LayoutGrid size={14} /> Cards
              </button>
            </div>

            <select 
              className="input-field" 
              style={{ width: 'auto', padding: '0.3rem 0.5rem', background: 'transparent' }} 
              value={resultsPerPage} 
              onChange={(e) => {
                setResultsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={500}>500 / page</option>
            </select>
          </div>
        </div>

        {/* SCROLLABLE MIDDLE DATA */}
        <div className="main-content-flex">
          {filteredResults.length === 0 ? (
            <div style={{textAlign: 'center', padding: '6rem 0', color: 'var(--text-tertiary)'}}>
              <Search size={48} style={{opacity: 0.2, margin: '0 auto 1rem'}} />
              <p>No results found matching your exact criteria.</p>
            </div>
          ) : (
            <>
              {displayStyle === 'table' ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{viewMode === 'grouped' ? 'Closing Rank' : 'AIR'}</th>
                        <th>Course</th>
                        <th>Category</th>
                        <th>College</th>
                        <th>Quota</th>
                        <th>State</th>
                        <th>Round</th>
                        {viewMode === 'grouped' && <th>Seats</th>}
                        {rank && <th>Status</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedResults.map((a, i) => {
                        const r = viewMode === 'grouped' ? a.closing_rank : a.rank;
                        return (
                          <tr key={i}>
                            <td style={{fontWeight: 600, fontFamily: 'monospace', fontSize: '1rem'}}>{r.toLocaleString()}</td>
                            <td style={{minWidth: '200px', fontWeight: 500}}>{a.course}</td>
                            <td>{a.category}</td>
                            <td style={{minWidth: '250px'}}>{a.college_name}</td>
                            <td>{formatQuota(a.admitted_by)}</td>
                            <td>{a.college_state}</td>
                            <td>{a.admission_phase}</td>
                            {viewMode === 'grouped' && <td>{a.seats_filled}</td>}
                            {rank && <td>{getRankBadge(r)}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="table-container" style={{background: 'transparent', border: 'none', boxShadow: 'none'}}>
                  <div className="results-grid">
                    {displayedResults.map((a, i) => (
                      <ResultCard key={i} item={a} getRankBadge={getRankBadge} viewMode={viewMode} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FIXED BOTTOM PAGINATION */}
        {filteredResults.length > 0 && (
          <div className="pagination-fixed">
            <div className="pagination-container">
              <button 
                className="theme-toggle" 
                style={{ borderRadius: 'var(--radius-md)' }}
                disabled={currentPage === 1}
                onClick={() => {
                  const p = Math.max(1, currentPage - 1);
                  setCurrentPage(p);
                  setPageInput(p.toString());
                }}
              >
                <ChevronLeft size={16} /> <span className="mobile-hide">Previous</span>
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Page 
                <form onSubmit={handlePageJump}>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ width: '60px', padding: '0.25rem', textAlign: 'center' }}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={handlePageJump}
                  />
                </form>
                of <strong>{totalPages || 1}</strong>
              </div>
              
              <button 
                className="theme-toggle"
                style={{ borderRadius: 'var(--radius-md)' }}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => {
                  const p = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(p);
                  setPageInput(p.toString());
                }}
              >
                <span className="mobile-hide">Next</span> <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
