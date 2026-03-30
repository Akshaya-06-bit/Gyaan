import { useEffect, useState } from "react";
import { useI18n } from "../context/I18nContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function MentorSessions() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    mentorId: "",
    studentIds: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/sessions`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load sessions.");
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setError("");
    try {
      const payload = {
        title: form.title,
        date: form.date,
        mentorId: form.mentorId || null,
        studentIds: form.studentIds
          ? form.studentIds.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        notes: form.notes || "",
      };
      const res = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create session.");
      setSessions((prev) => [...prev, data]);
      setForm({ title: "", date: "", mentorId: "", studentIds: "", notes: "" });
    } catch (err) {
      setError(err.message || "Failed to create session.");
    }
  };

  const updateStatus = async (sessionId, status) => {
    try {
      const res = await fetch(`${API_URL}/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status.");
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status } : s))
      );
    } catch (err) {
      setError(err.message || "Failed to update status.");
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("Mentor Sessions")}</h1>
        <p className="text-sm text-gray-600">
          Plan and track mentoring sessions.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <form onSubmit={addSession} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Title
            </label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Algebra Revision"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Date & Time
            </label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Mentor ID (optional)
            </label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={form.mentorId}
              onChange={(e) => setForm({ ...form, mentorId: e.target.value })}
              placeholder="mentor uid"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Student IDs (comma separated)
            </label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={form.studentIds}
              onChange={(e) => setForm({ ...form, studentIds: e.target.value })}
              placeholder="uid1, uid2"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Notes
            </label>
            <textarea
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              rows="3"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Session goals and notes..."
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
            >
              Create Session
            </button>
          </div>
        </form>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          Upcoming Sessions
        </h3>
        <div className="mt-4 space-y-3 text-sm">
          {loading && <p className="text-gray-600">Loading...</p>}
          {!loading && sessions.length === 0 && (
            <p className="text-gray-600">No sessions scheduled yet.</p>
          )}
          {sessions.map((s) => (
            <div key={s.id} className="rounded-2xl border border-mist px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-gray-600">
                    {s.date} · {s.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(s.id, "completed")}
                    className="rounded-2xl border border-ink px-3 py-1 text-xs font-medium transition hover:bg-ink hover:text-paper"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateStatus(s.id, "canceled")}
                    className="rounded-2xl border border-ink px-3 py-1 text-xs font-medium transition hover:bg-ink hover:text-paper"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {s.notes && <p className="mt-2 text-xs text-gray-600">{s.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
