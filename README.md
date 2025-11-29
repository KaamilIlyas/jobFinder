# JobFinder Pro - AI-Powered Job Aggregator

A full-stack job search application that aggregates job listings from multiple portals and uses NLP to rank them based on relevance to user keywords.

![JobFinder Pro](https://via.placeholder.com/800x400?text=JobFinder+Pro+Dashboard)

## Features

### 🔍 Smart Job Search
- Search jobs using keywords, skills, or job titles
- Aggregates listings from multiple job portals (Remotive, Adzuna, The Muse, Arbeitnow)
- Real-time search with caching for performance

### 🤖 NLP-Powered Ranking
- Uses Natural Language Processing to analyze job descriptions
- Calculates relevance scores based on keyword matching
- TF-IDF analysis for better matching accuracy
- Automatic skill extraction from job descriptions

### 📊 Analytics Dashboard
- Visualize jobs by company, location, and source
- Track top required skills across listings
- Relevance score distribution charts
- Job posting trends over time
- Salary insights and statistics

### 🎯 Advanced Filtering
- Filter by relevance score threshold
- Filter by job source
- Filter by job type (Full-time, Contract, Remote, etc.)
- Filter by location
- Multiple sorting options

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Natural** - NLP library for text analysis
- **Cheerio** - HTML parsing for web scraping
- **Axios** - HTTP client for API calls
- **Node-Cache** - In-memory caching

### Frontend
- **React** 18 with Hooks
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Framer Motion** - Animations
- **Date-fns** - Date formatting

## Project Structure

```
jobPortal/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server
│   │   ├── routes/
│   │   │   ├── jobs.js           # Job search endpoints
│   │   │   └── analytics.js      # Analytics endpoints
│   │   └── services/
│   │       ├── jobScraperService.js  # Job aggregation
│   │       └── nlpService.js         # NLP ranking
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js                # Main component
│   │   ├── index.js
│   │   ├── index.css             # Global styles
│   │   ├── components/
│   │   │   ├── Dashboard.js      # Analytics dashboard
│   │   │   ├── Filters.js        # Filter sidebar
│   │   │   └── JobList.js        # Job listings
│   │   └── services/
│   │       └── api.js            # API client
│   └── package.json
├── package.json                   # Root package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd jobPortal
```

2. Install all dependencies:
```bash
npm run install:all
```

Or install separately:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. Configure environment variables:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your API keys (optional - the app works with demo data):
```env
PORT=5000
ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_api_key
```

### Running the Application

**Development mode (both frontend and backend):**
```bash
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Jobs
- `GET /api/jobs/search` - Search jobs with NLP ranking
  - Query params: `keywords`, `location`, `limit`, `sources`, `sortBy`, `type`, `company`, `minScore`
- `GET /api/jobs/sources` - Get available job sources
- `POST /api/jobs/clear-cache` - Clear job cache

### Analytics
- `POST /api/analytics/analyze` - Analyze jobs and return statistics
  - Body: `{ jobs: [...] }`

### Health
- `GET /api/health` - Health check endpoint

## Configuration

### Job Sources

The app supports multiple job APIs:

| Source | Type | API Key Required |
|--------|------|------------------|
| Remotive | API | No |
| The Muse | API | No |
| Arbeitnow | API | No |
| Adzuna | API | Yes (Free tier available) |

To add Adzuna support:
1. Sign up at https://developer.adzuna.com/
2. Add your credentials to `.env`

### NLP Configuration

The NLP service can be customized in `backend/src/services/nlpService.js`:
- Add skill synonyms
- Customize stop words
- Adjust scoring weights
- Add tech keywords for skill extraction

## Screenshots

### Job Search Results
Modern card-based job listings with relevance scores, skill tags, and quick filters.

### Analytics Dashboard
Interactive charts showing:
- Top required skills
- Jobs by company
- Source distribution
- Score distribution
- Posting trends
- Location breakdown

## Future Enhancements

- [ ] User authentication and saved searches
- [ ] Email alerts for new matching jobs
- [ ] Resume parsing and matching
- [ ] More job board integrations
- [ ] Job application tracking
- [ ] Interview scheduling
- [ ] Salary comparison tools

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Natural](https://github.com/NaturalNode/natural) - NLP library
- [Recharts](https://recharts.org/) - Charting library
- [Lucide](https://lucide.dev/) - Beautiful icons
