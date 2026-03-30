import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStudentSummary, runAiAnalysis } from "../../services/api";
import ScoreChart from "./ScoreChart";
import SubjectCards from "./SubjectCards";
import AiInsightsCard from "./AiInsightsCard";
import AddScoreModal from "./AddScoreModal";
import "./Progress.css";

export default function StudentProgress() {
  const { user } = useAuth();
  const studentId = user?.uid;

  const [summary, setSummary]     = useState(null);
  const [analysis, setAnalysis]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]         = useState("");

  const loadData = async () => {
    if (!studentId) {
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getStudentSummary(studentId);
      setSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load progress data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    try {
      const res = await runAiAnalysis(studentId);
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "AI analysis failed.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [studentId]);

  if (!studentId) {
    return (
      <div className="progress-page">
        <div className="empty-state card">
          <span>📭</span>
          <p>No student selected. Please sign in to view progress.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="progress-loading">Loading progress data...</div>;

  return (
    <div className="progress-page">
      {/* Header */}
      <div className="progress-header">
        <div>
          <h2>📈 Student Progress</h2>
          <p className="progress-subtitle">
            {summary?.student?.name || "Student"} — Track performance across all subjects
          </p>
        </div>
        <div className="progress-actions">
          <button className="btn btn-outline" onClick={() => setShowModal(true)}>
            + Add Score
          </button>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={aiLoading}>
            {aiLoading ? "Analyzing..." : "🤖 Run AI Analysis"}
          </button>
        </div>
      </div>

      {error && <div className="progress-error">{error}</div>}

      {!summary?.scores?.length ? (
        <div className="empty-state card">
          <span>📭</span>
          <p>No test scores yet. Add a score to get started.</p>
        </div>
      ) : (
        <>
          {/* AI Insights */}
          {analysis && <AiInsightsCard analysis={analysis} />}

          {/* Subject Cards */}
          <SubjectCards
            subjectAverages={summary.subjectAverages}
            weakSubjects={analysis?.weakSubjects || []}
            decliningSubjects={analysis?.decliningSubjects || []}
          />

          {/* Chart */}
          <div className="card chart-section">
            <h3>📊 Performance Over Time</h3>
            <ScoreChart scores={summary.scores} />
          </div>

          {/* Recent Scores Table */}
          <div className="card">
            <h3>🗒️ Recent Test Scores</h3>
            <table className="scores-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...summary.scores].reverse().slice(0, 10).map((s) => {
                  const pct = Math.round((s.score / s.maxScore) * 100);
                  const status = pct >= 75 ? "good" : pct >= 60 ? "average" : "weak";
                  return (
                    <tr key={s.id}>
                      <td>{s.testName}</td>
                      <td>{s.subject}</td>
                      <td>{s.score}/{s.maxScore} <span className="pct">({pct}%)</span></td>
                      <td>{new Date(s.date).toLocaleDateString()}</td>
                      <td><span className={`status-badge status-${status}`}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <AddScoreModal
          studentId={studentId}
          onClose={() => setShowModal(false)}
          onAdded={loadData}
        />
      )}
    </div>
  );
}
