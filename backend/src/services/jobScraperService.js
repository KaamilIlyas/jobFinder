const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 1800 });

class JobScraperService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  cleanHtml(html) {
    if (!html) return '';
    const $ = cheerio.load(html);
    return $.text().replace(/\s+/g, ' ').trim().substring(0, 2000);
  }

  /**
   * 1. REMOTIVE API - Remote jobs (FREE)
   */
  async fetchRemotiveJobs(keywords, limit = 150) {
    const cacheKey = `remotive_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Remotive...');
      const response = await axios.get('https://remotive.com/api/remote-jobs', {
        params: { search: keywords, limit },
        timeout: 15000
      });

      const jobs = (response.data.jobs || []).map(job => ({
        id: `remotive_${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Worldwide',
        description: this.cleanHtml(job.description),
        url: job.url,
        salary: job.salary || '',
        postedDate: job.publication_date,
        source: 'Remotive',
        category: job.category
      }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Remotive: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Remotive:', error.message);
      return [];
    }
  }

  /**
   * 2. REMOTEOK API - Tech remote jobs (FREE)
   */
  async fetchRemoteOKJobs(keywords, limit = 150) {
    const cacheKey = `remoteok_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 RemoteOK...');
      const response = await axios.get('https://remoteok.com/api', {
        timeout: 15000,
        headers: { 'User-Agent': this.userAgent }
      });

      const kw = keywords.toLowerCase().split(/\s+/);
      const jobs = response.data
        .slice(1)
        .filter(job => {
          if (!job.position) return false;
          const text = `${job.position} ${job.company} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
          return kw.some(k => text.includes(k));
        })
        .slice(0, limit)
        .map(job => ({
          id: `remoteok_${job.id}`,
          title: job.position,
          company: job.company,
          location: job.location || 'Remote Worldwide',
          description: this.cleanHtml(job.description),
          url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
          salary: job.salary_min && job.salary_max ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}/yr` : '',
          postedDate: job.date,
          source: 'RemoteOK',
          category: (job.tags || []).slice(0, 2).join(', ')
        }));

      cache.set(cacheKey, jobs);
      console.log(`✅ RemoteOK: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ RemoteOK:', error.message);
      return [];
    }
  }

  /**
   * 3. ARBEITNOW API - European jobs (FREE)
   */
  async fetchArbeitnowJobs(keywords, limit = 100) {
    const cacheKey = `arbeitnow_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Arbeitnow...');
      const response = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
        timeout: 15000
      });

      const kw = keywords.toLowerCase().split(/\s+/);
      const jobs = (response.data.data || [])
        .filter(job => {
          const text = `${job.title} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
          return kw.some(k => text.includes(k));
        })
        .slice(0, limit)
        .map(job => ({
          id: `arbeitnow_${job.slug}`,
          title: job.title,
          company: job.company_name,
          location: job.location || (job.remote ? 'Remote' : 'Europe'),
          description: this.cleanHtml(job.description),
          url: job.url,
          salary: '',
          postedDate: new Date(job.created_at * 1000).toISOString(),
          source: 'Arbeitnow',
          category: (job.tags || []).slice(0, 2).join(', ')
        }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Arbeitnow: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Arbeitnow:', error.message);
      return [];
    }
  }

  /**
   * 4. JOBICY API - Remote jobs (FREE)
   */
  async fetchJobicyJobs(keywords, limit = 50) {
    const cacheKey = `jobicy_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Jobicy...');
      const response = await axios.get('https://jobicy.com/api/v2/remote-jobs', {
        params: { count: limit, tag: keywords },
        timeout: 15000
      });

      const jobs = (response.data.jobs || []).map(job => ({
        id: `jobicy_${job.id}`,
        title: job.jobTitle,
        company: job.companyName,
        location: job.jobGeo || 'Remote',
        description: this.cleanHtml(job.jobDescription),
        url: job.url,
        salary: job.annualSalaryMin && job.annualSalaryMax 
          ? `$${job.annualSalaryMin.toLocaleString()} - $${job.annualSalaryMax.toLocaleString()}/yr` : '',
        postedDate: job.pubDate,
        source: 'Jobicy',
        category: job.jobIndustry || ''
      }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Jobicy: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Jobicy:', error.message);
      return [];
    }
  }

  /**
   * 5. HIMALAYAS API - Remote jobs (FREE)
   */
  async fetchHimalayasJobs(keywords, limit = 50) {
    const cacheKey = `himalayas_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Himalayas...');
      const response = await axios.get('https://himalayas.app/jobs/api', {
        params: { limit, q: keywords },
        timeout: 15000
      });

      const jobs = (response.data.jobs || []).map(job => ({
        id: `himalayas_${job.id}`,
        title: job.title,
        company: job.companyName,
        location: job.locationRestrictions?.join(', ') || 'Remote',
        description: this.cleanHtml(job.description),
        url: job.applicationLink || `https://himalayas.app/jobs/${job.id}`,
        salary: job.minSalary && job.maxSalary 
          ? `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}/yr` : '',
        postedDate: job.pubDate || job.postedAt,
        source: 'Himalayas',
        category: job.categories?.join(', ') || ''
      }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Himalayas: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Himalayas:', error.message);
      return [];
    }
  }

  /**
   * 6. WEWORKREMOTELY FEED - Remote jobs (FREE)
   */
  async fetchWWRJobs(keywords, limit = 100) {
    const cacheKey = `wwr_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 WeWorkRemotely...');
      // Use the main RSS feed instead of category-specific ones
      const response = await axios.get('https://weworkremotely.com/remote-jobs.rss', {
        timeout: 15000,
        headers: { 
          'User-Agent': this.userAgent,
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const kw = keywords.toLowerCase().split(/\s+/);
      const jobs = [];

      $('item').each((i, el) => {
        const $el = $(el);
        const title = $el.find('title').text();
        const link = $el.find('link').text() || $el.find('guid').text();
        const pubDate = $el.find('pubDate').text();
        const description = $el.find('description').text();

        // Check if matches keywords
        const text = `${title} ${description}`.toLowerCase();
        if (!kw.some(k => text.includes(k))) return;

        // Parse "Company: Job Title" format
        const titleMatch = title.match(/^(.+?):\s*(.+)$/);
        jobs.push({
          id: `wwr_${i}_${Date.now()}`,
          title: titleMatch ? titleMatch[2].trim() : title,
          company: titleMatch ? titleMatch[1].trim() : 'Company',
          location: 'Remote Worldwide',
          description: this.cleanHtml(description),
          url: link,
          salary: '',
          postedDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: 'WeWorkRemotely',
          category: 'Remote'
        });
      });

      cache.set(cacheKey, jobs.slice(0, limit));
      console.log(`✅ WeWorkRemotely: ${jobs.length}`);
      return jobs.slice(0, limit);
    } catch (error) {
      console.error('❌ WWR:', error.message);
      return [];
    }
  }

  /**
   * 7. HACKERNEWS JOBS - Startup jobs (FREE via Algolia)
   */
  async fetchHNJobs(keywords, limit = 50) {
    const cacheKey = `hn_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 HackerNews Jobs...');
      const response = await axios.get('https://hn.algolia.com/api/v1/search_by_date', {
        params: { query: keywords, tags: 'job', hitsPerPage: Math.min(limit, 100) },
        timeout: 15000
      });

      const jobs = (response.data.hits || [])
        .filter(job => job.title || job.story_text)
        .map(job => ({
          id: `hn_${job.objectID}`,
          title: job.title || `Position at ${job.author}`,
          company: job.author || 'YC Company',
          location: 'Various',
          description: this.cleanHtml(job.story_text || job.comment_text || '').substring(0, 1500),
          url: `https://news.ycombinator.com/item?id=${job.objectID}`,
          salary: '',
          postedDate: job.created_at,
          source: 'HackerNews',
          category: 'Startup'
        }));

      cache.set(cacheKey, jobs);
      console.log(`✅ HackerNews: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ HN:', error.message);
      return [];
    }
  }

  /**
   * 8. ADZUNA API - Job aggregator (FREE tier - 250 requests/month)
   * Get free API key at: https://developer.adzuna.com/
   */
  async fetchAdzunaJobs(keywords, limit = 50) {
    const appId = process.env.ADZUNA_APP_ID;
    const apiKey = process.env.ADZUNA_API_KEY;
    if (!appId || !apiKey) return [];

    const cacheKey = `adzuna_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Adzuna...');
      const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/us/search/1`, {
        params: {
          app_id: appId,
          app_key: apiKey,
          what: keywords,
          results_per_page: limit,
          content_type: 'application/json'
        },
        timeout: 15000
      });

      const jobs = (response.data.results || []).map(job => ({
        id: `adzuna_${job.id}`,
        title: job.title,
        company: job.company?.display_name || 'Company',
        location: job.location?.display_name || 'Various',
        description: this.cleanHtml(job.description),
        url: job.redirect_url,
        salary: job.salary_min && job.salary_max 
          ? `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}/yr` : '',
        postedDate: job.created,
        source: 'Adzuna',
        category: job.category?.label || ''
      }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Adzuna: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Adzuna:', error.message);
      return [];
    }
  }

  /**
   * 9. THE MUSE API - Company jobs (FREE)
   */
  async fetchMuseJobs(keywords, limit = 50) {
    const cacheKey = `muse_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 The Muse...');
      const response = await axios.get('https://www.themuse.com/api/public/jobs', {
        params: { page: 1, descending: true },
        timeout: 15000
      });

      const kw = keywords.toLowerCase().split(/\s+/);
      const jobs = (response.data.results || [])
        .filter(job => {
          const text = `${job.name} ${job.contents} ${job.company?.name || ''}`.toLowerCase();
          return kw.some(k => text.includes(k));
        })
        .slice(0, limit)
        .map(job => ({
          id: `muse_${job.id}`,
          title: job.name,
          company: job.company?.name || 'Company',
          location: job.locations?.map(l => l.name).join(', ') || 'Various',
          description: this.cleanHtml(job.contents),
          url: job.refs?.landing_page || `https://www.themuse.com/jobs/${job.id}`,
          salary: '',
          postedDate: job.publication_date,
          source: 'TheMuse',
          category: job.categories?.map(c => c.name).join(', ') || ''
        }));

      cache.set(cacheKey, jobs);
      console.log(`✅ TheMuse: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ TheMuse:', error.message);
      return [];
    }
  }

  /**
   * 10. REED UK - UK Jobs API (FREE with registration)
   * Note: Returns empty if no API key, but won't error
   */
  async fetchReedJobs(keywords, limit = 50) {
    const apiKey = process.env.REED_API_KEY;
    if (!apiKey) {
      console.log('⏭️  Reed: No API key');
      return [];
    }

    const cacheKey = `reed_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Reed UK...');
      const response = await axios.get('https://www.reed.co.uk/api/1.0/search', {
        params: { keywords, resultsToTake: limit },
        auth: { username: apiKey, password: '' },
        timeout: 10000
      });

      const jobs = (response.data.results || []).map(job => ({
        id: `reed_${job.jobId}`,
        title: job.jobTitle,
        company: job.employerName,
        location: job.locationName || 'UK',
        description: job.jobDescription || '',
        url: job.jobUrl,
        salary: job.minimumSalary && job.maximumSalary 
          ? `£${job.minimumSalary.toLocaleString()} - £${job.maximumSalary.toLocaleString()}` : '',
        postedDate: job.date,
        source: 'Reed',
        category: ''
      }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Reed: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Reed:', error.message);
      return [];
    }
  }

  /**
   * 11. LANDING.JOBS API - EU Tech jobs (FREE)
   */
  async fetchLandingJobs(keywords, limit = 50) {
    const cacheKey = `landing_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Landing.jobs...');
      const response = await axios.get('https://landing.jobs/api/v1/jobs', {
        params: { limit, q: keywords },
        timeout: 15000
      });

      const jobs = (response.data || []).slice(0, limit).map(job => ({
        id: `landing_${job.id || job.slug}`,
        title: job.title,
        company: job.company_name || job.company?.name || 'Company',
        location: job.city || 'Remote',
        description: this.cleanHtml(job.description),
        url: job.url || `https://landing.jobs/job/${job.slug}`,
        salary: job.salary || '',
        postedDate: job.published_at || new Date().toISOString(),
        source: 'LandingJobs',
        category: job.role_type || ''
      }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Landing.jobs: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Landing.jobs:', error.message);
      return [];
    }
  }

  /**
   * 12. JOBS COLLECTOR - Multiple sources (FREE RSS)
   */
  async fetchJobsCollector(keywords, limit = 50) {
    const cacheKey = `collector_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 JobsCollector...');
      const response = await axios.get(`https://jobspresso.co/jm-ajax/get_listings/`, {
        params: { search_keywords: keywords, per_page: limit },
        timeout: 15000,
        headers: { 'User-Agent': this.userAgent }
      });

      if (!response.data.html) return [];

      const $ = cheerio.load(response.data.html);
      const jobs = [];

      $('li.job_listing, .job_listing').each((i, el) => {
        const $el = $(el);
        const title = $el.find('.job_listing-title, h3').text().trim();
        const company = $el.find('.job_listing-company, .company').text().trim();
        const link = $el.find('a').first().attr('href');

        if (title) {
          jobs.push({
            id: `jobspresso_${i}_${Date.now()}`,
            title,
            company: company || 'Company',
            location: 'Remote',
            description: title,
            url: link || 'https://jobspresso.co',
            salary: '',
            postedDate: new Date().toISOString(),
            source: 'Jobspresso',
            category: ''
          });
        }
      });

      cache.set(cacheKey, jobs);
      console.log(`✅ Jobspresso: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Jobspresso:', error.message);
      return [];
    }
  }

  /**
   * 13. GITHUB JOBS via HN - Github jobs from HN (FREE)
   */
  async fetchGithubJobs(keywords, limit = 30) {
    const cacheKey = `github_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 GitHub/HN Jobs...');
      // Search HN for GitHub job posts
      const response = await axios.get('https://hn.algolia.com/api/v1/search', {
        params: { 
          query: `${keywords} hiring`, 
          tags: 'story',
          hitsPerPage: limit
        },
        timeout: 15000
      });

      const jobs = (response.data.hits || [])
        .filter(hit => {
          const title = (hit.title || '').toLowerCase();
          return title.includes('hiring') || title.includes('job') || title.includes('looking for');
        })
        .map(hit => ({
          id: `ghjob_${hit.objectID}`,
          title: hit.title,
          company: hit.author || 'Company',
          location: 'Remote/Various',
          description: hit.title,
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          salary: '',
          postedDate: hit.created_at,
          source: 'HN-Hiring',
          category: 'Tech'
        }));

      cache.set(cacheKey, jobs);
      console.log(`✅ GitHub/HN: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ GitHub/HN:', error.message);
      return [];
    }
  }

  /**
   * 14. GITHUB JOBS - Search GitHub for hiring posts (FREE)
   */
  async fetchGitHubHiring(keywords, limit = 30) {
    const cacheKey = `github_hiring_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 GitHub Hiring...');
      // Search for "who is hiring" threads and job posts
      const response = await axios.get('https://hn.algolia.com/api/v1/search_by_date', {
        params: {
          query: `hiring ${keywords}`,
          tags: '(story,comment)',
          hitsPerPage: Math.min(limit * 2, 100)
        },
        timeout: 10000
      });

      const jobs = (response.data.hits || [])
        .filter(hit => {
          const text = (hit.title || hit.comment_text || '').toLowerCase();
          return (text.includes('hiring') || text.includes('job') || text.includes('remote')) &&
                 keywords.toLowerCase().split(/\s+/).some(k => text.includes(k));
        })
        .slice(0, limit)
        .map(hit => ({
          id: `gh_${hit.objectID}`,
          title: hit.title || `Hiring: ${keywords}`,
          company: hit.author || 'Company',
          location: 'Remote/Various',
          description: this.cleanHtml(hit.comment_text || hit.story_text || hit.title || ''),
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          salary: '',
          postedDate: hit.created_at,
          source: 'HN-Hiring',
          category: 'Tech'
        }));

      cache.set(cacheKey, jobs);
      console.log(`✅ HN-Hiring: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ HN-Hiring:', error.message);
      return [];
    }
  }

  /**
   * 15. REMOTEOK TAGS - Get more jobs by searching different tags (FREE)
   */
  async fetchRemoteOKTags(keywords, limit = 50) {
    const cacheKey = `remoteok_tags_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 RemoteOK Tags...');
      // Search specific tags that might match keywords
      const tags = ['developer', 'engineer', 'design', 'marketing', 'sales', 'devops', 'frontend', 'backend', 'fullstack'];
      const kw = keywords.toLowerCase().split(/\s+/);
      const matchingTags = tags.filter(t => kw.some(k => t.includes(k) || k.includes(t)));
      
      if (matchingTags.length === 0) matchingTags.push('developer');
      
      const allJobs = [];
      for (const tag of matchingTags.slice(0, 2)) {
        try {
          const response = await axios.get(`https://remoteok.com/api?tag=${tag}`, {
            timeout: 8000,
            headers: { 'User-Agent': this.userAgent }
          });
          
          const jobs = (response.data || []).slice(1).map(job => ({
            id: `remoteok_tag_${job.id}`,
            title: job.position,
            company: job.company,
            location: job.location || 'Remote',
            description: this.cleanHtml(job.description),
            url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
            salary: job.salary_min && job.salary_max ? `$${job.salary_min.toLocaleString()}-$${job.salary_max.toLocaleString()}` : '',
            postedDate: job.date,
            source: 'RemoteOK-Tags',
            category: tag
          }));
          allJobs.push(...jobs);
        } catch (e) {}
      }

      const result = allJobs.slice(0, limit);
      cache.set(cacheKey, result);
      console.log(`✅ RemoteOK-Tags: ${result.length}`);
      return result;
    } catch (error) {
      console.error('❌ RemoteOK-Tags:', error.message);
      return [];
    }
  }

  /**
   * 16. JOBICY CATEGORIES - Get more jobs from different categories (FREE)
   */
  async fetchJobicyCategories(keywords, limit = 50) {
    const cacheKey = `jobicy_cat_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Jobicy Extra...');
      // Fetch without tag filter to get all jobs, then filter
      const response = await axios.get('https://jobicy.com/api/v2/remote-jobs', {
        params: { count: 100 },
        timeout: 10000
      });

      const kw = keywords.toLowerCase().split(/\s+/);
      const jobs = (response.data.jobs || [])
        .filter(job => {
          const text = `${job.jobTitle} ${job.companyName} ${job.jobDescription || ''} ${job.jobIndustry || ''}`.toLowerCase();
          return kw.some(k => text.includes(k));
        })
        .slice(0, limit)
        .map(job => ({
          id: `jobicy_extra_${job.id}`,
          title: job.jobTitle,
          company: job.companyName,
          location: job.jobGeo || 'Remote',
          description: this.cleanHtml(job.jobDescription),
          url: job.url,
          salary: job.annualSalaryMin && job.annualSalaryMax
            ? `$${job.annualSalaryMin.toLocaleString()}-$${job.annualSalaryMax.toLocaleString()}/yr` : '',
          postedDate: job.pubDate,
          source: 'Jobicy-Extra',
          category: job.jobIndustry || ''
        }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Jobicy-Extra: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Jobicy-Extra:', error.message);
      return [];
    }
  }

  /**
   * 17. REMOTIVE CATEGORIES - Get more jobs from all categories (FREE)
   */
  async fetchRemotiveCategories(keywords, limit = 100) {
    const cacheKey = `remotive_cat_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Remotive Extra...');
      // Fetch all jobs then filter - Remotive has limited search
      const response = await axios.get('https://remotive.com/api/remote-jobs', {
        params: { limit: 200 },
        timeout: 15000
      });

      const kw = keywords.toLowerCase().split(/\s+/);
      const jobs = (response.data.jobs || [])
        .filter(job => {
          const text = `${job.title} ${job.company_name} ${job.description || ''} ${job.category || ''}`.toLowerCase();
          return kw.some(k => text.includes(k));
        })
        .slice(0, limit)
        .map(job => ({
          id: `remotive_extra_${job.id}`,
          title: job.title,
          company: job.company_name,
          location: job.candidate_required_location || 'Worldwide',
          description: this.cleanHtml(job.description),
          url: job.url,
          salary: job.salary || '',
          postedDate: job.publication_date,
          source: 'Remotive-Extra',
          category: job.category
        }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Remotive-Extra: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Remotive-Extra:', error.message);
      return [];
    }
  }

  /**
   * 18. ARBEITNOW EXTRA - Get more European remote jobs (FREE)
   */
  async fetchArbeitnowExtra(keywords, limit = 50) {
    const cacheKey = `arbeitnow_extra_${keywords}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('📡 Arbeitnow Extra...');
      // Fetch all remote jobs and filter
      const response = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
        timeout: 10000
      });

      const kw = keywords.toLowerCase().split(/\s+/);
      const jobs = (response.data.data || [])
        .filter(job => {
          if (!job.remote) return false;
          const text = `${job.title} ${job.company_name || ''} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
          return kw.some(k => text.includes(k));
        })
        .slice(0, limit)
        .map(job => ({
          id: `arbeitnow_extra_${job.slug}`,
          title: job.title,
          company: job.company_name,
          location: job.location || 'Remote Europe',
          description: this.cleanHtml(job.description),
          url: job.url,
          salary: '',
          postedDate: new Date(job.created_at * 1000).toISOString(),
          source: 'Arbeitnow-Extra',
          category: (job.tags || []).slice(0, 2).join(', ')
        }));

      cache.set(cacheKey, jobs);
      console.log(`✅ Arbeitnow-Extra: ${jobs.length}`);
      return jobs;
    } catch (error) {
      console.error('❌ Arbeitnow-Extra:', error.message);
      return [];
    }
  }

  /**
   * Filter jobs by date
   */
  filterByDate(jobs, dateFilter) {
    if (!dateFilter || dateFilter === 'all') return jobs;

    const now = new Date();
    const cutoffs = {
      '24h': 1,
      '3d': 3,
      '7d': 7,
      '14d': 14,
      '30d': 30
    };

    const days = cutoffs[dateFilter] || 30;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return jobs.filter(job => {
      if (!job.postedDate) return true;
      try {
        return new Date(job.postedDate) >= cutoffDate;
      } catch {
        return true;
      }
    });
  }

  /**
   * Main aggregation - fetch from ALL sources
   */
  async aggregateJobs(keywords, options = {}) {
    const { limit = 500, dateFilter = 'all' } = options;

    console.log(`\n🔍 Searching: "${keywords}" | Filter: ${dateFilter}`);
    console.log('━'.repeat(50));

    // Fetch from all sources in parallel - using ONLY working FREE APIs
    const results = await Promise.allSettled([
      this.fetchRemotiveJobs(keywords, 150),         // 1. Remotive API
      this.fetchRemoteOKJobs(keywords, 150),         // 2. RemoteOK API  
      this.fetchArbeitnowJobs(keywords, 100),        // 3. Arbeitnow API
      this.fetchJobicyJobs(keywords, 50),            // 4. Jobicy API
      this.fetchHimalayasJobs(keywords, 50),         // 5. Himalayas API
      this.fetchWWRJobs(keywords, 100),              // 6. WeWorkRemotely RSS
      this.fetchHNJobs(keywords, 50),                // 7. HackerNews Algolia
      this.fetchMuseJobs(keywords, 50),              // 8. The Muse API
      this.fetchReedJobs(keywords, 50),              // 9. Reed UK (optional)
      this.fetchAdzunaJobs(keywords, 50),            // 10. Adzuna (optional)
      this.fetchLandingJobs(keywords, 50),           // 11. Landing.jobs API
      this.fetchJobsCollector(keywords, 30),         // 12. Jobspresso
      this.fetchGithubJobs(keywords, 30),            // 13. HN Who's Hiring
      this.fetchGitHubHiring(keywords, 30),          // 14. HN Hiring posts
      this.fetchRemoteOKTags(keywords, 50),          // 15. RemoteOK by tags
      this.fetchJobicyCategories(keywords, 50),      // 16. Jobicy all jobs
      this.fetchRemotiveCategories(keywords, 100),   // 17. Remotive all jobs
      this.fetchArbeitnowExtra(keywords, 50)         // 18. Arbeitnow remote
    ]);

    // Combine results
    let allJobs = [];
    const stats = {};
    const names = [
      'Remotive', 'RemoteOK', 'Arbeitnow', 'Jobicy', 'Himalayas', 
      'WWR', 'HN', 'Muse', 'Reed', 'Adzuna', 'Landing', 'Jobspresso',
      'HN-Who', 'HN-Hiring', 'RemoteOK-Tags', 'Jobicy-Extra', 
      'Remotive-Extra', 'Arbeitnow-Extra'
    ];

    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value) {
        stats[names[i]] = result.value.length;
        allJobs = allJobs.concat(result.value);
      } else {
        stats[names[i]] = 0;
      }
    });

    console.log('━'.repeat(50));
    console.log('📊 Results:', stats);

    // Filter by date
    allJobs = this.filterByDate(allJobs, dateFilter);

    // Remove duplicates - more aggressive deduplication
    const seen = new Set();
    const unique = allJobs.filter(job => {
      // Create key from normalized title + company
      const normalizedTitle = job.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
      const normalizedCompany = job.company.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30);
      const key = `${normalizedTitle}_${normalizedCompany}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by date (most recent first)
    unique.sort((a, b) => {
      const dateA = a.postedDate ? new Date(a.postedDate) : new Date(0);
      const dateB = b.postedDate ? new Date(b.postedDate) : new Date(0);
      return dateB - dateA;
    });

    console.log(`✅ Total unique: ${unique.length} (after ${dateFilter} filter)`);
    console.log('━'.repeat(50) + '\n');

    return unique.slice(0, limit);
  }

  clearCache() {
    cache.flushAll();
  }
}

module.exports = new JobScraperService();
