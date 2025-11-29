import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Briefcase,
  Building2,
  TrendingUp,
  Award,
  MapPin,
  DollarSign,
  Code,
  Layers
} from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

function Dashboard({ analytics, jobs }) {
  if (!analytics) {
    return (
      <div className="empty-state">
        <TrendingUp size={64} />
        <h3>No Analytics Data</h3>
        <p>Search for jobs to see analytics and visualizations.</p>
      </div>
    );
  }

  const {
    jobsPerCompany,
    jobsPerSource,
    jobsPerLocation,
    jobsPerType,
    topSkills,
    scoreDistribution,
    jobsOverTime,
    avgRelevanceScore,
    salaryStats
  } = analytics;

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <h4>{jobs.length}</h4>
            <p>Total Jobs Found</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h4>{avgRelevanceScore}%</h4>
            <p>Avg. Match Score</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <h4>{jobsPerCompany?.length || 0}</h4>
            <p>Companies Hiring</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h4>{salaryStats ? `$${Math.round(salaryStats.avg / 1000)}k` : 'N/A'}</h4>
            <p>Avg. Salary</p>
          </div>
        </div>
      </div>

      {/* Top Skills Chart */}
      <div className="chart-card">
        <h3>
          <Code size={18} />
          Top Required Skills
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topSkills} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis 
              dataKey="skill" 
              type="category" 
              width={100}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Jobs per Company */}
      <div className="chart-card">
        <h3>
          <Building2 size={18} />
          Jobs by Company
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={jobsPerCompany?.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="company" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Jobs by Source */}
      <div className="chart-card">
        <h3>
          <Layers size={18} />
          Jobs by Source
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={jobsPerSource}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="count"
              nameKey="source"
              label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}
            >
              {jobsPerSource?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Score Distribution */}
      <div className="chart-card">
        <h3>
          <Award size={18} />
          Relevance Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={scoreDistribution}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="range"
              label={({ range, count }) => count > 0 ? `${range.split(' ')[0]}: ${count}` : ''}
            >
              {scoreDistribution?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Jobs Over Time */}
      <div className="chart-card full-width">
        <h3>
          <TrendingUp size={18} />
          Jobs Posted (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={jobsOverTime}>
            <defs>
              <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#4f46e5" 
              fillOpacity={1} 
              fill="url(#colorJobs)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Jobs by Location */}
      <div className="chart-card">
        <h3>
          <MapPin size={18} />
          Jobs by Location
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={jobsPerLocation?.slice(0, 8)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis 
              dataKey="location" 
              type="category" 
              width={120}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Jobs by Type */}
      <div className="chart-card">
        <h3>
          <Briefcase size={18} />
          Jobs by Type
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={jobsPerType}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="type"
              label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
            >
              {jobsPerType?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
