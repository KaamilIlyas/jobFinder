const natural = require('natural');
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

class NLPService {
  constructor() {
    this.tfidf = new TfIdf();
    this.stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
      'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
      'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where',
      'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'just', 'about', 'above', 'after',
      'again', 'against', 'am', 'any', 'because', 'before', 'being', 'below',
      'between', 'during', 'further', 'here', 'into', 'off', 'once', 'our',
      'out', 'over', 'then', 'there', 'through', 'under', 'until', 'up', 'while',
      'your', 'his', 'her', 'my', 'their', 'also', 'etc', 'able', 'nbsp'
    ]);

    // Skill synonyms for better matching
    this.synonyms = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'ml': 'machine learning',
      'ai': 'artificial intelligence',
      'dl': 'deep learning',
      'fe': 'frontend',
      'be': 'backend',
      'fs': 'fullstack',
      'db': 'database',
      'sql': 'database',
      'nosql': 'database',
      'k8s': 'kubernetes',
      'aws': 'amazon web services',
      'gcp': 'google cloud platform',
      'ci/cd': 'continuous integration',
      'ux': 'user experience',
      'ui': 'user interface',
      'qa': 'quality assurance',
      'swe': 'software engineer',
      'sde': 'software development engineer',
      'pm': 'product manager',
      'devops': 'development operations'
    };

    // Tech keywords for skill extraction
    this.techKeywords = new Set([
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go',
      'rust', 'swift', 'kotlin', 'php', 'scala', 'r', 'matlab', 'perl',
      'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'gatsby',
      'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'rails',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible',
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'graphql',
      'rest', 'api', 'microservices', 'serverless', 'ci/cd', 'jenkins', 'github',
      'git', 'agile', 'scrum', 'jira', 'confluence', 'figma', 'sketch',
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp',
      'computer vision', 'data science', 'data engineering', 'spark', 'hadoop',
      'tableau', 'power bi', 'sql', 'nosql', 'linux', 'unix', 'bash',
      'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material ui',
      'redux', 'mobx', 'webpack', 'vite', 'babel', 'jest', 'cypress',
      'selenium', 'playwright', 'puppeteer', 'blockchain', 'web3', 'solidity'
    ]);
  }

  /**
   * Preprocess text for NLP analysis
   */
  preprocessText(text) {
    if (!text) return '';
    
    // Convert to lowercase and normalize
    let processed = text.toLowerCase()
      .replace(/[^\w\s\+\#\.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Replace synonyms
    Object.entries(this.synonyms).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      processed = processed.replace(regex, full);
    });

    return processed;
  }

  /**
   * Tokenize and stem text
   */
  tokenizeAndStem(text) {
    const processed = this.preprocessText(text);
    const tokens = tokenizer.tokenize(processed) || [];
    
    return tokens
      .filter(token => token.length > 1 && !this.stopWords.has(token))
      .map(token => stemmer.stem(token));
  }

  /**
   * Extract skills from job description
   */
  extractSkills(text) {
    if (!text) return [];
    
    const processed = this.preprocessText(text);
    const skills = [];
    
    this.techKeywords.forEach(keyword => {
      if (processed.includes(keyword.toLowerCase())) {
        skills.push(keyword);
      }
    });

    return [...new Set(skills)];
  }

  /**
   * Calculate relevance score between user keywords and job
   */
  calculateRelevanceScore(userKeywords, job) {
    const userTokens = this.tokenizeAndStem(userKeywords);
    
    // Combine job title, description, and company for matching
    const jobText = `${job.title} ${job.description} ${job.company} ${job.skills?.join(' ') || ''}`;
    const jobTokens = this.tokenizeAndStem(jobText);

    if (userTokens.length === 0 || jobTokens.length === 0) {
      return 0;
    }

    // Calculate Jaccard similarity
    const userSet = new Set(userTokens);
    const jobSet = new Set(jobTokens);
    
    const intersection = new Set([...userSet].filter(x => jobSet.has(x)));
    const union = new Set([...userSet, ...jobSet]);
    
    const jaccardScore = intersection.size / union.size;

    // Calculate term frequency bonus
    let tfBonus = 0;
    userTokens.forEach(token => {
      const count = jobTokens.filter(t => t === token).length;
      tfBonus += Math.min(count * 0.05, 0.2);
    });

    // Title match bonus (jobs with keywords in title get higher score)
    const titleTokens = this.tokenizeAndStem(job.title);
    const titleMatches = userTokens.filter(t => titleTokens.includes(t)).length;
    const titleBonus = titleMatches * 0.15;

    // Calculate final score (0-100)
    const rawScore = (jaccardScore * 50) + (tfBonus * 30) + (titleBonus * 20);
    return Math.min(Math.round(rawScore * 100) / 100, 100);
  }

  /**
   * Rank jobs by relevance to user keywords
   */
  rankJobs(jobs, userKeywords) {
    if (!userKeywords || userKeywords.trim() === '') {
      return jobs.map(job => ({
        ...job,
        relevanceScore: 50,
        skills: this.extractSkills(job.description)
      }));
    }

    return jobs
      .map(job => {
        const skills = this.extractSkills(job.description);
        const relevanceScore = this.calculateRelevanceScore(userKeywords, { ...job, skills });
        
        return {
          ...job,
          relevanceScore,
          skills
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Extract top skills from all jobs
   */
  extractTopSkills(jobs, limit = 10) {
    const skillCounts = {};
    
    jobs.forEach(job => {
      const skills = job.skills || this.extractSkills(job.description);
      skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([skill, count]) => ({ skill, count }));
  }

  /**
   * Get keyword suggestions based on job descriptions
   */
  getSuggestedKeywords(jobs, limit = 5) {
    const tfidf = new TfIdf();
    
    jobs.forEach(job => {
      const text = this.preprocessText(`${job.title} ${job.description}`);
      tfidf.addDocument(text);
    });

    const termScores = {};
    
    jobs.forEach((job, index) => {
      tfidf.listTerms(index).forEach(item => {
        if (!this.stopWords.has(item.term) && item.term.length > 2) {
          termScores[item.term] = (termScores[item.term] || 0) + item.tfidf;
        }
      });
    });

    return Object.entries(termScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([term]) => term);
  }
}

module.exports = new NLPService();
