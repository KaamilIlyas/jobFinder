import React, { useState, useCallback } from 'react';
import {
  Search,
  Briefcase,
  LayoutDashboard,
  List,
  Filter,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { jobsApi, analyticsApi } from './services/api';
import Dashboard from './components/Dashboard';
import JobList from './components/JobList';
import Filters from './components/Filters';

function App() {
  const [keywords, setKeywords] = useState('');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [hasSearched, setHasSearched] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    sources: [],
    sortBy: 'date',
    dateFilter: 'all'
  });

  const searchJobs = useCallback(async (searchKeywords, searchFilters) => {
    if (!searchKeywords.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await jobsApi.search(searchKeywords, {
        limit: 500,
        dateFilter: searchFilters?.dateFilter || 'all'
      });

      setJobs(result.jobs || []);
      setFilteredJobs(result.jobs || []);
      setSuggestedKeywords(result.suggestedKeywords || []);

      // Get analytics
      if (result.jobs && result.jobs.length > 0) {
        const analyticsResult = await analyticsApi.analyze(result.jobs);
        setAnalytics(analyticsResult.analytics);
      }
    } catch (err) {
      setError(err.message);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    searchJobs(keywords, filters);
  };

  const handleKeywordClick = (keyword) => {
    setKeywords(keyword);
    searchJobs(keyword, filters);
  };

  // Re-search when date filter changes
  React.useEffect(() => {
    if (hasSearched && keywords) {
      searchJobs(keywords, filters);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFilter]);

  const applyFilters = useCallback(() => {
    let result = [...jobs];

    // Apply source filter
    if (filters.sources.length > 0) {
      result = result.filter(job => filters.sources.includes(job.source));
    }

    // Apply sorting - default to date (most recent first)
    switch (filters.sortBy) {
      case 'company':
        result.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case 'relevance':
        result.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case 'date':
      default:
        result.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        break;
    }

    setFilteredJobs(result);
  }, [jobs, filters]);

  // Apply filters when filters change
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  // Extract unique values for filters
  const sources = [...new Set(jobs.map(job => job.source))];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Briefcase size={24} />
            </div>
            <span>Remote JobFinder</span>
          </div>

          <div className="search-section">
            <form onSubmit={handleSearch} className="search-container">
              <div className="search-input-wrapper">
                <Search size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Enter job title, skills, or keywords..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? <RefreshCw size={18} className="spin" /> : <Search size={18} />}
                {loading ? 'Searching...' : 'Search Jobs'}
              </button>
            </form>
            
            {suggestedKeywords.length > 0 && (
              <div className="suggested-keywords">
                <Sparkles size={16} />
                <span>Try:</span>
                {suggestedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="keyword-tag"
                    onClick={() => handleKeywordClick(kw)}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Sidebar Filters */}
        <aside className="sidebar">
          <Filters
            filters={filters}
            sources={sources}
            updateFilter={updateFilter}
            toggleArrayFilter={toggleArrayFilter}
            disabled={jobs.length === 0}
          />
        </aside>

        {/* Content Area */}
        <div className="content-area">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              <List size={18} />
              Job Listings
            </button>
            <button
              className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              Analytics Dashboard
            </button>
          </div>

          {/* Results Header */}
          {hasSearched && !loading && (
            <div className="results-header">
              <div className="results-count">
                Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> remote jobs
                {keywords && <> for "<strong>{keywords}</strong>"</>}
              </div>
              <div className="sort-select">
                <label>Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                >
                  <option value="date">Most Recent</option>
                  <option value="relevance">Most Relevant</option>
                  <option value="company">Company Name</option>
                </select>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Searching remote job portals worldwide...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <Briefcase size={64} />
              <h3>Error Occurred</h3>
              <p>{error}</p>
            </div>
          ) : !hasSearched ? (
            <div className="empty-state">
              <Search size={64} />
              <h3>Find Your Remote Job</h3>
              <p>Search for remote positions worldwide. Try "React Developer", "Python Engineer", "DevOps", or any skills you have.</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <Filter size={64} />
              <h3>No Jobs Found</h3>
              <p>Try adjusting your filters or search with different keywords.</p>
            </div>
          ) : activeTab === 'jobs' ? (
            <JobList jobs={filteredJobs} />
          ) : (
            <Dashboard analytics={analytics} jobs={filteredJobs} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
