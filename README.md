# JobFinder Pro

Remote job aggregator with NLP-based relevance ranking.

## Tech Stack

- **Backend**: Node.js, Express, Natural (NLP), Node-Cache
- **Frontend**: React, Recharts, Lucide Icons

## How It Works

```
User Search → Backend API → Job Aggregator → NLP Ranker → Ranked Results → Frontend Display
```

### 1. Job Aggregation (`jobScraperService.js`)
- Fetches jobs from multiple FREE APIs: **Remotive**, **RemoteOK**, **Arbeitnow**, **Jobicy**, **The Muse**
- Each API has its own fetch method with keyword filtering
- Results are cached for 30 min (`NodeCache`) to reduce API calls
- Jobs are normalized to a common format: `{ id, title, company, location, description, url, salary, postedDate, source }`

### 2. NLP Ranking (`nlpService.js`)
The core ranking algorithm:
```
Final Score = (Jaccard Similarity × 50) + (Term Frequency Bonus × 30) + (Title Match Bonus × 20)
```

**Key logic:**
- **Preprocessing**: Lowercase, remove special chars, expand synonyms (e.g., `js` → `javascript`)
- **Tokenization**: Uses Porter Stemmer to reduce words to root form
- **Jaccard Similarity**: `intersection(userTokens, jobTokens) / union(userTokens, jobTokens)`
- **TF Bonus**: Higher score if user keywords appear multiple times in job
- **Title Bonus**: Extra weight (+15% per match) if keywords appear in job title
- **Skill Extraction**: Scans description for known tech keywords (80+ terms)

### 3. API Flow (`routes/jobs.js`)
```
GET /api/jobs/search?keywords=react&limit=100&sortBy=relevance
    ↓
jobScraperService.aggregateJobs() → Fetches from all sources
    ↓
nlpService.rankJobs() → Scores & sorts by relevance
    ↓
Apply filters (type, company, minScore)
    ↓
Return { jobs, totalJobs, suggestedKeywords }
```

### 4. Frontend Flow (`App.js`)
```
Search Input → jobsApi.search() → setJobs() → applyFilters() → JobList renders
                    ↓
              analyticsApi.analyze() → Dashboard charts
```

## Project Structure

```
backend/src/
├── index.js                 # Express server setup
├── routes/
│   ├── jobs.js              # GET /api/jobs/search, /sources
│   └── analytics.js         # POST /api/analytics/analyze
└── services/
    ├── jobScraperService.js # Multi-source job fetching + caching
    └── nlpService.js        # Tokenization, stemming, scoring

frontend/src/
├── App.js                   # Main state & search logic
├── components/
│   ├── JobList.js           # Job cards display
│   ├── Filters.js           # Source/sort filters
│   └── Dashboard.js         # Analytics charts
└── services/api.js          # Axios API client
```

## Quick Start

```bash
npm run install:all   # Install all dependencies
npm run dev           # Start both frontend (3000) & backend (5000)
```

## Key Files to Understand

| File | Purpose |
|------|---------|
| `nlpService.js` | All NLP logic - synonyms, stemming, scoring formula |
| `jobScraperService.js` | API integrations, caching, data normalization |
| `routes/jobs.js` | Main search endpoint, filter application |
| `App.js` | Frontend state management, search flow |
