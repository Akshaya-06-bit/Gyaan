import "./Progress.css";

const riskConfig = {
  low:    { color: "#22c55e", bg: "#dcfce7", icon: "🟢", label: "Low Risk" },
  medium: { color: "#f59e0b", bg: "#fef3c7", icon: "🟡", label: "Medium Risk" },
  high:   { color: "#ef4444", bg: "#fee2e2", icon: "🔴", label: "High Risk — Needs Attention" },
};

export default function AiInsightsCard({ analysis }) {
  const {
    riskLevel, overallAvg, weakSubjects, decliningSubjects,
    strongSubjects, suggestions, analyzedAt,
  } = analysis;

  const risk = riskConfig[riskLevel] || riskConfig.low;

  return (
    <div className="card ai-insights-card">
      <div className="ai-insights-header">
        <div className="ai-title">
          <span className="ai-icon">🤖</span>
          <div>
            <h3>AI Analysis</h3>
            <p className="ai-time">
              Last analyzed: {new Date(analyzedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="risk-badge" style={{ background: risk.bg, color: risk.color }}>
          {risk.icon} {risk.label}
        </div>
      </div>

      {/* Warning banner for high risk */}
      {riskLevel === "high" && (
        <div className="risk-warning">
          ⚠️ This student is falling behind. Immediate mentor intervention recommended.
        </div>
      )}

      <div className="ai-stats-row">
        <div className="ai-stat">
          <span className="ai-stat-value">{overallAvg}%</span>
          <span className="ai-stat-label">Overall Average</span>
        </div>
        <div className="ai-stat">
          <span className="ai-stat-value" style={{ color: "#ef4444" }}>{weakSubjects.length}</span>
          <span className="ai-stat-label">Weak Subjects</span>
        </div>
        <div className="ai-stat">
          <span className="ai-stat-value" style={{ color: "#f59e0b" }}>{decliningSubjects.length}</span>
          <span className="ai-stat-label">Declining</span>
        </div>
        <div className="ai-stat">
          <span className="ai-stat-value" style={{ color: "#22c55e" }}>{strongSubjects.length}</span>
          <span className="ai-stat-label">Strong</span>
        </div>
      </div>

      {weakSubjects.length > 0 && (
        <div className="ai-section">
          <p className="ai-section-title">⚠️ Weak Areas</p>
          <div className="tag-row">
            {weakSubjects.map((s) => (
              <span key={s} className="subject-tag tag-weak">{s}</span>
            ))}
          </div>
        </div>
      )}

      {decliningSubjects.length > 0 && (
        <div className="ai-section">
          <p className="ai-section-title">📉 Declining Subjects</p>
          <div className="tag-row">
            {decliningSubjects.map((s) => (
              <span key={s} className="subject-tag tag-declining">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="ai-section">
        <p className="ai-section-title">💡 Improvement Suggestions</p>
        <ul className="suggestions-list">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
