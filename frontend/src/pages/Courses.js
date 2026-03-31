import { useMemo, useState } from "react";
import Card from "../components/Card";
import { useI18n } from "../context/I18nContext";

const SUBJECTS = [
  "Math",
  "Science",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
];
const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function Courses() {
  const { t } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ age: "", cls: "8", subjects: ["Math"], level: "Beginner" });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSubject = (subject) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(subject)
        ? f.subjects.filter((s) => s !== subject)
        : [...f.subjects, subject],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subjects.length) { setError("Select at least one subject."); return; }
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
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message || "AI suggestion failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => { setModalOpen(false); setCourses([]); setError(""); };

  const summary = useMemo(() => {
    return `Class ${form.cls} · ${form.level} · ${form.subjects.join(", ")}`;
  }, [form.cls, form.level, form.subjects]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("My Courses")}</h1>
          <p className="text-sm text-gray-600">Simple, distraction-free course selection.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
        >
          + Generate Courses
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 text-sm text-gray-600 shadow-soft">
        No courses yet. Click "Generate Courses" to get AI recommendations.
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-mist bg-paper p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">AI Course Generator</h2>
              <button
                onClick={closeModal}
                className="rounded-2xl border border-mist px-3 py-1 text-xs transition hover:border-ink"
              >
                ✕ Close
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Age</label>
                <input
                  className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
                  type="number" min="5" max="20" placeholder="e.g. 14"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Class</label>
                <select
                  className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
                  value={form.cls}
                  onChange={(e) => setForm({ ...form, cls: e.target.value })}
                >
                  {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Level</label>
                <select
                  className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button type="button" key={s} onClick={() => toggleSubject(s)}
                      className={[
                        "rounded-2xl border px-3 py-2 text-xs font-medium transition",
                        form.subjects.includes(s)
                          ? "border-ink bg-ink text-paper"
                          : "border-mist bg-paper text-ink hover:bg-fog",
                      ].join(" ")}
                    >{s}</button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3 flex items-center gap-3">
                <button
                  type="submit" disabled={loading}
                  className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper disabled:opacity-60"
                >
                  {loading ? "Finding Courses..." : "Find Courses"}
                </button>
                <span className="text-xs text-gray-600">{summary}</span>
              </div>

              {error && <div className="md:col-span-3 text-sm text-red-600">{error}</div>}
            </form>

            {/* Results inside modal */}
            {courses.length > 0 && (
              <div className="mt-6 max-h-72 overflow-y-auto space-y-3 pr-1">
                {courses.map((course, idx) => (
                  <div key={`${course.title}-${idx}`}
                    className="rounded-2xl border border-mist bg-fog p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{course.title}</p>
                        <p className="mt-1 text-xs text-gray-600">{course.channel} · {course.subject}</p>
                        <p className="mt-1 text-xs text-gray-500">{course.description}</p>
                      </div>
                      <a
                        href={course.url} target="_blank" rel="noreferrer"
                        className="shrink-0 rounded-2xl border border-ink px-3 py-1 text-xs font-medium transition hover:bg-ink hover:text-paper"
                      >
                        Start
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
