import React from 'react';
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function JobList({ jobs }) {
  const getRelevanceClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'low';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <div key={job.id} className="job-card">
          <div className="job-card-header">
            <div>
              <h3 className="job-title">{job.title}</h3>
              <p className="job-company">{job.company}</p>
            </div>
            <div className={`relevance-badge ${getRelevanceClass(job.relevanceScore)}`}>
              <span className="relevance-score">{Math.round(job.relevanceScore)}</span>
              <span className="relevance-label">Match</span>
            </div>
          </div>

          <div className="job-meta">
            <div className="job-meta-item">
              <MapPin size={16} />
              <span>{job.location || 'Not specified'}</span>
            </div>
            <div className="job-meta-item">
              <Building2 size={16} />
              <span>{job.type || 'Full-time'}</span>
            </div>
            <div className="job-meta-item">
              <DollarSign size={16} />
              <span>{job.salary || 'Not specified'}</span>
            </div>
            <div className="job-meta-item">
              <Clock size={16} />
              <span>{formatDate(job.postedDate)}</span>
            </div>
          </div>

          <p className="job-description">
            {job.description}
          </p>

          {job.skills && job.skills.length > 0 && (
            <div className="job-skills">
              {job.skills.slice(0, 6).map((skill, idx) => (
                <span key={idx} className="skill-tag">
                  {skill}
                </span>
              ))}
              {job.skills.length > 6 && (
                <span className="skill-tag">+{job.skills.length - 6} more</span>
              )}
            </div>
          )}

          <div className="job-footer">
            <div className="job-source">
              <Tag size={14} />
              <span>Source:</span>
              <span className="source-badge">{job.source}</span>
            </div>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="apply-btn"
            >
              View Job
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JobList;
