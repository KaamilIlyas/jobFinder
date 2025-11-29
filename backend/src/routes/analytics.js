const express = require('express');
const router = express.Router();
const nlpService = require('../services/nlpService');

/**
 * POST /api/analytics/analyze
 * Analyze jobs and return statistics
 */
router.post('/analyze', (req, res) => {
  try {
    const { jobs } = req.body;

    if (!jobs || !Array.isArray(jobs)) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Jobs array is required'
      });
    }

    // Jobs per company
    const companyCounts = {};
    jobs.forEach(job => {
      const company = job.company || 'Unknown';
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });

    const jobsPerCompany = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Jobs per source
    const sourceCounts = {};
    jobs.forEach(job => {
      const source = job.source || 'Unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const jobsPerSource = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Jobs per location
    const locationCounts = {};
    jobs.forEach(job => {
      let location = job.location || 'Not specified';
      // Normalize remote variations
      if (location.toLowerCase().includes('remote')) {
        location = 'Remote';
      }
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    const jobsPerLocation = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Jobs per type
    const typeCounts = {};
    jobs.forEach(job => {
      const type = job.type || 'Not specified';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const jobsPerType = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Top skills
    const topSkills = nlpService.extractTopSkills(jobs, 15);

    // Relevance score distribution
    const scoreRanges = {
      'Excellent (80-100)': 0,
      'Good (60-79)': 0,
      'Fair (40-59)': 0,
      'Low (20-39)': 0,
      'Poor (0-19)': 0
    };

    jobs.forEach(job => {
      const score = job.relevanceScore || 0;
      if (score >= 80) scoreRanges['Excellent (80-100)']++;
      else if (score >= 60) scoreRanges['Good (60-79)']++;
      else if (score >= 40) scoreRanges['Fair (40-59)']++;
      else if (score >= 20) scoreRanges['Low (20-39)']++;
      else scoreRanges['Poor (0-19)']++;
    });

    const scoreDistribution = Object.entries(scoreRanges)
      .map(([range, count]) => ({ range, count }));

    // Jobs posted over time (last 30 days)
    const today = new Date();
    const jobsOverTime = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = jobs.filter(job => {
        if (!job.postedDate) return false;
        const jobDate = new Date(job.postedDate).toISOString().split('T')[0];
        return jobDate === dateStr;
      }).length;
      
      jobsOverTime.push({ date: dateStr, count });
    }

    // Average relevance score
    const avgScore = jobs.length > 0
      ? Math.round(jobs.reduce((sum, job) => sum + (job.relevanceScore || 0), 0) / jobs.length)
      : 0;

    // Salary insights
    const salaryInfo = jobs
      .filter(job => job.salary && job.salary !== 'Not specified')
      .map(job => {
        const match = job.salary.match(/\$?([\d,]+)/g);
        if (match) {
          return parseInt(match[0].replace(/[$,]/g, ''));
        }
        return null;
      })
      .filter(Boolean);

    const salaryStats = salaryInfo.length > 0 ? {
      min: Math.min(...salaryInfo),
      max: Math.max(...salaryInfo),
      avg: Math.round(salaryInfo.reduce((a, b) => a + b, 0) / salaryInfo.length),
      count: salaryInfo.length
    } : null;

    res.json({
      success: true,
      totalJobs: jobs.length,
      analytics: {
        jobsPerCompany,
        jobsPerSource,
        jobsPerLocation,
        jobsPerType,
        topSkills,
        scoreDistribution,
        jobsOverTime,
        avgRelevanceScore: avgScore,
        salaryStats
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze jobs',
      message: error.message 
    });
  }
});

module.exports = router;
