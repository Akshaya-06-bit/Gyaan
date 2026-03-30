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
  const [form, setForm]           = useState({ age: "", cls: "8", subjects: ["Math"], level: "Beginner" });
  const [courses, setCourses]     = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [filter, setFilter]       = useState("All");
  const [error, setError]         = useState("");

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
    } catch (err) {
      setError(err.message || "AI suggestion failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "All" ? courses : courses.filter((c) => c.subject === filter);
  const activeSubjects = [...new Set(courses.map((c) => c.subject))];

  return (
    <div className="my-courses-page">

      {/* Profile Form */}
      <div className="card profile-form-card">
        <div className="profile-form-header">
          <div>
            <h2>🤖 AI-Powered Course Finder</h2>
            <p>Tell us about yourself — Groq AI will suggest the best YouTube playlists for you.</p>
          </div>
          {submitted && (
            <button className="btn btn-outline" onClick={() => { setSubmitted(false); setCourses([]); }}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row-3">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number" min="5" max="20" placeholder="e.g. 14"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
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
              {loading ? (
                <span className="loading-row">
                  <span className="spinner" /> Groq AI is finding your courses...
                </span>
              ) : "🤖 Find My Courses with AI"}
            </button>
          </form>
        ) : (
          <div className="profile-summary">
            <div className="profile-chip">🎓 Class {form.cls}</div>
            {form.age && <div className="profile-chip">👤 Age {form.age}</div>}
            <div className="profile-chip">📊 {form.level}</div>
            {form.subjects.map((s) => {
              const cfg = subjectColors[s] || { bg: "#f1f5f9", color: "#475569", icon: "📚" };
              return (
                <div key={s} className="profile-chip" style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon} {s}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="ai-loading-card card">
          <div className="ai-loading-inner">
            <span className="ai-loading-icon">🤖</span>
            <div>
              <p className="ai-loading-title">Groq AI is analyzing your profile...</p>
              <p className="ai-loading-sub">Finding the best YouTube playlists for Class {form.cls} · {form.level} · {form.subjects.join(", ")}</p>
            </div>
          </div>
          <div className="skeleton-grid">
            {[1,2,3].map((i) => <div key={i} className="skeleton-card" />)}
          </div>
        </div>
      )}

      {/* Results */}
      {submitted && courses.length > 0 && (
        <>
          <div className="courses-section-header">
            <div>
              <h3>📚 AI-Suggested Courses <span className="course-count">({courses.length} playlists)</span></h3>
              <p className="ai-badge">✨ Powered by Groq AI (Llama 3)</p>
            </div>
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
          </div>

          <div className="courses-grid">
            {filtered.map((course, i) => (
              <CourseCard
                key={i}
                course={course}
                colors={subjectColors[course.subject] || { bg: "#f1f5f9", color: "#475569", icon: "📚" }}
              />
            ))}
          </div>
        </>
      )}

      {submitted && courses.length === 0 && !loading && (
        <div className="empty-state card">
          <span>📭</span>
          <p>No courses found. Try different subjects or class.</p>
        </div>
      )}
    </div>
  );
}
