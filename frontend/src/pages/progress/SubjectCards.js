import "./Progress.css";

export default function SubjectCards({ subjectAverages, weakSubjects, decliningSubjects }) {
  return (
    <div className="subject-cards-grid">
      {subjectAverages.map(({ subject, avg, entries }) => {
        const isWeak     = weakSubjects.includes(subject);
        const isDeclining = decliningSubjects.includes(subject);
        const cardClass  = isWeak ? "subject-card weak" : isDeclining ? "subject-card declining" : "subject-card";
        const trend      = entries.length >= 2
          ? entries[entries.length - 1].pct - entries[entries.length - 2].pct
          : 0;

        return (
          <div className={`card ${cardClass}`} key={subject}>
            <div className="subject-top">
              <span className="subject-name">{subject}</span>
              {isWeak && <span className="subject-tag tag-weak">⚠️ Weak</span>}
              {isDeclining && !isWeak && <span className="subject-tag tag-declining">📉 Declining</span>}
              {!isWeak && !isDeclining && <span className="subject-tag tag-good">✅ Good</span>}
            </div>

            <div className="subject-avg">{avg}%</div>

            <div className="subject-bar-track">
              <div
                className="subject-bar-fill"
                style={{
                  width: `${avg}%`,
                  background: isWeak ? "#ef4444" : isDeclining ? "#f59e0b" : "#22c55e",
                }}
              />
            </div>

            <div className="subject-meta">
              <span>{entries.length} test{entries.length !== 1 ? "s" : ""}</span>
              <span className={trend >= 0 ? "trend-up" : "trend-down"}>
                {trend >= 0 ? `▲ +${trend}%` : `▼ ${trend}%`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
