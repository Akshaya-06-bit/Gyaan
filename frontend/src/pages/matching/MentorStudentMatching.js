import { useState, useEffect } from 'react';
import {
  getStudentsForMatching,
  getMentorsForMatching,
  performAIMatching,
  assignMentorToStudent,
  bulkAssignMentors
} from '../../services/api';
import './MentorStudentMatching.css';

const MentorStudentMatching = () => {
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMatchingData();
  }, []);

  const loadMatchingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsRes, mentorsRes] = await Promise.all([
        getStudentsForMatching(),
        getMentorsForMatching()
      ]);

      setStudents(studentsRes.data.students);
      setMentors(mentorsRes.data.mentors);
    } catch (error) {
      console.error('Error loading matching data:', error);
      setError('Failed to load student and mentor data');
    } finally {
      setLoading(false);
    }
  };

  const performMatching = async () => {
    try {
      setMatchingLoading(true);
      setError(null);
      
      const response = await performAIMatching({
        students,
        mentors
      });

      setMatches(response.data.matches);
      setSelectedMatches(new Set());
    } catch (error) {
      console.error('Error performing AI matching:', error);
      setError('Failed to perform AI matching. Please try again.');
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleMatchSelection = (matchId) => {
    const newSelection = new Set(selectedMatches);
    if (newSelection.has(matchId)) {
      newSelection.delete(matchId);
    } else {
      newSelection.add(matchId);
    }
    setSelectedMatches(newSelection);
  };

  const handleAutoAssign = async () => {
    try {
      setLoading(true);
      
      // Assign all high-risk students first
      const highRiskMatches = matches.filter(match => match.isHighRisk);
      if (highRiskMatches.length > 0) {
        await bulkAssignMentors(highRiskMatches);
      }
      
      // Then assign selected matches
      const selectedMatchObjects = matches.filter(match => selectedMatches.has(match.studentId));
      if (selectedMatchObjects.length > 0) {
        await bulkAssignMentors(selectedMatchObjects);
      }
      
      // Reload data to get updated assignments
      await loadMatchingData();
      setMatches([]);
      setSelectedMatches(new Set());
      
      alert('Mentors assigned successfully!');
    } catch (error) {
      console.error('Error assigning mentors:', error);
      setError('Failed to assign mentors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAssign = async (studentId, mentorId) => {
    try {
      await assignMentorToStudent(studentId, mentorId);
      await loadMatchingData();
      setMatches([]);
      alert('Mentor assigned successfully!');
    } catch (error) {
      console.error('Error assigning mentor:', error);
      setError('Failed to assign mentor. Please try again.');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 75) return '#3b82f6'; // blue
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Good Match';
    if (score >= 60) return 'Fair Match';
    return 'Poor Match';
  };

  if (loading && students.length === 0) {
    return (
      <div className="mentor-matching">
        <div className="loading">Loading matching data...</div>
      </div>
    );
  }

  return (
    <div className="mentor-matching">
      <div className="matching-header">
        <h1>AI-Powered Mentor-Student Matching</h1>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{students.length}</span>
            <span className="stat-label">Students</span>
          </div>
          <div className="stat">
            <span className="stat-number">{mentors.length}</span>
            <span className="stat-label">Mentors</span>
          </div>
          <div className="stat">
            <span className="stat-number">{matches.length}</span>
            <span className="stat-label">Matches</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="matching-controls">
        <button
          className="btn btn-primary ai-match-btn"
          onClick={performMatching}
          disabled={matchingLoading || students.length === 0 || mentors.length === 0}
        >
          {matchingLoading ? '🤖 AI Matching...' : '🧠 Perform AI Matching'}
        </button>
        
        {matches.length > 0 && (
          <>
            <button
              className="btn btn-success auto-assign-btn"
              onClick={handleAutoAssign}
              disabled={loading}
            >
              ⚡ Auto Assign Mentors
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={() => {
                setMatches([]);
                setSelectedMatches(new Set());
              }}
            >
              🔄 Clear Matches
            </button>
          </>
        )}
      </div>

      {matches.length > 0 && (
        <div className="matches-section">
          <div className="section-header">
            <h2>AI Matching Results</h2>
            <div className="selection-info">
              {selectedMatches.size > 0 && (
                <span>{selectedMatches.size} matches selected</span>
              )}
            </div>
          </div>

          <div className="matches-grid">
            {matches.map((match) => (
              <div
                key={match.studentId}
                className={`match-card ${selectedMatches.has(match.studentId) ? 'selected' : ''} ${match.isHighRisk ? 'high-risk' : ''}`}
              >
                <div className="match-header">
                  <div className="student-info">
                    <h3>{match.studentName}</h3>
                    <span className="student-class">{match.studentClass}</span>
                    {match.isHighRisk && <span className="risk-badge">🔴 High Risk</span>}
                  </div>
                  <div className="selection-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedMatches.has(match.studentId)}
                      onChange={() => handleMatchSelection(match.studentId)}
                    />
                  </div>
                </div>

                <div className="match-score">
                  <div className="score-circle">
                    <div 
                      className="score-fill"
                      style={{ 
                        background: getScoreColor(match.score),
                        width: `${match.score}%` 
                      }}
                    ></div>
                    <span className="score-text">{match.score}%</span>
                  </div>
                  <div className="score-details">
                    <span className="score-label">{getScoreLabel(match.score)}</span>
                  </div>
                </div>

                <div className="match-details">
                  <div className="mentor-info">
                    <h4>👨‍🏫 {match.matchedMentor}</h4>
                    <p className="match-reason">{match.reason}</p>
                  </div>
                  
                  <div className="expertise-tags">
                    {match.mentorExpertise.slice(0, 3).map((subject, index) => (
                      <span key={index} className="expertise-tag">{subject}</span>
                    ))}
                  </div>
                </div>

                <div className="match-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleManualAssign(match.studentId, match.mentorId)}
                  >
                    ✅ Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && !matchingLoading && (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <h3>No Matches Yet</h3>
          <p>Click "Perform AI Matching" to generate optimal mentor-student pairs based on expertise, availability, and learning needs.</p>
        </div>
      )}
    </div>
  );
};

export default MentorStudentMatching;
