import { useState } from "react";
import CourseCard from "./CourseCard";
import "./Courses.css";

const SUBJECTS = ["Math", "Science", "English", "History", "Geography", "Computer Science", "Physics", "Chemistry", "Biology"];
const CLASSES  = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const LEVELS   = ["Beginner", "Intermediate", "Advanced"];

export const subjectColors = {
  Math:               { bg: "#dbeafe", color: "#1d4ed8", icon: "📐" },
  Science:            { bg: "#dcfce7", color: "#15803d", icon: "🔬" },
  English:            { bg: "#fef3c7", color: "#b45309", icon: "📖" },
  History:            { bg: "#ede9fe", color: "#6d28d9", icon: "🏛️" },
  Geography:          { bg: "#ffedd5", color: "#c2410c", icon: "🌍" },
  "Computer Science": { bg: "#e0f2fe", color: "#0369a1", icon: "💻" },
  Physics:            { bg: "#fce7f3", color: "#be185d", icon: "⚛️" },
  Chemistry:          { bg: "#ecfdf5", color: "#065f46", icon: "🧪" },
  Biology:            { bg: "#fef9c3", color: "#854d0e", icon: "🧬" },
};

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function MyCourses() {
  const [modalOpen, setModalOpen]     = useState(false);
  const [form, setForm]               = useState({ age: "", cls: "8", subjects: ["Math"], level: "Beginner" });
  const [courses, setCourses]         = useState([]);
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [filter, setFilter]           = useState("All");
  const [error, setError]             = useState("");

  // AI tool modal state
  const [aiModal, setAiModal]         = useState(null); // { type, course }
  const [aiResult, setAiResult]       = useState(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiError, setAiError]         = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const toggleSubject = (subject) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(subject)
        ? f.subjects.filter((s) => s !== subject)
        : [...f.subjects, subject],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subjects.length) return setError("Select at least one subject.");
    setError("");
    setLoading(true);
    setCourses([]);
    try {
      const res = await fetch(`${API_URL}/courses/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get suggestions");
      setCourses(data.courses);
      setSubmitted(true);
      setFilter("All");
      setModalOpen(false);
    } catch (err) {
      setError(err.message || "AI suggestion failed.");
    } finally {
      setLoading(false);
    }
  };

  const openAiModal = async (type, course) => {
    setAiModal({ type, course });
    setAiResult(null);
    setAiError("");
    setAiLoading(true);
    setQuizAnswers({});
    setQuizSubmitted(false);

    const endpointMap = { quiz: "quiz", structure: "structure", mindmap: "mindmap" };
    try {
      const res = await fetch(`${API_URL}/courses/${endpointMap[type]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: course.subject,
          cls: course.class,
          level: course.level,
          title: course.title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI failed.");
      setAiResult(data.quiz || data.structure || data.mindmap);
    } catch (err) {
      setAiError(err.message || "AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const closeAiModal = () => { setAiModal(null); setAiResult(null); setAiError(""); };
  const closeModal   = () => { setModalOpen(false); setError(""); };

  const filtered       = filter === "All" ? courses : courses.filter((c) => c.subject === filter);
  const activeSubjects = [...new Set(courses.map((c) => c.subject))];

  return (
    <div className="my-courses-page">

      {/* Page header */}
      <div className="courses-page-header">
        <div>
          <h2>📚 My Courses</h2>
          <p>Get AI-powered YouTube playlist recommendations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          🤖 Generate Courses
        </button>
      </div>

      {!submitted && (
        <div className="empty-state card">
          <span>🎓</span>
          <p>Click "Generate Courses" to get AI recommendations.</p>
        </div>
      )}

      {submitted && courses.length > 0 && (
        <>
          <div className="courses-section-header">
            <div>
              <h3>📚 AI-Suggested Courses <span className="course-count">({courses.length} playlists)</span></h3>
              <p className="ai-badge">✨ Powered by Groq AI (Llama 3)</p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div className="filter-tabs">
                {["All", ...activeSubjects].map((tab) => {
                  const cfg = subjectColors[tab] || { icon: "📋" };
                  return (
                    <button key={tab}
                      className={`filter-tab ${filter === tab ? "active" : ""}`}
                      onClick={() => setFilter(tab)}
                    >
                      {cfg.icon} {tab}
                    </button>
                  );
                })}
              </div>
              <button className="btn btn-outline" onClick={() => setModalOpen(true)}>✏️ Regenerate</button>
            </div>
          </div>
          <div className="courses-grid">
            {filtered.map((course, i) => (
              <CourseCard
                key={i}
                course={course}
                colors={subjectColors[course.subject] || { bg: "#f1f5f9", color: "#475569", icon: "📚" }}
                onAction={openAiModal}
              />
            ))}
          </div>
        </>
      )}

      {/* Generate Courses Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🤖 AI Course Finder</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row-3">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" min="5" max="20" placeholder="e.g. 14"
                    value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Class</label>
                  <select value={form.cls} onChange={(e) => setForm({ ...form, cls: e.target.value })}>
                    {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Learning Level</label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Subjects <span className="label-hint">(select all that apply)</span></label>
                <div className="subject-toggle-row">
                  {SUBJECTS.map((s) => {
                    const cfg = subjectColors[s] || { bg: "#f1f5f9", color: "#475569", icon: "📚" };
                    const active = form.subjects.includes(s);
                    return (
                      <button type="button" key={s}
                        className={`subject-toggle ${active ? "active" : ""}`}
                        style={active ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                        onClick={() => toggleSubject(s)}
                      >
                        {cfg.icon} {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              {error && <p className="error-msg">⚠️ {error}</p>}
              <button className="btn btn-primary ai-submit-btn" type="submit" disabled={loading}>
                {loading ? <span className="loading-row"><span className="spinner" /> Finding courses...</span> : "🤖 Find My Courses"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Tool Modal (Quiz / Structure / Mind Map) */}
      {aiModal && (
        <div className="modal-backdrop" onClick={closeAiModal}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {aiModal.type === "quiz" && "🧠 Quiz"}
                {aiModal.type === "structure" && "📋 Study Structure"}
                {aiModal.type === "mindmap" && "🗺️ Mind Map"}
                {" — "}{aiModal.course.subject}
              </h2>
              <button className="modal-close" onClick={closeAiModal}>✕</button>
            </div>

            {aiLoading && (
              <div className="ai-loading-inner">
                <span className="ai-loading-icon">🤖</span>
                <div>
                  <p className="ai-loading-title">Groq AI is generating...</p>
                  <p className="ai-loading-sub">{aiModal.course.title}</p>
                </div>
              </div>
            )}

            {aiError && <p className="error-msg">⚠️ {aiError}</p>}

            {/* Quiz Result */}
            {aiModal.type === "quiz" && aiResult && (
              <div className="ai-result-body">
                {aiResult.map((q, qi) => (
                  <div key={qi} className="quiz-question">
                    <p className="quiz-q-text">{qi + 1}. {q.question}</p>
                    <div className="quiz-options">
                      {q.options.map((opt, oi) => {
                        let cls = "quiz-option";
                        if (quizSubmitted) {
                          if (opt === q.answer) cls += " correct";
                          else if (opt === quizAnswers[qi]) cls += " wrong";
                        } else if (quizAnswers[qi] === opt) cls += " selected";
                        return (
                          <button key={oi} className={cls}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers((a) => ({ ...a, [qi]: opt }))}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="quiz-explanation">💡 {q.explanation}</p>
                    )}
                  </div>
                ))}
                {!quizSubmitted ? (
                  <button className="btn btn-primary"
                    disabled={Object.keys(quizAnswers).length < aiResult.length}
                    onClick={() => setQuizSubmitted(true)}
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <div className="quiz-score">
                    Score: {aiResult.filter((q, i) => quizAnswers[i] === q.answer).length} / {aiResult.length}
                  </div>
                )}
              </div>
            )}

            {/* Structure Result */}
            {aiModal.type === "structure" && aiResult && (
              <div className="ai-result-body">
                <h3 className="structure-title">{aiResult.title}</h3>
                <p className="structure-duration">⏱ {aiResult.duration}</p>
                <div className="structure-weeks">
                  {aiResult.weeks?.map((w, i) => (
                    <div key={i} className="structure-week">
                      <div className="week-header">Week {w.week} — {w.theme}</div>
                      <p className="week-goal">🎯 {w.goal}</p>
                      <ul className="week-topics">
                        {w.topics?.map((t, j) => <li key={j}>{t}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                {aiResult.tips?.length > 0 && (
                  <div className="structure-tips">
                    <p className="tips-label">💡 Tips</p>
                    <ul>{aiResult.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {/* Mind Map Result */}
            {aiModal.type === "mindmap" && aiResult && (
              <div className="ai-result-body">
                <div className="mindmap-center">{aiResult.center}</div>
                <div className="mindmap-branches">
                  {aiResult.branches?.map((branch, i) => (
                    <div key={i} className="mindmap-branch" style={{ borderColor: branch.color }}>
                      <div className="branch-label" style={{ background: branch.color, color: "#fff" }}>
                        {branch.label}
                      </div>
                      <ul className="branch-subtopics">
                        {branch.subtopics?.map((s, j) => <li key={j}>{s}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
