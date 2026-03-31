import "./Courses.css";

export default function CourseCard({ course, colors, onAction }) {
  const { title, thumb, url, subject, level, class: cls, channel, description } = course;
  const bg    = colors?.bg    || "#f0f9ff";
  const color = colors?.color || "#0284c7";
  const icon  = colors?.icon  || "📚";

  return (
    <div className="course-card card">
      <div className="course-thumb-wrap">
        <img
          src={thumb}
          alt={title}
          className="course-thumb"
          onError={(e) => {
            e.target.src = `https://placehold.co/320x180/b1f2ff/0284c7?text=${encodeURIComponent(subject)}`;
          }}
        />
        <span className="course-subject-badge" style={{ background: bg, color }}>
          {icon} {subject}
        </span>
      </div>

      <div className="course-body">
        <h4 className="course-title">{title}</h4>
        {description && <p className="course-desc">{description}</p>}
        <div className="course-meta">
          {cls && <span className="meta-chip">🎓 Class {cls}</span>}
          {channel && <span className="meta-chip">📺 {channel}</span>}
          <span className="meta-chip">
            {level === "Beginner" ? "🟢" : level === "Intermediate" ? "🟡" : "🔴"} {level}
          </span>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary start-btn"
        >
          ▶ Start Learning
        </a>

        <div className="course-ai-actions">
          <button className="ai-action-btn" onClick={() => onAction("quiz", course)}>🧠 Quiz</button>
          <button className="ai-action-btn" onClick={() => onAction("structure", course)}>📋 Structure</button>
          <button className="ai-action-btn" onClick={() => onAction("mindmap", course)}>🗺️ Mind Map</button>
        </div>
      </div>
    </div>
  );
}
