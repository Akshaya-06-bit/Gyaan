import { useState, useEffect } from 'react';
import { getDashboardOverview, getStudents, getMentors, getPerformance, getAIInsights } from '../../services/api';
import './NGODashboard.css';

const NGODashboard = () => {
  const [overview, setOverview] = useState(null);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    riskLevel: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (overview) {
      loadStudents();
    }
  }, [filters, overview]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [overviewRes, mentorsRes, performanceRes, insightsRes] = await Promise.all([
        getDashboardOverview(),
        getMentors(),
        getPerformance(),
        getAIInsights()
      ]);

      setOverview(overviewRes.data);
      setMentors(mentorsRes.data.mentors);
      setPerformance(performanceRes.data);
      setInsights(insightsRes.data.insights);
    } catch (error) {
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const studentsRes = await getStudents(filters);
      setStudents(studentsRes.data.students);
    } catch (error) {
      console.error('Students loading error:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const downloadReport = () => {
    // Create a simple text report for now
    const report = `
NGO Learning Platform Dashboard Report
Generated: ${new Date().toLocaleString()}

OVERVIEW:
- Total Students: ${overview?.totalStudents || 0}
- Total Mentors: ${overview?.totalMentors || 0}
- Active Sessions: ${overview?.activeSessions || 0}
- Students at Risk: ${overview?.studentsAtRisk || 0}

STUDENTS AT RISK:
${overview?.atRiskStudents?.map(s => `- ${s.name} (${s.class || 'N/A'})`).join('\n') || 'None'}

AI INSIGHTS:
${insights.map(insight => `• ${insight}`).join('\n')}

MENTORS:
${mentors.map(m => `- ${m.name}: ${m.assignedStudents} students, Expertise: ${m.expertise.join(', ')}`).join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="ngo-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="ngo-dashboard">
      <div className="dashboard-header">
        <h1>NGO Dashboard</h1>
        <button className="download-btn" onClick={downloadReport}>
          📊 Download Report
        </button>
      </div>

      {/* Overview Section */}
      <section className="overview-section">
        <h2>Overview Dashboard</h2>
        <div className="overview-cards">
          <div className="stat-card">
            <div className="stat-number">{overview?.totalStudents || 0}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overview?.totalMentors || 0}</div>
            <div className="stat-label">Total Mentors</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overview?.activeSessions || 0}</div>
            <div className="stat-label">Active Sessions</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-number">{overview?.studentsAtRisk || 0}</div>
            <div className="stat-label">Students at Risk</div>
          </div>
        </div>
      </section>

      {/* AI Insights Panel */}
      <section className="insights-section">
        <h2>AI Insights Panel</h2>
        <div className="insights-cards">
          {insights.map((insight, index) => (
            <div key={index} className="insight-card">
              <div className="insight-icon">🤖</div>
              <div className="insight-text">{insight}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Analytics */}
      <section className="students-section">
        <h2>Student Analytics</h2>
        
        {/* Filters */}
        <div className="filters">
          <select 
            value={filters.class} 
            onChange={(e) => handleFilterChange('class', e.target.value)}
          >
            <option value="">All Classes</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
          </select>
          
          <select 
            value={filters.riskLevel} 
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
          >
            <option value="">All Risk Levels</option>
            <option value="low">Good</option>
            <option value="medium">Average</option>
            <option value="high">At Risk</option>
          </select>
        </div>

        {/* Students Table */}
        <div className="students-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Assigned Mentor</th>
                <th>Progress Status</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className={student.riskLevel === 'high' ? 'at-risk' : ''}>
                  <td>{student.name}</td>
                  <td>{student.class}</td>
                  <td>{student.assignedMentor || 'Not assigned'}</td>
                  <td>
                    <span className={`status-badge ${student.progressStatus.toLowerCase().replace(' ', '-')}`}>
                      {student.progressStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`risk-badge ${student.riskLevel}`}>
                      {student.riskLevel === 'high' ? '🔴' : student.riskLevel === 'medium' ? '🟡' : '🟢'} 
                      {student.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Performance Insights */}
      <section className="performance-section">
        <h2>Performance Insights</h2>
        <div className="performance-charts">
          <div className="chart-container">
            <h3>Average Scores per Subject</h3>
            <div className="bar-chart">
              {performance?.subjectScores && Object.entries(performance.subjectScores).map(([subject, data]) => (
                <div key={subject} className="bar-item">
                  <div className="bar-label">{subject}</div>
                  <div className="bar">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${data.average}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{data.average.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <h3>Improvement Trends</h3>
            <div className="line-chart">
              {performance?.trends?.map((trend, index) => (
                <div key={index} className="trend-item">
                  <div className="trend-month">{trend.month}</div>
                  <div className="trend-score">{trend.averageScore}%</div>
                  <div className={`trend-indicator ${trend.improvement ? 'up' : 'down'}`}>
                    {trend.improvement ? '📈' : '📉'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Management */}
      <section className="mentors-section">
        <h2>Mentor Management</h2>
        <div className="mentors-grid">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="mentor-card">
              <div className="mentor-header">
                <h3>{mentor.name}</h3>
                <span className={`availability ${mentor.availability.toLowerCase()}`}>
                  {mentor.availability}
                </span>
              </div>
              <div className="mentor-details">
                <div className="mentor-info">
                  <strong>Expertise:</strong> {mentor.expertise.join(', ')}
                </div>
                <div className="mentor-info">
                  <strong>Assigned Students:</strong> {mentor.assignedStudents}
                </div>
                <div className="mentor-info">
                  <strong>Joined:</strong> {new Date(mentor.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NGODashboard;
