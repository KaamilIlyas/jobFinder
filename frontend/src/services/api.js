import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export const jobsApi = {
  search: async (keywords, options = {}) => {
    const params = new URLSearchParams({
      keywords,
      limit: options.limit || 200,
      sortBy: options.sortBy || 'relevance',
      dateFilter: options.dateFilter || 'all',
      ...(options.type && { type: options.type }),
      ...(options.company && { company: options.company }),
      ...(options.minScore && { minScore: options.minScore })
    });
    
    return api.get(`/jobs/search?${params}`);
  },

  getSources: async () => {
    return api.get('/jobs/sources');
  },

  clearCache: async () => {
    return api.post('/jobs/clear-cache');
  }
};

export const analyticsApi = {
  analyze: async (jobs) => {
    return api.post('/analytics/analyze', { jobs });
  }
};

export default api;
