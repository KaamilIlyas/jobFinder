const express = require('express');
const router = express.Router();
const jobScraperService = require('../services/jobScraperService');
const nlpService = require('../services/nlpService');

/**
 * GET /api/jobs/search
 * Search for remote jobs based on keywords
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      keywords = '', 
      limit = 100,
      sortBy = 'relevance',
      dateFilter = 'all',
      type,
      company,
      minScore
    } = req.query;

    if (!keywords.trim()) {
      return res.status(400).json({ 
        error: 'Keywords are required',
        message: 'Please provide search keywords'
      });
    }

    // Aggregate jobs from multiple FREE sources
    const jobs = await jobScraperService.aggregateJobs(keywords, {
      limit: parseInt(limit),
      dateFilter
    });

    // Rank jobs using NLP
    let rankedJobs = nlpService.rankJobs(jobs, keywords);

    // Apply filters
    if (type) {
      const types = type.toLowerCase().split(',');
      rankedJobs = rankedJobs.filter(job => 
        types.some(t => job.type?.toLowerCase().includes(t))
      );
    }

    if (company) {
      const companies = company.toLowerCase().split(',');
      rankedJobs = rankedJobs.filter(job => 
        companies.some(c => job.company?.toLowerCase().includes(c))
      );
    }

    if (minScore) {
      rankedJobs = rankedJobs.filter(job => job.relevanceScore >= parseFloat(minScore));
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        rankedJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        break;
      case 'company':
        rankedJobs.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case 'relevance':
      default:
        // Already sorted by relevance from rankJobs
        break;
    }

    // Get suggestions
    const suggestedKeywords = nlpService.getSuggestedKeywords(rankedJobs, 5);

    res.json({
      success: true,
      totalJobs: rankedJobs.length,
      keywords,
      suggestedKeywords,
      jobs: rankedJobs
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to search jobs',
      message: error.message 
    });
  }
});

/**
 * GET /api/jobs/sources
 * Get list of available job sources
 */
router.get('/sources', (req, res) => {
  res.json({
    sources: [
      { id: 'all', name: 'All Sources', description: 'Aggregate from all available sources' },
      { id: 'remotive', name: 'Remotive', description: 'Remote job listings worldwide' },
      { id: 'remoteok', name: 'RemoteOK', description: 'Remote job board' },
      { id: 'muse', name: 'The Muse', description: 'Career platform with curated jobs' },
      { id: 'arbeitnow', name: 'Arbeitnow', description: 'European job board' },
      { id: 'findwork', name: 'FindWork', description: 'Developer jobs' },
      { id: 'hn', name: 'HackerNews', description: 'Tech jobs from HN' },
      { id: 'jsearch', name: 'JSearch', description: 'LinkedIn/Indeed/Glassdoor aggregator (API key required)' },
      { id: 'linkedin', name: 'LinkedIn', description: 'LinkedIn jobs (API key required)' },
      { id: 'indeed', name: 'Indeed', description: 'Indeed jobs (API key required)' },
      { id: 'glassdoor', name: 'Glassdoor', description: 'Glassdoor jobs (API key required)' },
      { id: 'adzuna', name: 'Adzuna', description: 'Global job search engine (API key required)' }
    ],
    dateFilters: [
      { id: 'all', name: 'All Time' },
      { id: '24h', name: 'Past 24 Hours' },
      { id: '3d', name: 'Past 3 Days' },
      { id: '7d', name: 'Past Week' },
      { id: '14d', name: 'Past 2 Weeks' },
      { id: '30d', name: 'Past Month' }
    ],
    locations: [
      { id: 'all', name: 'All Locations' },
      { id: 'pakistan', name: 'Pakistan' },
      { id: 'remote', name: 'Remote Only' },
      { id: 'us', name: 'United States' },
      { id: 'uk', name: 'United Kingdom' },
      { id: 'uae', name: 'UAE / Dubai' },
      { id: 'canada', name: 'Canada' },
      { id: 'germany', name: 'Germany' },
      { id: 'singapore', name: 'Singapore' }
    ]
  });
});

/**
 * POST /api/jobs/clear-cache
 * Clear the job cache
 */
router.post('/clear-cache', (req, res) => {
  jobScraperService.clearCache();
  res.json({ success: true, message: 'Cache cleared successfully' });
});

module.exports = router;
