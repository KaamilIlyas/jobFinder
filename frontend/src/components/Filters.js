import React from 'react';
import { Layers, Clock } from 'lucide-react';

function Filters({ filters, sources, updateFilter, toggleArrayFilter, disabled }) {
  const dateFilters = [
    { id: 'all', name: 'All Time' },
    { id: '24h', name: 'Past 24 Hours' },
    { id: '3d', name: 'Past 3 Days' },
    { id: '7d', name: 'Past Week' },
    { id: '14d', name: 'Past 2 Weeks' },
    { id: '30d', name: 'Past Month' }
  ];

  return (
    <>
      {/* Date Filter */}
      <div className="filter-card">
        <h3>
          <Clock size={16} />
          Date Posted
        </h3>
        <div className="filter-options">
          {dateFilters.map(option => (
            <label key={option.id} className="filter-option">
              <input
                type="radio"
                name="dateFilter"
                checked={filters.dateFilter === option.id}
                onChange={() => updateFilter('dateFilter', option.id)}
                disabled={disabled}
              />
              <span>{option.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Source Filter */}
      <div className="filter-card">
        <h3>
          <Layers size={16} />
          Job Sources
        </h3>
        <div className="filter-options">
          {sources.length > 0 ? (
            sources.map(source => (
              <label key={source} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.sources.includes(source)}
                  onChange={() => toggleArrayFilter('sources', source)}
                  disabled={disabled}
                />
                <span>{source}</span>
              </label>
            ))
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Search to see sources
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Filters;
